import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Story } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

export function BreakingTicker({ stories, label = 'Breaking' }: { stories: Story[]; label?: string }) {
  if (stories.length === 0) return null;
  const items = [...stories, ...stories];

  return (
    <section className="border-b border-line bg-[linear-gradient(90deg,rgba(201,247,74,0.08),rgba(201,247,74,0.015))]" aria-label={label}>
      <div className="container-page flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 border-r border-line/80 py-2.5 pr-4">
          <span className="live-dot size-1.5 rounded-full bg-signal" aria-hidden="true" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-signal">{label}</span>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden py-2.5 pl-4">
          <div className="animate-marquee flex w-max items-center gap-8">
            {items.map((story, index) => (
              <Link
                key={`${story.id}-${index}`}
                href={`/article/${story.slug}`}
                className="group flex shrink-0 items-center gap-2.5 text-xs text-paper/80 transition-colors hover:text-signal"
              >
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-muted-2">
                  {story.category.name}
                </span>
                <span className="max-w-[46rem] truncate">{story.title}</span>
                <span className="hidden text-[0.62rem] text-muted-2 sm:inline">{timeAgo(story.publishedAt)}</span>
                <ArrowUpRight className="size-3 shrink-0 text-muted-2 transition-colors group-hover:text-signal" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
