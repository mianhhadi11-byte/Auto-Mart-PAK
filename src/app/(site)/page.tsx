import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Flame, Play, Signal, TrendingUp, Zap } from 'lucide-react';
import { BreakingTicker } from '@/components/site/BreakingTicker';
import { NewsletterForm } from '@/components/site/NewsletterForm';
import { SectionHeading } from '@/components/site/SectionHeading';
import { StoryCard } from '@/components/site/StoryCard';
import { getHomepageData, getTrendingTags } from '@/lib/cms/repository';

export const metadata = {
  title: 'MIC TECH — The signal in technology',
  description:
    'Independent technology journalism: AI, chips, startups, devices, telecom, mobility and the business of computing.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [data, tags] = await Promise.all([getHomepageData(), getTrendingTags(10)]);
  const [lead, ...secondary] = data.featured;
  const latest = data.latest.slice(0, 8);

  return (
    <>
      <BreakingTicker stories={data.breaking} />

      <section className="container-page pt-7 sm:pt-9">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {lead ? (
              <StoryCard story={lead} variant="hero" priority />
            ) : (
              <div className="grid min-h-[22rem] place-items-center rounded-2xl border border-line bg-panel p-8 text-center">
                <div>
                  <Signal className="mx-auto size-8 text-signal" aria-hidden="true" />
                  <h1 className="mt-3 font-display text-2xl font-semibold">The newsroom is warming up.</h1>
                  <p className="mt-2 text-sm text-muted">Publish the first story from the MIC TECH admin dashboard.</p>
                </div>
              </div>
            )}
            {secondary.length > 0 && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {secondary.slice(0, 2).map((story) => (
                  <StoryCard key={story.id} story={story} variant="large" />
                ))}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-5 lg:col-span-4">
            <div className="panel rounded-xl p-5">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-wide text-paper">
                  <Flame className="size-4 text-signal" aria-hidden="true" />
                  Trending now
                </h2>
                <Link href="/latest" className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-2 hover:text-signal">
                  All
                </Link>
              </div>
              <div className="divide-y divide-line-soft">
                {data.trending.length > 0 ? (
                  data.trending.slice(0, 6).map((story, index) => (
                    <StoryCard key={story.id} story={story} variant="list" rank={index + 1} className="py-3 first:pt-4 last:pb-0" />
                  ))
                ) : (
                  <p className="py-4 text-xs leading-relaxed text-muted-2">
                    Trending stories appear here as readers start sharing them.
                  </p>
                )}
              </div>
            </div>

            <div className="panel rounded-xl p-5">
              <h2 className="flex items-center gap-2 border-b border-line pb-3 font-display text-sm font-semibold tracking-wide text-paper">
                <TrendingUp className="size-4 text-aqua" aria-hidden="true" />
                Most read this week
              </h2>
              <div className="divide-y divide-line-soft">
                {data.mostRead.length > 0 ? (
                  data.mostRead.map((story, index) => (
                    <StoryCard key={story.id} story={story} variant="list" rank={index + 1} className="py-3 first:pt-4 last:pb-0" />
                  ))
                ) : (
                  <p className="py-4 text-xs leading-relaxed text-muted-2">
                    Most-read rankings unlock when the first stories go live.
                  </p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-signal/20 bg-[linear-gradient(145deg,rgba(201,247,74,0.1),rgba(201,247,74,0.02))] p-5">
              <div className="absolute -right-8 -top-8 size-28 rounded-full bg-signal/10 blur-2xl" aria-hidden="true" />
              <p className="eyebrow text-signal/90">The weekday briefing</p>
              <h2 className="mt-2 font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-paper">
                One email. The signal, not the noise.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                The context behind the day’s most important technology story.
              </p>
              <div className="mt-4">
                <NewsletterForm source="home-sidebar" compact />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-page mt-14 sm:mt-16">
        <SectionHeading eyebrow="The feed" title="Latest from the newsroom" href="/latest" linkLabel="All latest" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.length > 0 ? (
            latest.map((story) => <StoryCard key={story.id} story={story} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-line bg-panel p-8 text-center">
              <p className="font-display text-lg font-semibold text-paper">No stories published yet.</p>
              <p className="mt-2 text-sm text-muted">
                The first report will appear here the moment it is approved in the newsroom.
              </p>
            </div>
          )}
        </div>
      </section>

      {data.categories.slice(0, 4).map(({ category, stories }, index) => (
        <section key={category.id} className="container-page mt-16">
          <SectionHeading
            eyebrow={category.kicker}
            title={category.name}
            href={`/category/${category.slug}`}
            linkLabel={`All ${category.name.toLowerCase()}`}
          />
          {index === 0 && stories.length >= 3 ? (
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <StoryCard story={stories[0]} variant="large" />
              </div>
              <div className="divide-y divide-line-soft rounded-xl border border-line bg-panel px-5 lg:col-span-5">
                {stories.slice(1, 4).map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" className="py-4" />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      ))}

      {data.categories.length > 4 && (
        <section className="container-page mt-16">
          <SectionHeading
            eyebrow="Across the newsroom"
            title="More desks"
            href="/latest"
            linkLabel="Every story"
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.categories.slice(4).map(({ category, stories }) => (
              <div key={category.id} className="panel rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <div>
                    <p className="eyebrow text-[0.58rem]" style={{ color: category.accent }}>
                      {category.kicker}
                    </p>
                    <h3 className="mt-1 font-display text-base font-semibold text-paper">{category.name}</h3>
                  </div>
                  <Link
                    href={`/category/${category.slug}`}
                    className="shrink-0 text-[0.62rem] uppercase tracking-[0.14em] text-muted-2 transition-colors hover:text-signal"
                  >
                    All
                  </Link>
                </div>
                <div className="divide-y divide-line-soft">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} variant="minimal" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.videos.length > 0 && (
        <section className="mt-20 border-y border-line bg-black/25 py-12">
          <div className="container-page">
            <SectionHeading
              eyebrow="Watch"
              title="The video desk"
              href="/videos"
              linkLabel="All video reports"
              className="mb-7"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.videos.slice(0, 3).map((story) => (
                <div key={story.id} className="relative">
                  <StoryCard story={story} variant="video" />
                  <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    <Play className="size-2.5 fill-current" aria-hidden="true" /> Film
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(data.guides.length > 0 || data.opinion.length > 0) && (
        <section className="container-page mt-16">
          <div className="grid gap-12 lg:grid-cols-2">
            {data.guides.length > 0 && (
              <div>
                <SectionHeading
                  eyebrow="Tested & useful"
                  title="Guides and reviews"
                  href="/category/guides"
                  linkLabel="All guides"
                />
                {data.guides[0] && <StoryCard story={data.guides[0]} variant="large" />}
                <div className="mt-2 divide-y divide-line-soft">
                  {data.guides.slice(1, 5).map((story) => (
                    <StoryCard key={story.id} story={story} variant="compact" />
                  ))}
                </div>
              </div>
            )}
            <div className={data.guides.length === 0 ? 'lg:col-span-2' : undefined}>
              {data.opinion.length > 0 && (
                <>
                  <SectionHeading
                    eyebrow="Argument"
                    title="Opinion"
                    href="/category/opinion"
                    linkLabel="All opinion"
                  />
                  <div className="divide-y divide-line-soft">
                    {data.opinion.map((story) => (
                      <StoryCard key={story.id} story={story} variant="compact" className="py-4" />
                    ))}
                  </div>
                </>
              )}
              <div className="mt-6 rounded-xl border border-line bg-panel p-5">
                <p className="eyebrow text-signal/85">Explore the desks</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['technology', 'ai', 'business', 'startups', 'mobile', 'gadgets', 'telecom', 'social-media', 'automobile', 'education'].map(
                    (slug) => (
                      <Link
                        key={slug}
                        href={`/category/${slug}`}
                        className="rounded-full border border-line px-3 py-1.5 text-[0.7rem] text-muted transition-colors hover:border-signal/40 hover:text-signal"
                      >
                        {slug.replace('-', ' ')}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container-page mt-16">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel p-6 sm:p-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_50%,rgba(87,217,255,0.1),transparent_65%)]" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow flex items-center gap-2 text-aqua/90">
                <Zap className="size-3.5" aria-hidden="true" /> Follow the signal
              </p>
              <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-paper sm:text-3xl">
                Reporting for people who need to understand what comes next.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                No paywall theatre. No sponsored verdicts. Just the reporting, context and tested advice worth your time.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 6).map((tag) => (
                <Link
                  key={tag.tag}
                  href={`/search?q=${encodeURIComponent(tag.tag)}`}
                  className="rounded-full border border-line px-3 py-1.5 text-[0.68rem] text-muted transition-colors hover:border-signal/40 hover:text-signal"
                >
                  #{tag.tag}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative mt-6 border-t border-line pt-5">
            <Link href="/about" className="inline-flex items-center gap-2 text-xs font-medium text-signal hover:underline">
              How MIC TECH works <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page mt-12 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.14em] text-muted-2">
        <span>You are at the end of the front page.</span>
        <Link href="/latest" className="inline-flex items-center gap-1.5 hover:text-signal">
          Keep reading <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
