import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAG } from '@/lib/constants';

export async function POST(request: Request) {
  const configured = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_REVALIDATE_SECRET is not configured.' },
      { status: 503 },
    );
  }
  const url = new URL(request.url);
  const provided =
    url.searchParams.get('secret') || request.headers.get('x-sanity-webhook-secret') || '';
  if (provided !== configured) {
    return NextResponse.json({ ok: false, error: 'Invalid webhook secret.' }, { status: 401 });
  }
  revalidateTag(CACHE_TAG, 'max');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, revalidated: true, at: new Date().toISOString() });
}
