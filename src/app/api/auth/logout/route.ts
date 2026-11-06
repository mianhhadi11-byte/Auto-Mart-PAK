import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/auth/session';
import { apiActor } from '@/lib/api-auth';
import { recordAudit } from '@/lib/cms/repository';
import { assertSameOrigin, jsonError } from '@/lib/security';

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  await deleteSessionCookie();
  if (actor) {
    await recordAudit(actor, 'auth.logout', 'Admin dashboard', 'Session ended.');
  }
  return NextResponse.json({ ok: true });
}
