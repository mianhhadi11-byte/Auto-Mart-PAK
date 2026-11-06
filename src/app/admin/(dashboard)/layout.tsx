import { AdminShell } from '@/components/admin/AdminShell';
import { requireUser } from '@/lib/auth/dal';
import { isSanityConfigured } from '@/lib/cms/sanity';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const backend = isSanityConfigured()
    ? 'Sanity hosted CMS. Stories are stored in your dataset.'
    : 'Local editorial store. Stories are saved to data/mictech.json.';

  return (
    <AdminShell
      user={{ id: user.id, name: user.name, email: user.email, role: user.role }}
      backend={backend}
    >
      {children}
    </AdminShell>
  );
}
