import type { ArticleStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: 'border-line text-muted bg-white/[0.02]',
  review: 'border-amber/30 text-amber bg-amber/10',
  scheduled: 'border-aqua/30 text-aqua bg-aqua/10',
  published: 'border-signal/30 text-signal bg-signal/10',
  archived: 'border-coral/30 text-coral bg-coral/10',
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Draft',
  review: 'In review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

export function StatusBadge({ status, className }: { status: ArticleStatus; className?: string }) {
  return (
    <span className={cn('badge', STATUS_STYLES[status], className)}>{STATUS_LABELS[status]}</span>
  );
}

export function statusLabel(status: ArticleStatus) {
  return STATUS_LABELS[status];
}
