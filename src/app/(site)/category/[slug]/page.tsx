import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/PageHero';
import { Pagination } from '@/components/site/Pagination';
import { StoryCard } from '@/components/site/StoryCard';
import { CATEGORY_SLUGS } from '@/lib/constants';
import { getCategory, listPublishedStories } from '@/lib/cms/repository';
import type { CategorySlug } from '@/lib/types';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!CATEGORY_SLUGS.includes(slug as CategorySlug)) notFound();
  const category = await getCategory(slug);
  if (!category) notFound();
  return {
    title: `${category.name} news`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `${category.name} — MIC TECH`,
      description: category.description,
      url: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  if (!CATEGORY_SLUGS.includes(slug as CategorySlug)) notFound();
  const category = await getCategory(slug);
  if (!category) notFound();

  const result = await listPublishedStories({
    category: category.slug,
    page: Number(pageParam || 1),
    perPage: 12,
  });

  return (
    <>
      <PageHero
        eyebrow={category.kicker}
        title={category.name}
        description={category.description}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
            style={{ borderColor: `${category.accent}44`, color: category.accent, background: `${category.accent}12` }}
          >
            <span className="size-1.5 rounded-full" style={{ background: category.accent }} />
            {result.total} published
          </span>
          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-2">
            Reporting by the MIC TECH {category.name.toLowerCase()} desk
          </span>
        </div>
      </PageHero>

      <div className="container-page py-9">
        {result.stories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.stories.map((story, index) => (
              <StoryCard
                key={story.id}
                story={story}
                priority={index < 3}
                variant={index === 0 ? 'large' : 'standard'}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel p-10 text-center">
            <p className="font-display text-xl font-semibold text-paper">No published stories in this desk yet.</p>
            <p className="mt-2 text-sm text-muted">Check the latest feed or the video desk in the meantime.</p>
          </div>
        )}
        <Pagination
          page={result.page}
          pages={result.pages}
          basePath={`/category/${category.slug}`}
        />
      </div>
    </>
  );
}
