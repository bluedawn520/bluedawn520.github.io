import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const repo = 'bluedawn520/bluedawn520.github.io';
const branch = 'main';
const sourceDir = path.resolve('/Users/jeff/Demo/self/Github/bluedawn520.github.io');
const outputDir = path.resolve('src/content/blog');
const assetOutputDir = path.resolve('public/migrated-assets');
const assetPublicRoot = '/migrated-assets';
const articlePathPattern = /^\d{4}\/\d{2}\/\d{2}\/.+\/index\.html$/;
const assetJobs = new Map();

const entityMap = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ldquo: '"',
	rdquo: '"',
	lsquo: "'",
	rsquo: "'",
	mdash: '-',
	ndash: '-',
	hellip: '...',
	asymp: '~',
};

function decodeHtml(value = '') {
	return value
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
		.replace(/&([a-z]+);/gi, (_, name) => entityMap[name] ?? `&${name};`);
}

function stripTags(value = '') {
	return decodeHtml(
		value
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?<\/style>/gi, '')
			.replace(/<a[^>]*class="headerlink"[^>]*><\/a>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<[^>]+>/g, ''),
	)
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function frontmatterString(value = '') {
	return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function slugFromPostPath(postPath) {
	return decodeURIComponent(postPath)
		.replace(/\/index\.html$/, '')
		.split('/')
		.at(-1)
		.normalize('NFKD')
		.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();
}

function extractMeta(html, propertyOrName) {
	const patterns = [
		new RegExp(`<meta\\s+(?:property|name)=["']${propertyOrName}["']\\s+content=["']([^"']*)["'][^>]*>`, 'i'),
		new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*(?:property|name)=["']${propertyOrName}["'][^>]*>`, 'i'),
	];
	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match) {
			return decodeHtml(match[1]);
		}
	}
	return '';
}

function extractAllMeta(html, property) {
	return [...html.matchAll(new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']*)["'][^>]*>`, 'gi'))]
		.map((match) => decodeHtml(match[1]))
		.filter(Boolean);
}

function unique(values) {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractCategory(html) {
	return unique(
		[...html.matchAll(/<span itemprop="about"[\s\S]*?<span itemprop="name">([\s\S]*?)<\/span>[\s\S]*?<\/span>/gi)]
			.map((match) => stripTags(match[1])),
	).join(' / ');
}

function convertCodeFigures(html) {
	return html.replace(/<figure class="highlight\s*([^"]*)">([\s\S]*?)<\/figure>/gi, (_, lang, figure) => {
		const codeCell = figure.match(/<td class="code"><pre>([\s\S]*?)<\/pre><\/td>/i)?.[1] ?? figure;
		const code = stripTags(codeCell.replace(/<br\s*\/?>/gi, '\n'));
		const cleanLang = lang.replace(/[^a-z0-9+#-]/gi, '').replace('++', 'pp');
		return `\n\n\`\`\`${cleanLang}\n${code}\n\`\`\`\n\n`;
	});
}

function queueImage(src, postPath) {
	const postDir = postPath.replace(/index\.html$/, '');
	const decodedSrc = decodeURIComponent(decodeHtml(src));
	if (/^https?:\/\//i.test(decodedSrc)) {
		const parsedUrl = new URL(decodedSrc);
		const extension = path.extname(parsedUrl.pathname) || '.img';
		const hash = createHash('sha1').update(decodedSrc).digest('hex').slice(0, 10);
		const filename = `${parsedUrl.pathname.replace(/^\/+/, '').replace(extension, '')}-${hash}${extension}`;
		const assetPath = path.posix.join('external', parsedUrl.hostname, filename);
		assetJobs.set(assetPath, {
			sourceUrl: decodedSrc,
			outputPath: path.join(assetOutputDir, assetPath),
			type: 'remote',
		});
		return `${assetPublicRoot}/${encodeURI(assetPath)}`;
	}
	const assetPath = decodedSrc.startsWith('/') ? decodedSrc.slice(1) : `${postDir}${decodedSrc}`;
	assetJobs.set(assetPath, {
		sourcePath: path.join(sourceDir, assetPath),
		outputPath: path.join(assetOutputDir, assetPath),
		type: 'local',
	});
	return `${assetPublicRoot}/${encodeURI(assetPath)}`;
}

