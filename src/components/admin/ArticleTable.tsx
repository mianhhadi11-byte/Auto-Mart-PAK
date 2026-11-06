'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Flame,
  Loader2,
  MoreHorizontal,
  Pencil,
  Send,
  Star,
  Trash2,
  TrendingUp,
  Undo2,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { cn, timeAgo } from '@/lib/utils';
import type { Role, Story } from '@/lib/types';

interface ArticleTableProps {
  articles: Story[];
  role: Role;
}

interface RowState {
  pending: boolean;
  error: string;
  confirmingDelete: boolean;
}

export function ArticleTable({ articles, role }: ArticleTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [nowMs] = useState(() => Date.now());

  const isContributor = role === 'contributor';

  function stateFor(id: string): RowState {
    return rows[id] ?? { pending: false, error: '', confirmingDelete: false };
  }

  function patchRow(id: string, patch: Partial<RowState>) {
    setRows((current) => ({
      ...current,
      [id]: { ...stateFor(id), ...patch },
    }));
  }

  async function request(id: string, action: 'flags' | 'delete', body?: Record<string, unknown>) {
    patchRow(id, { pending: true, error: '', confirmingDelete: false });
    try {
      const response = await fetch(
        action === 'delete'
          ? `/api/admin/articles/${encodeURIComponent(id)}`
          : `/api/admin/articles/${encodeURIComponent(id)}/flags`,
        {
          method: action === 'delete' ? 'DELETE' : 'PATCH',
          headers: action === 'delete' ? undefined : { 'Content-Type': 'application/json' },
          body: action === 'delete' ? undefined : JSON.stringify(body),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        patchRow(id, { pending: false, error: payload.error || 'That action could not be completed.' });
        return;
      }
      patchRow(id, { pending: false });
      router.refresh();
    } catch {
      patchRow(id, { pending: false, error: 'Network error. Try again.' });
    }
  }

  if (articles.length === 0) {
    return (
      <div className="panel rounded-xl px-6 py-14 text-center">
        <p className="font-display text-base font-medium text-paper">No stories match this view</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-2">
          Try a different status or search term, or start a new story.
        </p>
        <Link href="/admin/articles/new" className="btn btn-primary mt-5">
          New story
        </Link>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-line/70 text-[0.62rem] uppercase tracking-[0.14em] text-muted-2">
              <th className="px-4 py-3 font-semibold">Story</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Flags</th>
              <th className="px-3 py-3 font-semibold">Updated</th>
              <th className="px-3 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {articles.map((article) => {
              const row = stateFor(article.id);
              const live =
                Boolean(article.publishedAt) &&
                new Date(article.publishedAt as string).getTime() <= nowMs &&
                (article.status === 'published' || article.status === 'scheduled');
              return (
                <tr key={article.id} className="align-top transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-panel-2 font-display text-[0.65rem] font-semibold text-muted"
                      >
                        {article.category.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/articles/${encodeURIComponent(article.id)}`}
                          className="line-clamp-2 font-medium text-paper hover:text-signal"
                        >
                          {article.title}
                        </Link>
                        <p className="mt-1 text-[0.68rem] text-muted-2">
                          {article.category.name} · {article.author.name}
                        </p>
                        {row.error ? (
                          <p role="alert" className="mt-1 text-[0.68rem] text-coral">
                            {row.error}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={article.status} />
                    {article.status === 'scheduled' && article.publishedAt ? (
                      <p className="mt-1 text-[0.65rem] text-muted-2">
                        {new Date(article.publishedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZone: 'UTC',
                          timeZoneName: 'short',
                        })}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {article.featured ? <Flag icon={Star} label="Featured" tone="text-amber" /> : null}
                      {article.trending ? <Flag icon={TrendingUp} label="Trending" tone="text-aqua" /> : null}
                      {article.breaking ? <Flag icon={Flame} label="Breaking" tone="text-coral" /> : null}
                      {!article.featured && !article.trending && !article.breaking ? (
                        <span className="text-[0.68rem] text-muted-2">—</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">{timeAgo(article.updatedAt)}</td>
                  <td className="px-3 py-3 text-xs text-muted">
                    {article.views > 0 ? article.views.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {live ? (
                        <Link
                          href={`/article/${article.slug}`}
                          target="_blank"
                          className="btn btn-ghost size-8 !p-0"
                          aria-label={`View ${article.title}`}
                          title="View on site"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                      ) : null}
                      <Link
                        href={`/admin/articles/${encodeURIComponent(article.id)}`}
                        className="btn btn-ghost size-8 !p-0"
                        aria-label={`Edit ${article.title}`}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Link>

                      {!isContributor && !row.pending ? (
                        <>
                          {article.status === 'review' || article.status === 'draft' ? (
                            <button
                              type="button"
                              onClick={() => request(article.id, 'flags', { status: 'published' })}
                              className="btn btn-ghost size-8 !p-0 hover:!text-signal"
                              aria-label={`Publish ${article.title}`}
                              title="Publish now"
                            >
                              <Send className="size-3.5" />
                            </button>
                          ) : null}
                          {article.status === 'published' ? (
                            <button
                              type="button"
                              onClick={() => request(article.id, 'flags', { status: 'draft', publishedAt: null })}
                              className="btn btn-ghost size-8 !p-0 hover:!text-amber"
                              aria-label={`Unpublish ${article.title}`}
                              title="Move back to draft"
                            >
                              <Undo2 className="size-3.5" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => request(article.id, 'flags', { featured: !article.featured })}
                            className={cn('btn btn-ghost size-8 !p-0', article.featured && 'text-amber')}
                            aria-label={article.featured ? 'Remove featured flag' : 'Feature story'}
                            title={article.featured ? 'Remove featured flag' : 'Feature story'}
                          >
                            <Star className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => request(article.id, 'flags', { trending: !article.trending })}
                            className={cn('btn btn-ghost size-8 !p-0', article.trending && 'text-aqua')}
                            aria-label={article.trending ? 'Remove trending flag' : 'Mark as trending'}
                            title={article.trending ? 'Remove trending flag' : 'Mark as trending'}
                          >
                            <TrendingUp className="size-3.5" />
                          </button>
                          {row.confirmingDelete ? (
                            <span className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => request(article.id, 'delete')}
                                className="btn btn-danger !px-2 !py-1 !text-[0.65rem]"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => patchRow(article.id, { confirmingDelete: false })}
                                className="btn btn-ghost !px-2 !py-1 !text-[0.65rem]"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => patchRow(article.id, { confirmingDelete: true })}
                              className="btn btn-ghost size-8 !p-0 hover:!text-coral"
                              aria-label={`Delete ${article.title}`}
                              title="Delete story"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </>
                      ) : null}

                      {row.pending ? <Loader2 className="size-3.5 animate-spin text-muted" /> : null}
                      {isContributor ? <MoreHorizontal className="size-3.5 text-muted-2" /> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Flag({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Star;
  label: string;
  tone: string;
}) {
  return (
    <span
      title={label}
      className={cn('inline-flex items-center gap-1 rounded border border-line/70 px-1.5 py-0.5 text-[0.6rem]', tone)}
    >
      <Icon className="size-2.5" />
      {label}
    </span>
  );
}
