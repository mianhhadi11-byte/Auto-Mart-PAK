import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CalendarClock,
  Eye,
  FileText,
  Mail,
  PenLine,
  Plus,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireUser } from '@/lib/auth/dal';
import {
  getDashboardStats,
  listAdminArticles,
  listAudit,
} from '@/lib/cms/repository';
import { formatDateParts, timeAgo } from '@/lib/utils';

export const metadata = { title: 'Overview' };

export default async function AdminOverviewPage() {
  const user = await requireUser();
  const actor = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authorId: user.authorId,
  };
  const isContributor = user.role === 'contributor';
  const authorScope = isContributor ? user.authorId || '__no_author__' : undefined;

  const [stats, reviewQueue, recent, audit] = await Promise.all([
    getDashboardStats(actor),
    listAdminArticles({ status: 'review', perPage: 5, authorId: authorScope }),
    listAdminArticles({ status: 'all', perPage: 6, authorId: authorScope }),
    isContributor ? Promise.resolve([]) : listAudit(8),
  ]);

  const cards = [
    {
      label: isContributor ? 'My stories' : 'All stories',
      value: stats.total.toLocaleString(),
      detail: `${stats.thisMonth} created this month`,
      icon: FileText,
      accent: 'text-signal',
    },
    {
      label: 'Published',
      value: stats.published.toLocaleString(),
      detail: `${stats.views.toLocaleString()} total views`,
      icon: Eye,
      accent: 'text-aqua',
    },
    {
      label: 'In review',
      value: stats.review.toLocaleString(),
      detail: stats.review > 0 ? 'Waiting for an editor' : 'Queue is clear',
      icon: ShieldAlert,
      accent: 'text-amber',
    },
    {
      label: 'Scheduled',
      value: stats.scheduled.toLocaleString(),
      detail: 'Ready for future publication',
      icon: CalendarClock,
      accent: 'text-[#a78bfa]',
    },
  ];

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Newsroom overview"
        title={`Good to see you, ${user.name}.`}
        description={
          isContributor
            ? 'Draft your stories, attach verified sources and submit them for editorial review.'
            : 'Track the publishing pipeline, clear the review queue and keep the public site current.'
        }
        actions={
          <>
            <Link href="/admin/articles/new" className="btn btn-primary">
              <Plus className="size-4" />
              New story
            </Link>
            <Link href="/admin/articles" className="btn btn-secondary">
              All stories
            </Link>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Newsroom statistics">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="panel rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
                  {card.label}
                </p>
                <Icon className={`size-4 ${card.accent}`} />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-paper">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-2">{card.detail}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-paper">
                {isContributor ? 'Your submissions in review' : 'Review queue'}
              </h2>
              <p className="mt-0.5 text-xs text-muted-2">
                {isContributor
                  ? 'Your stories waiting for an editor to approve.'
                  : 'Stories waiting for an editor to approve.'}
              </p>
            </div>
            <Link href="/admin/articles?status=review" className="text-xs font-medium text-signal hover:underline">
              Open queue
            </Link>
          </div>
          {reviewQueue.articles.length === 0 ? (
            <EmptyState
              title="No stories waiting"
              body={
                isContributor
                  ? 'Submit a draft for review and it will appear here for the editorial team.'
                  : 'The review queue is clear. New submissions will appear here.'
              }
              href="/admin/articles/new"
              action="Start a draft"
            />
          ) : (
            <ul className="divide-y divide-line/60">
              {reviewQueue.articles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${encodeURIComponent(article.id)}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-amber/25 bg-amber/10 font-display text-xs font-semibold text-amber">
                      {article.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-paper">{article.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-2">
                        {article.author.name} · {article.category.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-[0.68rem] text-muted-2">{timeAgo(article.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-paper">Publishing snapshot</h2>
            <Sparkles className="size-4 text-signal" />
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Drafts</dt>
              <dd className="font-medium text-paper">{stats.drafts}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Active subscribers</dt>
              <dd className="font-medium text-paper">
                {isContributor ? '—' : stats.subscribers.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Author profiles</dt>
              <dd className="font-medium text-paper">{stats.authors}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Backend</dt>
              <dd className="text-right text-xs font-medium text-signal">{stats.backend}</dd>
            </div>
          </dl>
          <div className="mt-4 space-y-2 border-t border-line/70 pt-4">
            <Link href="/admin/articles/new" className="btn btn-secondary w-full !justify-between !rounded-lg">
              Write a story
              <PenLine className="size-3.5" />
            </Link>
            {!isContributor ? (
              <Link href="/admin/authors" className="btn btn-secondary w-full !justify-between !rounded-lg">
                Manage authors
                <Users className="size-3.5" />
              </Link>
            ) : null}
            {!isContributor ? (
              <Link href="/admin/subscribers" className="btn btn-secondary w-full !justify-between !rounded-lg">
                Newsletter list
                <Mail className="size-3.5" />
              </Link>
            ) : (
              <Link href="/admin/policy" className="btn btn-secondary w-full !justify-between !rounded-lg">
                Editorial policy
                <BookOpenText className="size-3.5" />
              </Link>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-paper">Recently updated</h2>
            <Link href="/admin/articles" className="text-xs font-medium text-signal hover:underline">
              View all
            </Link>
          </div>
          {recent.articles.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              body="Your first story will appear here once you start writing."
              href="/admin/articles/new"
              action="Write the first story"
            />
          ) : (
            <ul className="divide-y divide-line/60">
              {recent.articles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${encodeURIComponent(article.id)}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-paper">{article.title}</span>
                      <span className="mt-0.5 block text-[0.68rem] text-muted-2">
                        {article.category.name} · Updated {timeAgo(article.updatedAt)}
                      </span>
                    </span>
                    <StatusBadge status={article.status} />
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-paper">Newsroom activity</h2>
            <span className="badge border-line text-[0.6rem] text-muted-2">Audit log</span>
          </div>
          {audit.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">Activity appears here after your first action.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {audit.map((event) => (
                <li key={event.id} className="px-4 py-2.5">
                  <p className="text-xs text-paper">
                    <span className="font-medium">{event.actorName}</span>{' '}
                    <span className="text-muted-2">{event.action.replace(/\./g, ' ')}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[0.68rem] text-muted-2">
                    {event.target} · {formatDateParts(event.createdAt).date}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {reviewQueue.articles.length === 0 && stats.review === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-line/70 bg-panel/50 px-4 py-3 text-xs text-muted-2">
          <ArrowRight className="size-3.5 text-signal" />
          Published stories go live immediately at{' '}
          <Link href="/" target="_blank" className="text-signal hover:underline">
            mictech.news
          </Link>
          . No redeploy required.
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-display text-sm font-medium text-paper">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-2">{body}</p>
      <Link href={href} className="btn btn-secondary mt-4 !py-1.5 !text-xs">
        {action}
      </Link>
    </div>
  );
}
