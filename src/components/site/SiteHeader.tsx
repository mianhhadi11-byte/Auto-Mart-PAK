'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { CATEGORY_META, PRIMARY_NAV } from '@/lib/constants';
import { cn, todayLabel } from '@/lib/utils';
import { Logo } from './Logo';

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, searchOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="hidden border-b border-line-soft bg-black/40 md:block">
        <div className="container-page flex h-8 items-center justify-between text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted-2">
          <span>{todayLabel()}</span>
          <span className="hidden lg:inline">Independent technology journalism · Est. 2026</span>
          <Link href="/admin" className="transition-colors hover:text-signal">
            Newsroom login
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="container-page flex h-[4.25rem] items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-paper lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-4.5" aria-hidden="true" />
          </button>

          <Logo />

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-2.5 py-2 text-[0.73rem] font-medium tracking-[0.01em] transition-colors',
                  isActive(item.href)
                    ? 'text-signal'
                    : 'text-muted hover:bg-white/[0.04] hover:text-paper',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-white/25 hover:text-paper"
              aria-label="Search MIC TECH"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
            <Link href="/#briefing" className="btn btn-primary hidden md:inline-flex">
              The briefing
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search MIC TECH">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          />
          <div className="relative mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-2xl animate-fade-up">
            <form action="/search" method="get" className="overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="size-4.5 text-signal" aria-hidden="true" />
                <input
                  name="q"
                  required
                  autoFocus
                  placeholder="Search reporting, topics, authors…"
                  className="h-14 flex-1 bg-transparent text-base text-paper outline-none placeholder:text-muted-2"
                  aria-label="Search query"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="grid size-8 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-paper"
                  aria-label="Close search"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="p-4">
                <p className="eyebrow mb-3">Browse desks</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_META).slice(0, 10).map(([slug, meta]) => (
                    <Link
                      key={slug}
                      href={`/category/${slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-signal/40 hover:text-signal"
                    >
                      {meta.name}
                    </Link>
                  ))}
                </div>
              </div>
            </form>
            <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
              Press Esc to close
            </p>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative ml-auto flex h-full w-[min(88vw,380px)] animate-fade-up flex-col border-l border-line bg-ink">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo compact />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:text-paper"
                aria-label="Close menu"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-5" aria-label="Mobile">
              <p className="eyebrow mb-3">Sections</p>
              <div className="grid gap-1">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 font-display text-lg tracking-[-0.01em] transition-colors',
                      isActive(item.href)
                        ? 'border-line bg-white/[0.03] text-signal'
                        : 'text-paper hover:bg-white/[0.03]',
                    )}
                  >
                    {item.label}
                    <ArrowUpRight className="size-4 text-muted-2" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-6 border-t border-line pt-5">
                <p className="eyebrow mb-3">More desks</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_META)
                    .slice(7)
                    .map(([slug, meta]) => (
                      <Link
                        key={slug}
                        href={`/category/${slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-signal"
                      >
                        {meta.name}
                      </Link>
                    ))}
                </div>
              </div>
            </nav>
            <div className="border-t border-line p-5">
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary w-full"
              >
                Newsroom login
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/#briefing"
                onClick={() => setMenuOpen(false)}
                className="mt-2 block text-center text-xs text-muted hover:text-paper"
              >
                Get the weekday briefing
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
