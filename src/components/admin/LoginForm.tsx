'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { DEMO_ACCOUNTS, ROLE_LABELS } from '@/lib/constants';

export function LoginForm({ initialNext }: { initialNext: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, next: initialNext }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        redirect?: string;
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Could not sign you in.');
        setPending(false);
        return;
      }
      router.replace(payload.redirect || initialNext || '/admin');
      router.refresh();
    } catch {
      setError('Network error. Check your connection and try again.');
      setPending(false);
    }
  }

  function fillDemo(index: number) {
    const account = DEMO_ACCOUNTS[index];
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  return (
    <div className="mt-7">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input pl-9"
              placeholder="you@mictech.news"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input pl-9"
              placeholder="••••••••••"
            />
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-xs leading-relaxed text-[#ffb4aa]"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? 'Signing in…' : 'Enter the newsroom'}
          {!pending ? <ArrowRight className="size-4" /> : null}
        </button>
      </form>

      {process.env.NODE_ENV !== 'production' ? (
        <div className="mt-6 rounded-xl border border-line bg-ink/50 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-2">
            Demo accounts
          </p>
          <div className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account, index) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(index)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-line/70 bg-panel-2/60 px-3 py-2 text-left text-xs transition-colors hover:border-signal/30 hover:bg-signal/5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-paper">{account.email}</span>
                  <span className="mt-0.5 block text-[0.68rem] text-muted-2">{ROLE_LABELS[account.role]}</span>
                </span>
                <span className="shrink-0 font-mono text-[0.68rem] text-muted">{account.password}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-muted-2">
            Click an account to fill the form. Demo credentials are hidden in production builds.
          </p>
        </div>
      ) : null}
    </div>
  );
}
