import { NextResponse } from 'next/server';
import { apiActor } from '@/lib/api-auth';
import { runAi } from '@/lib/ai';
import { assertSameOrigin, jsonError, rateLimit } from '@/lib/security';
import { aiRequestSchema, fieldErrors } from '@/lib/validation';

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);

  const limit = rateLimit(`ai:${actor.id}`, 40, 60 * 60 * 1000);
  if (!limit.ok) return jsonError(`AI rate limit reached. Try again in ${limit.retryAfter} seconds.`, 429);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Send a JSON body.', 400);
  }
  const parsed = aiRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Check the assistant request.', errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  if (!parsed.data.text?.trim() && parsed.data.sources.length === 0) {
    return jsonError('Add source notes or a draft before asking the assistant.', 422);
  }

  const result = await runAi(parsed.data);
  return NextResponse.json({ ok: true, result });
}
