import { ExternalLink, Mail } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AuthorAvatar } from '@/components/site/AuthorAvatar';
import { StoryCard } from '@/components/site/StoryCard';
import { getAuthorWithStories } from '@/lib/cms/repository';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getAuthorWithStories(slug);
  if (!result) notFound();
  return {
    title: result.author.name,
    description: result.author.bio,
    alternates: { canonical: `/author/${result.author.slug}` },
    openGraph: {
      type: 'profile',
      title: `${result.author.name} — MIC TECH`,
      description: result.author.bio,
      url: `/author/${result.author.slug}`,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getAuthorWithStories(slug);
  if (!result) notFound();
  const { author, stories } = result;

  return (
    <>
      <header className="border-b border-line bg-[radial-gradient(700px_280px_at_25%_-20%,rgba(201,247,74,0.08),transparent_65%)]">
        <div className="container-page py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <AuthorAvatar author={author} size="xl" className="border-2 border-white/10" />
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-signal/85">{author.role}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-paper sm:text-4xl">
                {author.name}
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
                {author.bio}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[0.7rem] text-muted-2">
                <span className="rounded-full border border-line px-3 py-1.5">
                  {stories.length} published stor{stories.length === 1 ? 'y' : 'ies'}
                </span>
                {author.email && (
                  <a href={`mailto:${author.email}`} className="inline-flex items-center gap-1.5 hover:text-signal">
                    <Mail className="size-3.5" aria-hidden="true" /> Email
                  </a>
                )}
                {author.twitter && (
                  <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-signal">
                    <ExternalLink className="size-3.5" aria-hidden="true" /> X
                  </a>
                )}
                {author.linkedin && (
                  <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-signal">
                    <ExternalLink className="size-3.5" aria-hidden="true" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-9">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-xl font-semibold text-paper">Reporting by {author.name}</h2>
          <span className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-2">Newest first</span>
        </div>
        {stories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel p-10 text-center text-sm text-muted">
            No published stories from this author yet.
          </div>
        )}
      </div>
    </>
  );
}
