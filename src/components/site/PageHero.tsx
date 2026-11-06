import { cn } from '@/lib/utils';

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  align = 'left',
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <header
      className={cn(
        'relative overflow-hidden border-b border-line bg-[radial-gradient(700px_260px_at_20%_-20%,rgba(201,247,74,0.09),transparent_65%)]',
        className,
      )}
    >
      <div className="container-page py-10 sm:py-14">
        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          <p className="eyebrow text-signal/85">{eyebrow}</p>
          <h1 className="mt-2 text-balance font-display text-3xl font-semibold leading-[1.04] tracking-[-0.04em] text-paper sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </header>
  );
}
