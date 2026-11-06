import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { Role } from '@/lib/types';
import { findUserById } from '@/lib/cms/repository';
import { getSession } from './session';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  authorId?: string;
  lastLoginAt?: string;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;
  const user = await findUserById(session.sub);
  if (!user || user.email !== session.email || user.role !== session.role) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authorId: user.authorId,
    lastLoginAt: user.lastLoginAt,
  };
});

export async function requireUser(nextPath = '/admin'): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireRole(roles: Role[], nextPath = '/admin'): Promise<CurrentUser> {
  const user = await requireUser(nextPath);
  if (!roles.includes(user.role)) redirect('/admin?error=forbidden');
  return user;
}

export function canPublish(role: Role) {
  return role === 'admin' || role === 'editor';
}

export function canManageAuthors(role: Role) {
  return role === 'admin' || role === 'editor';
}

export function canManageNewsroom(role: Role) {
  return role === 'admin';
}
