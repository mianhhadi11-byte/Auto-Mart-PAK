'use client';

import { useState } from 'react';
import { Check, Loader2, Mail } from 'lucide-react';

export function UnsubscribeForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('loading');
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'unsubscribe-page' }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        setState('error');
        setMessage(data.error || 'That did not work.');
        return;
      }
      setState('success');
      setMessage(data.message || 'You have been removed from the briefing list.');
    } catch {
      setState('error');
      setMessage('Network error. Try again.');
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-signal/25 bg-signal/10 p-4 text-sm text-paper">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-signal text-ink">
          <Check className="size-4" aria-hidden="true" />
        </span>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="label" htmlFor="unsubscribe-email">
        Email address
      </label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" aria-hidden="true" />
        <input
          id="unsubscribe-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input pl-10"
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>
      {state === 'error' && (
        <p className="text-xs text-coral" role="alert">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn-secondary w-full" disabled={state === 'loading'}>
        {state === 'loading' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Unsubscribe
      </button>
    </form>
  );
}
