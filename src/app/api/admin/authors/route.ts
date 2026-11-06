import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiActor } from '@/lib/api-auth';
import { createAuthor, RepositoryError } from '@/lib/cms/repository';
import { assertSameOrigin, jsonError } from '@/lib/security';
import { authorInputSchema, fieldErrors } from '@/lib/validation';

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);
  if (actor.role === 'contributor') return jsonError('Contributors cannot manage authors.', 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Send a JSON body.', 400);
  }
  const parsed = authorInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Check the author details.', errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const author = await createAuthor(
      {
        ...parsed.data,
        email: parsed.data.email || undefined,
        twitter: parsed.data.twitter || undefined,
        linkedin: parsed.data.linkedin || undefined,
      },
      actor,
    );
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, author }, { status: 201 });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not save the author.', 500);
  }
}
