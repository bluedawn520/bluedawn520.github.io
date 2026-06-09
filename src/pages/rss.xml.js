import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');

	// 按发布日期降序排列，最新的文章在前
	const sortedPosts = posts.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		// 中文站点标注语言
		customData: `<language>zh-CN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
		items: sortedPosts.map((post) => {
			// 清理可能被错误迁移的 description（如以 ! 开头的图片路径片段）
			let description = post.data.description || '';
			if (description.startsWith('!')) {
				description = post.data.title;
			}

			return {
				title: post.data.title,
				description,
				link: `/blog/${post.slug}/`,
				pubDate: post.data.pubDate,
				// 如果有更新日期，作为可选字段
				...(post.data.updatedDate && {
					customData: `<lastBuildDate>${post.data.updatedDate.toUTCString()}</lastBuildDate>`,
				}),
			};
		}),
	});
}
