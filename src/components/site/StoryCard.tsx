import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock, Play } from 'lucide-react';
import type { Story } from '@/lib/types';
import { cn, formatDateParts, timeAgo } from '@/lib/utils';
import { AuthorAvatar } from './AuthorAvatar';

type Variant = 'hero' | 'large' | 'standard' | 'compact' | 'list' | 'video' | 'minimal';

const titleStyles: Record<Variant, string> = {
  hero: 'text-balance font-display text-2xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-3xl lg:text-[2.55rem]',
  large: 'text-balance font-display text-xl font-semibold leading-[1.14] tracking-[-0.025em] sm:text-2xl',
  standard: 'text-balance font-display text-lg font-semibold leading-[1.2] tracking-[-0.02em]',
  compact: 'font-display text-[0.95rem] font-semibold leading-snug tracking-[-0.01em]',
  list: 'font-display text-[0.95rem] font-semibold leading-snug tracking-[-0.01em]',
  video: 'text-balance font-display text-lg font-semibold leading-[1.2] tracking-[-0.02em]',
  minimal: 'font-display text-sm font-semibold leading-snug',
};

function CategoryLink({ story, overlay = false }: { story: Story; overlay?: boolean }) {
  return (
    <Link
      href={`/category/${story.category.slug}`}
      className={cn(
        'inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition-colors',
        overlay ? 'text-signal hover:text-white' : 'text-signal/90 hover:text-signal',
      )}
    >
      <span className="size-1 rounded-full bg-current" />
      {story.category.name}
    </Link>
  );
}

function Meta({ story, overlay = false }: { story: Story; overlay?: boolean }) {
  const published = formatDateParts(story.publishedAt);
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.68rem]',
        overlay ? 'text-white/70' : 'text-muted-2',
      )}
    >
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3" aria-hidden="true" />
        {story.readMinutes} min read
      </span>
      <span className="text-white/20">/</span>
      <time dateTime={story.publishedAt || undefined}>{published.date}</time>
    </div>
  );
}

function ImageBlock({
  story,
  className,
  sizes,
  priority,
  showVideo = false,
}: {
  story: Story;
  className?: string;
  sizes: string;
  priority?: boolean;
  showVideo?: boolean;
}) {
  return (
    <div className={cn('relative overflow-hidden bg-ink-soft', className)}>
      <Image
        src={story.imageUrl}
        alt={story.imageAlt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-95"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-80" />
      {showVideo && story.videoUrl && (
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur">
          <Play className="size-3.5 fill-current" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

export function StoryCard({
  story,
  variant = 'standard',
  priority = false,
  rank,
  className,
}: {
  story: Story;
  variant?: Variant;
  priority?: boolean;
  rank?: number;
  className?: string;
}) {
  const href = `/article/${story.slug}`;

  if (variant === 'hero') {
    return (
      <article
        className={cn(
          'group card-lift relative isolate min-h-[22rem] overflow-hidden rounded-2xl border border-line bg-panel sm:min-h-[27rem]',
          className,
        )}
      >
        <Link href={href} className="absolute inset-0" aria-label={story.title}>
          <Image
            src={story.imageUrl}
            alt={story.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 62vw"
            priority={priority}
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />
        </Link>
        <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-5 sm:min-h-[27rem] sm:p-8 lg:p-10">
          <div className="mb-auto flex items-center gap-2">
            {story.breaking && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-signal px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink">
                <span className="size-1.5 rounded-full bg-ink" /> Breaking
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
              {story.category.kicker}
            </span>
          </div>
          <div className="max-w-2xl">
            <CategoryLink story={story} overlay />
            <h2 className={cn('mt-2.5 text-white', titleStyles.hero)}>
              <Link href={href} className="link-underline">
                {story.title}
              </Link>
            </h2>
            <p className="mt-3 hidden max-w-xl text-sm leading-relaxed text-white/70 sm:block">
              {story.excerpt}
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <AuthorAvatar author={story.author} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white/90">{story.author.name}</p>
                <Meta story={story} overlay />
              </div>
              <span className="ml-auto grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition group-hover:border-signal group-hover:bg-signal group-hover:text-ink">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={cn('group flex items-start gap-3.5 py-4', className)}>
        <Link href={href} className="relative block size-20 shrink-0 overflow-hidden rounded-lg border border-line">
          <Image
            src={story.imageUrl}
            alt={story.imageAlt}
            fill
            sizes="80px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="min-w-0 pt-0.5">
          <CategoryLink story={story} />
          <h3 className={cn('mt-1 text-paper', titleStyles.compact)}>
            <Link href={href} className="transition-colors group-hover:text-signal">
              {story.title}
            </Link>
          </h3>
          <div className="mt-1.5">
            <Meta story={story} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'list') {
    return (
      <article className={cn('group flex items-start gap-3.5 py-4', className)}>
        {typeof rank === 'number' && (
          <span className="mt-0.5 font-display text-xl font-semibold tabular-nums text-white/15 transition-colors group-hover:text-signal">
            {String(rank).padStart(2, '0')}
          </span>
        )}
        <div className="min-w-0">
          <h3 className={cn('text-paper', titleStyles.list)}>
            <Link href={href} className="transition-colors group-hover:text-signal">
              {story.title}
            </Link>
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-[0.66rem] text-muted-2">
            <span className="text-signal/80">{story.category.name}</span>
            <span className="text-white/15">/</span>
            <span>{timeAgo(story.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'minimal') {
    return (
      <article className={cn('group border-b border-line-soft py-3 last:border-0', className)}>
        <h3 className={cn('text-paper', titleStyles.minimal)}>
          <Link href={href} className="transition-colors group-hover:text-signal">
            {story.title}
          </Link>
        </h3>
        <p className="mt-1 text-[0.65rem] text-muted-2">
          {story.category.name} · {timeAgo(story.publishedAt)}
        </p>
      </article>
    );
  }

  const isVideo = variant === 'video';
  return (
    <article
      className={cn(
        'group card-lift flex flex-col overflow-hidden rounded-xl border border-line bg-panel',
        className,
      )}
    >
      <Link href={href} className="block">
        <ImageBlock
          story={story}
          showVideo={isVideo}
          priority={priority}
          sizes={variant === 'large' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          className={variant === 'large' ? 'aspect-[16/9]' : 'aspect-[16/10]'}
        />
      </Link>
      <div className={cn('flex flex-1 flex-col p-4', variant === 'large' && 'p-5')}>
        <CategoryLink story={story} />
        <h3 className={cn('mt-1.5 text-paper', titleStyles[variant])}>
          <Link href={href} className="transition-colors group-hover:text-signal">
            {story.title}
          </Link>
        </h3>
        {variant === 'large' && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{story.excerpt}</p>}
        <div className="mt-auto pt-3.5">
          <Meta story={story} />
        </div>
      </div>
    </article>
  );
}
