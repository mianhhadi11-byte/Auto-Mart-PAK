import Link from 'next/link';
import { Search } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { Pagination } from '@/components/site/Pagination';
import { StoryCard } from '@/components/site/StoryCard';
import { getTrendingTags, listPublishedStories, listCategories } from '@/lib/cms/repository';

export const metadata = {
  title: 'Search',
  description: 'Search MIC TECH reporting across every desk.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || '').trim();
  const page = Number(params.page || 1);
  const [result, tags, categories] = await Promise.all([
    query ? listPublishedStories({ q: query, page, perPage: 12 }) : Promise.resolve(null),
    getTrendingTags(10),
    listCategories(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : 'Find the signal'}
        description={
          query
            ? result && result.total > 0
              ? `${result.total} stor${result.total === 1 ? 'y' : 'ies'} match your search.`
              : 'No published stories matched that search. Try a broader term or one of the desks below.'
            : 'Search the entire MIC TECH archive by headline, topic, author, tag or body text.'
        }
      >
        <form action="/search" method="get" className="flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" aria-hidden="true" />
            <input
              name="q"
              defaultValue={query}
              required
              placeholder="AI chips, foldables, spectrum…"
              className="input pl-10"
              aria-label="Search query"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </PageHero>

      <div className="container-page py-9">
        {result && result.stories.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
            <Pagination
              page={result.page}
              pages={result.pages}
              basePath="/search"
              query={{ q: query }}
            />
          </>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-line bg-panel p-8">
              <p className="eyebrow text-signal/85">Browse by desk</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="rounded-lg border border-line px-3 py-2.5 text-sm text-muted transition-colors hover:border-signal/40 hover:text-signal"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-panel p-8">
              <p className="eyebrow text-signal/85">Popular topics</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.tag}
                    href={`/search?q=${encodeURIComponent(tag.tag)}`}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-signal/40 hover:text-signal"
                  >
                    #{tag.tag} <span className="text-muted-2">{tag.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
