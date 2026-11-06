import { notFound } from 'next/navigation';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { requireUser } from '@/lib/auth/dal';
import { getAdminArticle, listAuthors, listCategories } from '@/lib/cms/repository';

export const metadata = { title: 'Edit story' };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const article = await getAdminArticle(decodeURIComponent(id));

  if (!article) notFound();
  if (user.role === 'contributor' && article.authorId !== user.authorId) notFound();

  const [authors, categories] = await Promise.all([listAuthors(), listCategories()]);

  return (
    <ArticleEditor
      article={article}
      authors={authors}
      categories={categories}
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        authorId: user.authorId,
      }}
    />
  );
}
