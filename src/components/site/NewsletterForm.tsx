'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NewsletterForm({
  source = 'website',
  compact = false,
  className,
}: {
  source?: string;
  compact?: boolean;
  className?: string;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'loading') return;
    setState('loading');
    setMessage('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        setState('error');
        setMessage(data.error || 'That did not work. Try again.');
        return;
      }
      setState('success');
      setMessage(data.message || 'You are on the list.');
      setEmail('');
    } catch {
      setState('error');
      setMessage('Network error. Check your connection and try again.');
    }
  }

  if (state === 'success') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-signal/25 bg-signal/8 px-4 py-3 text-sm text-signal',
          className,
        )}
        role="status"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-signal text-ink">
          <Check className="size-4" aria-hidden="true" />
        </span>
        <span className="text-paper/85">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)}>
      <div className={cn('flex gap-2', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row')}>
        <label htmlFor={`newsletter-${source}`} className="sr-only">
          Email address
        </label>
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" aria-hidden="true" />
          <input
            id={`newsletter-${source}`}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            maxLength={200}
            className="input bg-black/30 pl-10"
            aria-describedby={state === 'error' ? `newsletter-error-${source}` : undefined}
          />
        </div>
        <button type="submit" className="btn btn-primary shrink-0" disabled={state === 'loading'}>
          {state === 'loading' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          {state === 'loading' ? 'Joining' : 'Subscribe'}
        </button>
      </div>
      {state === 'error' && (
        <p id={`newsletter-error-${source}`} className="mt-2 text-xs text-coral" role="alert">
          {message}
        </p>
      )}
      <p className="mt-2.5 text-[0.68rem] leading-relaxed text-muted-2">
        One sharp briefing each weekday. No spam. Unsubscribe any time.
      </p>
    </form>
  );
}
