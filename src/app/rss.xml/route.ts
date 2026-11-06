import { SITE } from '@/lib/constants';
import { getSitemapData } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absolute(path: string) {
  return new URL(path, SITE.url).toString();
}

export async function GET() {
  const { stories } = await getSitemapData();
  const base = SITE.url.replace(/\/$/, '');
  const items = stories.slice(0, 50);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>MIC TECH — The signal in technology</title>
    <link>${SITE.url}</link>
    <description>${xmlEscape(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${absolute('/brand/mic-tech-logo.png')}</url>
      <title>MIC TECH</title>
      <link>${SITE.url}</link>
    </image>
${items
  .map(
    (story) => `    <item>
      <title>${xmlEscape(story.title)}</title>
      <link>${absolute(`/article/${story.slug}`)}</link>
      <guid isPermaLink="true">${absolute(`/article/${story.slug}`)}</guid>
      <pubDate>${new Date(story.publishedAt || story.updatedAt).toUTCString()}</pubDate>
      <description>${xmlEscape(story.excerpt)}</description>
      <category>${xmlEscape(story.category.name)}</category>
      <author>${xmlEscape(`${story.author.email || 'newsroom@mictech.news'} (${story.author.name})`)}</author>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
