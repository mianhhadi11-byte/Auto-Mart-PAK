import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { requireUser } from '@/lib/auth/dal';
import { listAuthors, listCategories } from '@/lib/cms/repository';

export const metadata = { title: 'New story' };

export default async function NewArticlePage() {
  const user = await requireUser('/admin/articles/new');
  const [authors, categories] = await Promise.all([listAuthors(), listCategories()]);

  return (
    <ArticleEditor
      article={null}
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
