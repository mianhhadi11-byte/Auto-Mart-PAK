import Link from 'next/link';
import { Play } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { StoryCard } from '@/components/site/StoryCard';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { getVideoStories } from '@/lib/cms/repository';
import { formatDate, timeAgo } from '@/lib/utils';

export const metadata = {
  title: 'Video desk',
  description: 'Short video reports and visual explainers from the MIC TECH newsroom.',
  alternates: { canonical: '/videos' },
};

export default async function VideosPage() {
  const stories = await getVideoStories(12);
  const [lead, ...rest] = stories;

  return (
    <>
      <PageHero
        eyebrow="Watch"
        title="The video desk"
        description="Visual reporting from the test bench, the data centre and the road. Short, produced by the newsroom, no autoplay."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-signal">
          <Play className="size-3 fill-current" aria-hidden="true" />
          {stories.length} film{stories.length === 1 ? '' : 's'}
        </span>
      </PageHero>

      <div className="container-page py-9">
        {lead ? (
          <>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-8">
                <VideoPlayer
                  url={lead.videoUrl || ''}
                  poster={lead.imageUrl}
                  title={lead.title}
                />
              </div>
              <div className="lg:col-span-4">
                <p className="eyebrow text-signal/85">{lead.category.name}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-paper">
                  <Link href={`/article/${lead.slug}`} className="hover:text-signal">
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{lead.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.68rem] text-muted-2">
                  <span>{lead.author.name}</span>
                  <span className="text-white/15">/</span>
                  <time dateTime={lead.publishedAt || undefined}>{formatDate(lead.publishedAt)}</time>
                  <span className="text-white/15">/</span>
                  <span>{timeAgo(lead.publishedAt)}</span>
                </div>
                <Link href={`/article/${lead.slug}`} className="btn btn-secondary mt-5">
                  Read the full report
                </Link>
              </div>
            </div>

            {rest.length > 0 && (
              <div className="mt-12">
                <div className="mb-6 border-b border-line pb-4">
                  <h2 className="font-display text-xl font-semibold text-paper">More from the video desk</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((story) => (
                    <StoryCard key={story.id} story={story} variant="video" />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-line bg-panel p-10 text-center">
            <p className="font-display text-xl font-semibold text-paper">The video desk is in production.</p>
            <p className="mt-2 text-sm text-muted">Published video reports will appear here automatically.</p>
          </div>
        )}
      </div>
    </>
  );
}
