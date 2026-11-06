import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SubscriberTools } from '@/components/admin/SubscriberTools';
import { requireRole } from '@/lib/auth/dal';
import { listSubscribers } from '@/lib/cms/repository';

export const metadata = { title: 'Subscribers' };

export default async function AdminSubscribersPage() {
  await requireRole(['admin', 'editor'], '/admin/subscribers');
  const subscribers = await listSubscribers();
  const active = subscribers.filter((subscriber) => subscriber.status === 'active').length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Newsletter"
        title="Subscribers"
        description="Everyone who signed up for the MIC TECH briefing. Unsubscribes are honoured immediately. Export the current filtered view as CSV."
        actions={
          <div className="flex gap-2">
            <span className="badge border-signal/30 text-signal">{active} active</span>
            <span className="badge border-line text-muted-2">{subscribers.length} total</span>
          </div>
        }
      />
      <SubscriberTools subscribers={subscribers} />
    </div>
  );
}
