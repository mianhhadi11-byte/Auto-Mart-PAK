import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = 'View all',
  className,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex items-end justify-between gap-6 border-b border-line pb-4', className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1.5 text-signal/85">{eyebrow}</p>}
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-0.5 text-xs font-medium text-muted transition-colors hover:text-signal"
        >
          {linkLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
