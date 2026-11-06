import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AuthorsManager } from '@/components/admin/AuthorsManager';
import { requireRole } from '@/lib/auth/dal';
import { listAuthors } from '@/lib/cms/repository';

export const metadata = { title: 'Authors' };

export default async function AdminAuthorsPage() {
  await requireRole(['admin', 'editor'], '/admin/authors');
  const authors = await listAuthors();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Byline management"
        title="Authors"
        description="Author profiles power bylines, the public author pages and article structured data. Stories must be reassigned before a profile can be deleted."
      />
      <AuthorsManager authors={authors} />
    </div>
  );
}