function convertImages(html, postPath) {
	return html.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (tag, src) => {
		const alt = decodeHtml(tag.match(/\salt=["']([^"']*)["']/i)?.[1] ?? '');
		return `![${alt}](${queueImage(src, postPath)})`;
	});
}

function convertTables(html) {
	return html.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
		const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
			.map((row) =>
				[...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
					stripTags(cell[1]).replace(/\|/g, '\\|').replace(/\n+/g, ' '),
				),
			)
			.filter((row) => row.length > 0);

		if (rows.length === 0) {
			return '';
		}

		const width = Math.max(...rows.map((row) => row.length));
		const normalized = rows.map((row) => [...row, ...Array(width - row.length).fill('')]);
		return [
			'',
			`| ${normalized[0].join(' | ')} |`,
			`| ${Array(width).fill('---').join(' | ')} |`,
			...normalized.slice(1).map((row) => `| ${row.join(' | ')} |`),
			'',
		].join('\n');
	});
}

function htmlToMarkdown(html, postPath) {
	let body = html
		.replace(/<div class="reward-container">[\s\S]*?<\/div>\s*<\/div>/gi, '')
		.replace(/<div class="post-button">[\s\S]*?<\/div>/gi, '');
	body = convertImages(convertTables(convertCodeFigures(body)), postPath);
	body = body
		.replace(/<a id="more"><\/a>/gi, '')
		.replace(/<div class="table-container">([\s\S]*?)<\/div>/gi, '$1')
		.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
			const title = stripTags(text);
			return title ? `\n\n${'#'.repeat(Number(level))} ${title}\n\n` : '\n\n';
		})
		.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => {
			const quote = htmlToMarkdown(text, postPath)
				.split('\n')
				.map((line) => (line.trim() ? `> ${line}` : '>'))
				.join('\n');
			return `\n\n${quote}\n\n`;
		})
		.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n\n${stripTags(text)}\n\n`)
		.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `\n- ${stripTags(text).replace(/\n+/g, '\n  ')}\n`)
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
		.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, text) => `**${stripTags(text)}**`)
		.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, text) => `**${stripTags(text)}**`)
		.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, text) => `*${stripTags(text)}*`)
		.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, text) => `*${stripTags(text)}*`)
		.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, text) => `\`${stripTags(text)}\``)
		.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
			const label = stripTags(text) || href;
			return `[${label}](${decodeHtml(href)})`;
		})
		.replace(/<[^>]+>/g, '');

	return decodeHtml(body)
		.replace(/^> (\| .*)$/gm, '$1')
		.replace(/^>\s*$/gm, '')
		.replace(/[ \t]+$/gm, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
		.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi, (_, alt, src) => `![${alt}](${queueImage(src, postPath)})`);
}

