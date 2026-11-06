import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { Pagination } from '@/components/site/Pagination';
import { StoryCard } from '@/components/site/StoryCard';
import { CATEGORY_META, CATEGORY_SLUGS } from '@/lib/constants';
import { listPublishedStories } from '@/lib/cms/repository';
import { todayLabel } from '@/lib/utils';

export const metadata = {
  title: 'Latest news',
  description: 'Every published story from the MIC TECH newsroom, newest first.',
  alternates: { canonical: '/latest' },
};

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const result = await listPublishedStories({ page, perPage: 12 });

  return (
    <>
      <PageHero
        eyebrow="The feed"
        title="Latest from the newsroom"
        description="Every published report, analysis, guide and review — newest first. No algorithm, no infinite scroll, no reruns."
      >
        <div className="flex flex-wrap items-center gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-muted-2">
          <span>{todayLabel()}</span>
          <span className="text-white/15">/</span>
          <span>
            {result.total} stor{result.total === 1 ? 'y' : 'ies'}
          </span>
        </div>
      </PageHero>

      <div className="container-page py-9">
        <div className="hide-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1" aria-label="Filter by desk">
          <Link
            href="/latest"
            className="shrink-0 rounded-full border border-signal/40 bg-signal/10 px-3.5 py-1.5 text-[0.7rem] font-medium text-signal"
          >
            All desks
          </Link>
          {CATEGORY_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[0.7rem] text-muted transition-colors hover:border-white/25 hover:text-paper"
            >
              {CATEGORY_META[slug].name}
            </Link>
          ))}
        </div>

        {result.stories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.stories.map((story, index) => (
              <StoryCard key={story.id} story={story} priority={index < 3} variant={index === 0 ? 'large' : 'standard'} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel p-10 text-center">
            <p className="font-display text-xl font-semibold text-paper">Nothing published here yet.</p>
            <p className="mt-2 text-sm text-muted">The newsroom is working on it.</p>
          </div>
        )}

        <Pagination page={result.page} pages={result.pages} basePath="/latest" />
      </div>
    </>
  );
}
