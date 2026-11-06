import 'server-only';
import { NextResponse } from 'next/server';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: Request, suffix = '') {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  return `${ip}:${suffix}`;
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return false;
  }
  return true;
}

export function safeNextPath(value: string | null | undefined, fallback = '/admin') {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}
