import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  
  const searchData = posts.map(post => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags?.join(' ') || '',
    body: post.body?.slice(0, 500) || '',
  }));
  
  return new Response(JSON.stringify(searchData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
