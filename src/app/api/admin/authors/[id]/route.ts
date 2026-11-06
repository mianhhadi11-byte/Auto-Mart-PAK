import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiActor } from '@/lib/api-auth';
import { deleteAuthor, RepositoryError, updateAuthor } from '@/lib/cms/repository';
import { assertSameOrigin, jsonError } from '@/lib/security';
import { authorInputSchema, fieldErrors } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

async function parseBody(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return null;
  }
  return authorInputSchema.safeParse(payload);
}

export async function PATCH(request: Request, { params }: Params) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);
  if (actor.role === 'contributor') return jsonError('Contributors cannot manage authors.', 403);

  const parsed = await parseBody(request);
  if (!parsed) return jsonError('Send a JSON body.', 400);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Check the author details.', errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { id } = await params;
  try {
    const author = await updateAuthor(
      decodeURIComponent(id),
      {
        ...parsed.data,
        email: parsed.data.email || undefined,
        twitter: parsed.data.twitter || undefined,
        linkedin: parsed.data.linkedin || undefined,
      },
      actor,
    );
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, author });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not save the author.', 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);
  const { id } = await params;
  try {
    await deleteAuthor(decodeURIComponent(id), actor);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not delete the author.', 500);
  }
}
