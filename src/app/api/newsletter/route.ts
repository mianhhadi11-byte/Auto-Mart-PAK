import { NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/cms/repository';
import { sendWelcomeEmail } from '@/lib/newsletter';
import { assertSameOrigin, clientKey, jsonError, rateLimit } from '@/lib/security';
import { fieldErrors, newsletterSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const limit = rateLimit(clientKey(request, 'newsletter'), 6, 10 * 60 * 1000);
  if (!limit.ok) return jsonError(`Please try again in ${limit.retryAfter} seconds.`, 429);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Send a JSON body.', 400);
  }
  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Enter a valid email address.', errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const subscriber = await addSubscriber(parsed.data.email, parsed.data.source || 'website');
  const email = await sendWelcomeEmail(subscriber.email);
  return NextResponse.json({
    ok: true,
    message: 'You are on the list. Watch your inbox for the next briefing.',
    subscriber: { email: subscriber.email, status: subscriber.status },
    emailSent: email.sent,
  });
}
