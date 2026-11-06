import 'server-only';
import { getCurrentUser } from '@/lib/auth/dal';
import type { Actor } from '@/lib/cms/repository';

export async function apiActor(): Promise<Actor | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authorId: user.authorId,
  };
}
