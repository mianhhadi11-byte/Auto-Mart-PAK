import { NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/cms/repository';
import { assertSameOrigin, clientKey, jsonError, rateLimit } from '@/lib/security';
import { newsletterSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const limit = rateLimit(clientKey(request, 'unsubscribe'), 10, 10 * 60 * 1000);
  if (!limit.ok) return jsonError(`Please try again in ${limit.retryAfter} seconds.`, 429);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Send a JSON body.', 400);
  }
  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) return jsonError('Enter a valid email address.', 422);

  const removed = await unsubscribe(parsed.data.email);
  return NextResponse.json({
    ok: true,
    removed,
    message: removed
      ? 'That email has been removed from the briefing list.'
      : 'That email was not on the briefing list.',
  });
}
