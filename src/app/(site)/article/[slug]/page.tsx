import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, Flame } from 'lucide-react';
import { ArticleBody } from '@/components/site/ArticleBody';
import { AuthorAvatar } from '@/components/site/AuthorAvatar';
import { NewsletterForm } from '@/components/site/NewsletterForm';
import { ReadingProgress } from '@/components/site/ReadingProgress';
import { ShareButtons } from '@/components/site/ShareButtons';
import { StoryCard } from '@/components/site/StoryCard';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { SITE } from '@/lib/constants';
import { getRelatedStories, getStoryBySlug } from '@/lib/cms/repository';
import { formatDateParts, timeAgo } from '@/lib/utils';

type PageProps = { params: Promise<{ slug: string }> };

function absoluteUrl(path: string) {
  try {
    return new URL(path, SITE.url).toString();
  } catch {
    return path;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();
  const title = story.seoTitle || story.title;
  const description = story.seoDescription || story.excerpt;
  const image = absoluteUrl(story.imageUrl);
  return {
    title,
    description,
    alternates: { canonical: `/article/${story.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/article/${story.slug}`,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: story.publishedAt || undefined,
      modifiedTime: story.updatedAt,
      section: story.category.name,
      authors: [story.author.name],
      tags: story.tags,
      images: [{ url: image, width: 1600, height: 900, alt: story.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: SITE.twitter,
    },
    other: {
      'article:section': story.category.name,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  const [related] = await Promise.all([getRelatedStories(story, 3)]);
  const articleUrl = absoluteUrl(`/article/${story.slug}`);
  const published = formatDateParts(story.publishedAt);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    headline: story.title,
    description: story.seoDescription || story.excerpt,
    image: [absoluteUrl(story.imageUrl)],
    datePublished: story.publishedAt,
    dateModified: story.updatedAt,
    articleSection: story.category.name,
    keywords: story.tags.join(', '),
    wordCount: story.body.reduce(
      (total, block) => total + block.children.reduce((sum, child) => sum + child.text.split(/\s+/).length, 0),
      0,
    ),
    isAccessibleForFree: true,
    author: [
      {
        '@type': 'Person',
        name: story.author.name,
        url: absoluteUrl(`/author/${story.author.slug}`),
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/mic-tech-logo.png') },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: story.category.name,
        item: absoluteUrl(`/category/${story.category.slug}`),
      },
      { '@type': 'ListItem', position: 3, name: story.title, item: articleUrl },
    ],
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }}
      />

      <div className="container-page pt-5">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[0.68rem] text-muted-2">
          <Link href="/" className="shrink-0 hover:text-signal">
            Home
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
          <Link href={`/category/${story.category.slug}`} className="shrink-0 hover:text-signal">
            {story.category.name}
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate text-muted">{story.title}</span>
        </nav>
      </div>

      <div className="container-page pb-4 pt-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="min-w-0 lg:col-span-8">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/category/${story.category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    borderColor: `${story.category.accent}55`,
                    color: story.category.accent,
                    background: `${story.category.accent}12`,
                  }}
                >
                  <span className="size-1 rounded-full bg-current" />
                  {story.category.name}
                </Link>
                {story.breaking && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-signal px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink">
                    <Flame className="size-3" aria-hidden="true" /> Breaking
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.12em] text-muted-2">
                  <Clock className="size-3" aria-hidden="true" /> {story.readMinutes} min read
                </span>
              </div>

              <h1 className="mt-4 text-balance font-display text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-paper sm:text-4xl lg:text-[2.9rem]">
                {story.title}
              </h1>
              <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                {story.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
                <Link href={`/author/${story.author.slug}`} className="group flex items-center gap-3">
                  <AuthorAvatar author={story.author} size="md" />
                  <span>
                    <span className="block text-sm font-medium text-paper group-hover:text-signal">
                      {story.author.name}
                    </span>
                    <span className="mt-0.5 block text-[0.68rem] text-muted-2">
                      {story.author.role}
                    </span>
                  </span>
                </Link>
                <div className="text-right text-[0.68rem] leading-relaxed text-muted-2">
                  <p>
                    <time dateTime={story.publishedAt || undefined}>
                      {published.date} · {published.time}
                    </time>
                  </p>
                  <p className="mt-0.5">Updated {timeAgo(story.updatedAt)}</p>
                </div>
              </div>
            </header>

            <figure className="mt-7">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line bg-panel">
                <Image
                  src={story.imageUrl}
                  alt={story.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 flex flex-wrap items-start justify-between gap-2 text-[0.65rem] leading-relaxed text-muted-2">
                <span>{story.imageAlt}</span>
                <span className="shrink-0 uppercase tracking-[0.12em]">Credit: {story.imageCredit}</span>
              </figcaption>
            </figure>

            {story.videoUrl && (
              <div className="mt-8">
                <p className="eyebrow mb-3 flex items-center gap-2 text-signal/85">
                  <span className="size-1.5 rounded-full bg-signal" /> Watch the report
                </p>
                <VideoPlayer
                  url={story.videoUrl}
                  poster={story.imageUrl}
                  title={story.title}
                />
              </div>
            )}

            <div className="mt-9">
              <ArticleBody blocks={story.body} />
            </div>

            {story.sourceName && (
              <div className="mt-8 rounded-lg border border-line bg-panel p-4 text-xs leading-relaxed text-muted">
                <span className="font-medium text-paper">Primary source:</span>{' '}
                {story.sourceUrl ? (
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-signal underline decoration-signal/40 hover:decoration-signal"
                  >
                    {story.sourceName}
                  </a>
                ) : (
                  story.sourceName
                )}
              </div>
            )}

            {story.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                <span className="eyebrow mr-1">Filed under</span>
                {story.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-line px-3 py-1.5 text-[0.68rem] text-muted transition-colors hover:border-signal/40 hover:text-signal"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons url={articleUrl} title={story.title} className="mt-8 border-t border-line pt-5" />

            <div className="mt-8 rounded-xl border border-line bg-panel p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <AuthorAvatar author={story.author} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-2">Written by</p>
                  <h2 className="mt-1 font-display text-lg font-semibold text-paper">
                    <Link href={`/author/${story.author.slug}`} className="hover:text-signal">
                      {story.author.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-muted">{story.author.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{story.author.bio}</p>
                </div>
              </div>
            </div>
          </article>

          <aside className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-xl border border-signal/20 bg-[linear-gradient(145deg,rgba(201,247,74,0.08),rgba(201,247,74,0.015))] p-5">
                <p className="eyebrow text-signal/90">The weekday briefing</p>
                <h2 className="mt-2 font-display text-lg font-semibold leading-tight text-paper">
                  Get the context behind the headline.
                </h2>
                <div className="mt-4">
                  <NewsletterForm source={`article-${story.slug}`} compact />
                </div>
              </div>

              <div className="rounded-xl border border-line bg-panel p-5">
                <p className="eyebrow mb-3">Share</p>
                <ShareButtons url={articleUrl} title={story.title} className="[&_.eyebrow]:hidden" />
              </div>

              {related.length > 0 && (
                <div className="rounded-xl border border-line bg-panel p-5">
                  <p className="eyebrow mb-1">Keep reading</p>
                  <div className="divide-y divide-line-soft">
                    {related.map((item) => (
                      <StoryCard key={item.id} story={item} variant="compact" className="py-4 last:pb-0 first:pt-3" />
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-line bg-panel p-5">
                <p className="eyebrow mb-2">About MIC TECH</p>
                <p className="text-xs leading-relaxed text-muted">
                  Independent technology journalism. We do not take sponsored verdicts, and every review is tested by the
                  newsroom.
                </p>
                <Link href="/ethics" className="mt-3 inline-block text-xs font-medium text-signal hover:underline">
                  Our editorial standards
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow text-signal/85">Recommended</p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-paper">
                  More from the newsroom
                </h2>
              </div>
              <Link href="/latest" className="text-xs text-muted hover:text-signal">
                All latest
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StoryCard key={item.id} story={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
