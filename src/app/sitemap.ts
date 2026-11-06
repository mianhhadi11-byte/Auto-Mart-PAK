import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { getSitemapData } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { stories, authors, categories } = await getSitemapData();
  const base = SITE.url.replace(/\/$/, '');

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/latest`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/videos`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/ethics`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/advertise`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/category/${category.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${base}/author/${author.slug}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${base}/article/${story.slug}`,
    lastModified: new Date(story.updatedAt),
    changeFrequency: 'weekly',
    priority: story.featured ? 0.9 : 0.8,
  }));

  return [...staticPages, ...categoryPages, ...storyPages, ...authorPages];
}
