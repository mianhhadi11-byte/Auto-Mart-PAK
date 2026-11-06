import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  pages,
  basePath,
  query = {},
  className,
}: {
  page: number;
  pages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  className?: string;
}) {
  if (pages <= 1) return null;
  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set('page', String(target));
    const suffix = params.toString();
    return suffix ? `${basePath}?${suffix}` : basePath;
  };

  const candidates = new Set<number>([1, pages, page - 1, page, page + 1]);
  const numbers = [...candidates].filter((value) => value >= 1 && value <= pages).sort((a, b) => a - b);

  return (
    <nav className={cn('mt-10 flex items-center justify-between gap-4 border-t border-line pt-6', className)} aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="btn btn-secondary">
          <ChevronLeft className="size-4" aria-hidden="true" /> Newer
        </Link>
      ) : (
        <span className="btn btn-secondary pointer-events-none opacity-35">
          <ChevronLeft className="size-4" aria-hidden="true" /> Newer
        </span>
      )}
      <div className="flex items-center gap-1">
        {numbers.map((number, index) => {
          const previous = numbers[index - 1];
          return (
            <span key={number} className="flex items-center gap-1">
              {previous && number - previous > 1 && <span className="px-1 text-xs text-muted-2">…</span>}
              <Link
                href={hrefFor(number)}
                aria-current={number === page ? 'page' : undefined}
                className={cn(
                  'grid size-9 place-items-center rounded-lg border text-xs font-medium transition-colors',
                  number === page
                    ? 'border-signal bg-signal font-semibold text-ink'
                    : 'border-line text-muted hover:border-white/25 hover:text-paper',
                )}
              >
                {number}
              </Link>
            </span>
          );
        })}
      </div>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className="btn btn-secondary">
          Older <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="btn btn-secondary pointer-events-none opacity-35">
          Older <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
