import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiActor } from '@/lib/api-auth';
import { deleteArticle, RepositoryError, updateArticle } from '@/lib/cms/repository';
import { assertSameOrigin, jsonError } from '@/lib/security';
import { articleInputSchema, fieldErrors } from '@/lib/validation';
import type { ArticleInput } from '@/lib/types';

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

  const parsed = articleInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Check the highlighted fields.', errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const input: ArticleInput = {
    ...data,
    videoUrl: data.videoUrl || undefined,
    seoTitle: data.seoTitle || undefined,
    seoDescription: data.seoDescription || undefined,
    socialCaption: data.socialCaption || undefined,
    sourceName: data.sourceName || undefined,
    sourceUrl: data.sourceUrl || undefined,
  };

  try {
    const article = await updateArticle(decodeURIComponent(id), input, actor);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, article });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not save the story.', 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);
  const { id } = await params;
  try {
    await deleteArticle(decodeURIComponent(id), actor);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not delete the story.', 500);
  }
}
