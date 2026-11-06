import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiActor } from '@/lib/api-auth';
import { RepositoryError, updateArticleFlags } from '@/lib/cms/repository';
import { assertSameOrigin, jsonError } from '@/lib/security';
import { fieldErrors, flagsSchema } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);

  const { id } = await params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Send a JSON body.', 400);
  }
  const parsed = flagsSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid publishing flags.', errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const article = await updateArticleFlags(decodeURIComponent(id), parsed.data, actor);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, article });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not update the story.', 500);
  }
}
