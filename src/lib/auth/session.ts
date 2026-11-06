import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { Role, SessionPayload } from '@/lib/types';

export const SESSION_COOKIE = 'mictech_session';
const SESSION_HOURS = 8;

const DEV_SECRET = 'mictech-local-development-secret-change-before-production';
const encoder = new TextEncoder();
let cachedSecret: Uint8Array | null = null;
let warned = false;

/**
 * Production must sign sessions with a deployment-specific secret. Local
 * development falls back to a fixed value so the demo accounts keep working
 * across restarts. The secret is resolved lazily so a build never fails just
 * because the variable is missing; sign-in does.
 */
export function isAuthConfigured() {
  if (process.env.NODE_ENV !== 'production') return true;
  return Boolean(process.env.AUTH_SECRET?.trim());
}

function sessionSecret() {
  if (cachedSecret) return cachedSecret;
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'MIC TECH auth is not configured. Set AUTH_SECRET to a random string of at least 32 characters.',
      );
    }
    if (!warned) {
      warned = true;
      console.warn('[mictech] AUTH_SECRET is not set. Using the development session secret.');
    }
    cachedSecret = encoder.encode(DEV_SECRET);
    return cachedSecret;
  }
  if (process.env.NODE_ENV === 'production' && value.length < 32) {
    throw new Error('AUTH_SECRET is too short. Use at least 32 random characters in production.');
  }
  cachedSecret = encoder.encode(value);
  return cachedSecret;
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
}) {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(sessionSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  // Without a production secret no session can be trusted. Refuse the cookie
  // instead of throwing on every request; sign-in reports the misconfiguration.
  if (!isAuthConfigured()) return null;
  let key: Uint8Array;
  try {
    key = sessionSecret();
  } catch {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : payload.email,
      role: payload.role as Role,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function deleteSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
