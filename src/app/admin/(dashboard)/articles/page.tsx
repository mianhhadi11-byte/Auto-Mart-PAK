import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleTable } from '@/components/admin/ArticleTable';
import { requireUser } from '@/lib/auth/dal';
import { listAdminArticles, listCategories } from '@/lib/cms/repository';
import { cn } from '@/lib/utils';
import type { ArticleStatus } from '@/lib/types';

export const metadata = { title: 'Stories' };

const STATUS_TABS: Array<{ value: ArticleStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'review', label: 'In review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const VALID_STATUS = new Set(STATUS_TABS.map((tab) => tab.value));

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; category?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const status = (VALID_STATUS.has(params.status as ArticleStatus | 'all')
    ? params.status
    : 'all') as ArticleStatus | 'all';
  const q = params.q?.trim() || '';
  const page = Math.max(1, Number(params.page) || 1);
  const category = params.category || undefined;

  const [result, categories] = await Promise.all([
    listAdminArticles({
      status,
      q: q || undefined,
      category,
      page,
      perPage: 20,
      authorId: user.role === 'contributor' ? user.authorId || '__no_author__' : undefined,
    }),
    listCategories(),
  ]);

  function tabHref(value: ArticleStatus | 'all') {
    const next = new URLSearchParams();
    if (value !== 'all') next.set('status', value);
    if (q) next.set('q', q);
    if (category) next.set('category', category);
    const query = next.toString();
    return query ? `/admin/articles?${query}` : '/admin/articles';
  }

  function pageHref(target: number) {
    const next = new URLSearchParams();
    if (status !== 'all') next.set('status', status);
    if (q) next.set('q', q);
    if (category) next.set('category', category);
    if (target > 1) next.set('page', String(target));
    const query = next.toString();
    return query ? `/admin/articles?${query}` : '/admin/articles';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Content pipeline"
        title={user.role === 'contributor' ? 'My stories' : 'All stories'}
        description={
          user.role === 'contributor'
            ? 'Draft, revise and submit your work. An editor reviews every story before publication.'
            : 'Create, edit, schedule and publish. Flags control what appears on the homepage.'
        }
        actions={
          <Link href="/admin/articles/new" className="btn btn-primary">
            <Plus className="size-4" />
            New story
          </Link>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="hide-scrollbar flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count = result.counts[tab.value];
            const active = status === tab.value;
            return (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-signal/40 bg-signal/10 text-signal'
                    : 'border-line text-muted hover:border-line hover:bg-white/[0.03] hover:text-paper',
                )}
              >
                {tab.label}
                <span className={cn('text-[0.62rem]', active ? 'text-signal/70' : 'text-muted-2')}>{count}</span>
              </Link>
            );
          })}
        </nav>

        <form action="/admin/articles" method="get" className="flex gap-2">
          {status !== 'all' ? <input type="hidden" name="status" value={status} /> : null}
          <div className="relative min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-2" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search stories, slugs, tags…"
              aria-label="Search stories"
              className="input !py-2 pl-8 text-xs"
            />
          </div>
          <select
            name="category"
            defaultValue={category || ''}
            aria-label="Filter by category"
            className="input !w-auto !py-2 text-xs"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary !py-2 !text-xs">
            Filter
          </button>
        </form>
      </div>

      {q || category ? (
        <p className="text-xs text-muted-2">
          {result.total} result{result.total === 1 ? '' : 's'}
          {q ? ` for “${q}”` : ''}
          {category ? ` in ${categories.find((item) => item.slug === category)?.name || category}` : ''}.{' '}
          <Link href="/admin/articles" className="text-signal hover:underline">
            Clear filters
          </Link>
        </p>
      ) : null}

      <ArticleTable articles={result.articles} role={user.role} />

      {result.pages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-2">
            Page {result.page} of {result.pages} · {result.total} stories
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link href={pageHref(result.page - 1)} className="btn btn-secondary !py-1.5 !text-xs">
                Previous
              </Link>
            ) : null}
            {result.page < result.pages ? (
              <Link href={pageHref(result.page + 1)} className="btn btn-secondary !py-1.5 !text-xs">
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