async function fetchText(url) {
	let lastError;
	for (let attempt = 1; attempt <= 3; attempt++) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 45_000);
		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'bluedawn520-blog-migrator',
				},
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			return await response.text();
		} catch (error) {
			lastError = error;
			console.warn(`Fetch attempt ${attempt} failed for ${url}: ${error.message}`);
		} finally {
			clearTimeout(timeout);
		}
	}
	throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? 'unknown error'}`);
}

async function fetchBytes(url) {
	let lastError;
	for (let attempt = 1; attempt <= 3; attempt++) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 45_000);
		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'bluedawn520-blog-migrator',
				},
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			return Buffer.from(await response.arrayBuffer());
		} catch (error) {
			lastError = error;
			console.warn(`Asset fetch attempt ${attempt} failed for ${url}: ${error.message}`);
		} finally {
			clearTimeout(timeout);
		}
	}
	throw new Error(`Failed to fetch asset ${url}: ${lastError?.message ?? 'unknown error'}`);
}

async function syncAssets() {
	const synced = [];
	for (const [assetPath, job] of [...assetJobs.entries()].sort(([a], [b]) => a.localeCompare(b))) {
		await mkdir(path.dirname(job.outputPath), { recursive: true });
		if (job.type === 'local') {
			await cp(job.sourcePath, job.outputPath);
		} else {
			const bytes = await fetchBytes(job.sourceUrl);
			await writeFile(job.outputPath, bytes);
		}
		synced.push(assetPath);
	}
	return synced;
}

async function walkFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkFiles(fullPath)));
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}
	return files;
}

async function fetchPostPaths() {
	const files = await walkFiles(sourceDir);
	return files
		.map((filePath) => path.relative(sourceDir, filePath).split(path.sep).join('/'))
		.filter((itemPath) => articlePathPattern.test(itemPath))
		.sort();
}

async function fetchPost(postPath) {
	return await readFile(path.join(sourceDir, postPath), 'utf-8');
}

async function migrate(postPath) {
	const html = await fetchPost(postPath);
	const title =
		extractMeta(html, 'og:title') ||
		stripTags(html.match(/<h1 class="post-title"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? slugFromPostPath(postPath));
	const pubDate = extractMeta(html, 'article:published_time') || `${postPath.slice(0, 10).replaceAll('/', '-')}T00:00:00+08:00`;
	const updatedDate = extractMeta(html, 'article:modified_time');
	const tags = unique(extractAllMeta(html, 'article:tag'));
	const category = extractCategory(html);
	const bodyHtml =
		html.match(/<div class="post-body"[^>]*>([\s\S]*?)<\/div>\s*<footer class="post-footer">/i)?.[1] ??
		html.match(/<div class="post-body"[^>]*>([\s\S]*?)<\/div><div class="reward-container">/i)?.[1];

	if (!bodyHtml) {
		throw new Error(`Could not extract post body from ${postPath}`);
	}

	const slug = slugFromPostPath(postPath);
	const markdown = htmlToMarkdown(bodyHtml, postPath);
	const description =
		extractMeta(html, 'description') ||
		markdown
			.replace(/^> 本文从旧.*$/m, '')
			.replace(/[#>*_`|\-[\]()]/g, '')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 90) ||
		`Migrated from ${repo}`;
	const sourceUrl = `https://github.com/${repo}/blob/${branch}/${postPath}`;
	const frontmatter = [
		'---',
		`title: "${frontmatterString(title)}"`,
		`description: "${frontmatterString(description)}"`,
		`pubDate: "${frontmatterString(pubDate)}"`,
		updatedDate ? `updatedDate: "${frontmatterString(updatedDate)}"` : '',
		`tags: [${tags.map((tag) => `"${frontmatterString(tag)}"`).join(', ')}]`,
		category ? `category: "${frontmatterString(category)}"` : 'category: "迁移文章"',
		`sourceUrl: "${sourceUrl}"`,
		'---',
		'',
		`> 本文从旧 Hexo 博客迁移而来，原始发布路径：${postPath}`,
		'',
		markdown,
		'',
	]
		.filter((line) => line !== '')
		.join('\n');

	await writeFile(path.join(outputDir, `${slug}.md`), frontmatter);
	return `${slug}.md`;
}

await mkdir(outputDir, { recursive: true });
const posts = await fetchPostPaths();
const migrated = [];
for (const post of posts) {
	migrated.push(await migrate(post));
}
const syncedAssets = await syncAssets();

console.log(`Migrated ${migrated.length} posts:`);
for (const file of migrated) {
	console.log(`- ${file}`);
}
console.log(`Synced ${syncedAssets.length} assets:`);
for (const file of syncedAssets) {
	console.log(`- ${file}`);
}
