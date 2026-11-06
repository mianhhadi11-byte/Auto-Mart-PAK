import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken, isAuthConfigured, setSessionCookie } from '@/lib/auth/session';
import { findUserByEmail, recordAudit, recordLogin } from '@/lib/cms/repository';
import {
  assertSameOrigin,
  clearRateLimit,
  clientKey,
  jsonError,
  rateLimit,
  safeNextPath,
} from '@/lib/security';
import { loginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  if (!isAuthConfigured()) {
    console.error('[mictech] Refusing sign-in: AUTH_SECRET is not set on this production server.');
    return jsonError(
      'Newsroom sign-in is not configured on this server. Set AUTH_SECRET to a long random string and restart.',
      503,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Send a JSON body.', 400);
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Check your email and password.', 422);
  }

  const { email, password, next } = parsed.data;
  const key = clientKey(request, `login:${email.toLowerCase()}`);
  const limit = rateLimit(key, 6, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limit.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const user = await findUserByEmail(email);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    return jsonError('Email or password is incorrect.', 401);
  }

  clearRateLimit(key);
  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);
  await recordLogin(user.id);
  await recordAudit(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      authorId: user.authorId,
    },
    'auth.login',
    'Admin dashboard',
    'Successful sign-in.',
  );

  return NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
    redirect: safeNextPath(next),
  });
}
