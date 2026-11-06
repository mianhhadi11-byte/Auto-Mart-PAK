'use client';

import { useMemo, useState } from 'react';
import { Download, Search, Users } from 'lucide-react';
import type { Subscriber } from '@/lib/types';

export function SubscriberTools({ subscribers }: { subscribers: Subscriber[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return subscribers.filter((subscriber) => {
      if (status !== 'all' && subscriber.status !== status) return false;
      if (!term) return true;
      return subscriber.email.includes(term) || subscriber.source.toLowerCase().includes(term);
    });
  }, [subscribers, query, status]);

  function exportCsv() {
    const rows = [
      ['email', 'status', 'source', 'created_at'],
      ...filtered.map((subscriber) => [
        subscriber.email,
        subscriber.status,
        subscriber.source,
        subscriber.createdAt,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mictech-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-2" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input !py-2 pl-8 text-xs"
              placeholder="Search email or source…"
              aria-label="Search subscribers"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="input !w-auto !py-2 text-xs"
            aria-label="Filter subscriber status"
          >
            <option value="all">All subscribers</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
        <button type="button" onClick={exportCsv} className="btn btn-secondary !py-2 !text-xs" disabled={!filtered.length}>
          <Download className="size-3.5" />
          Export CSV
        </button>
      </div>

      <div className="panel overflow-hidden rounded-xl">
        {filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Users className="mx-auto size-6 text-muted-2" />
            <p className="mt-2 font-display text-sm font-medium text-paper">No subscribers in this view</p>
            <p className="mt-1 text-xs text-muted-2">Newsletter signups from the public site appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/70 text-[0.62rem] uppercase tracking-[0.14em] text-muted-2">
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filtered.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-xs text-paper">{subscriber.email}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`badge text-[0.58rem] ${
                          subscriber.status === 'active'
                            ? 'border-signal/30 text-signal'
                            : 'border-line text-muted-2'
                        }`}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">{subscriber.source || 'website'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-2">
                      {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-[0.68rem] text-muted-2">
        Showing {filtered.length} of {subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'}.
      </p>
    </div>
  );
}
