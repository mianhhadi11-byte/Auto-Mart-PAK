'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpenText,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  PenLine,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { ROLE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

interface AdminShellProps {
  user: { id: string; name: string; email: string; role: Role };
  backend: string;
  children: React.ReactNode;
}

const NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'editor', 'contributor'] },
  { label: 'Stories', href: '/admin/articles', icon: Newspaper, roles: ['admin', 'editor', 'contributor'] },
  { label: 'New story', href: '/admin/articles/new', icon: PenLine, roles: ['admin', 'editor', 'contributor'] },
  { label: 'Authors', href: '/admin/authors', icon: Users, roles: ['admin', 'editor'] },
  { label: 'Subscribers', href: '/admin/subscribers', icon: Mail, roles: ['admin', 'editor'] },
  { label: 'Editorial policy', href: '/admin/policy', icon: BookOpenText, roles: ['admin', 'editor', 'contributor'] },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ user, backend, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const nav = NAV.filter((item) => (item.roles as readonly string[]).includes(user.role));

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-line/70 px-4">
        <Logo compact />
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="btn btn-ghost size-9 !p-0 lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-2">
          Newsroom
        </p>
        <nav className="mt-2 space-y-1" aria-label="Newsroom">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  active
                    ? 'bg-signal/10 font-medium text-signal'
                    : 'text-muted hover:bg-white/[0.04] hover:text-paper',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active ? <ChevronRight className="size-3.5" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-xl border border-line/70 bg-ink/50 p-3">
          <p className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
            <ShieldCheck className="size-3 text-signal" />
            Content backend
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{backend}</p>
        </div>
      </div>

      <div className="border-t border-line/70 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-panel-2 font-display text-xs font-semibold text-signal">
            {user.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-paper">{user.name}</span>
            <span className="block truncate text-[0.65rem] text-muted-2">{ROLE_LABELS[user.role]}</span>
          </span>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <Link
            href="/"
            target="_blank"
            className="btn btn-ghost !justify-start !px-2 !py-1.5 !text-[0.7rem]"
          >
            <ExternalLink className="size-3" />
            View site
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="btn btn-ghost !justify-start !px-2 !py-1.5 !text-[0.7rem] hover:!text-coral"
          >
            {signingOut ? <Loader2 className="size-3 animate-spin" /> : <LogOut className="size-3" />}
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line/70 bg-ink-soft/90 lg:block">
        {sidebar}
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-line bg-ink-soft shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line/70 bg-ink/85 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="btn btn-ghost size-9 !p-0"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Logo compact />
          <span className="ml-auto badge border-signal/25 text-signal">{ROLE_LABELS[user.role]}</span>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
