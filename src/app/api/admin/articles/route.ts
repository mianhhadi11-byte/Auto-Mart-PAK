import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiActor } from '@/lib/api-auth';
import {
  createArticle,
  listAdminArticles,
  RepositoryError,
} from '@/lib/cms/repository';
import { assertSameOrigin, jsonError } from '@/lib/security';
import { articleInputSchema, fieldErrors } from '@/lib/validation';
import type { ArticleInput, ArticleStatus } from '@/lib/types';

export async function GET(request: Request) {
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);
  const url = new URL(request.url);
  const result = await listAdminArticles({
    status: (url.searchParams.get('status') as ArticleStatus | 'all' | null) || 'all',
    q: url.searchParams.get('q') || undefined,
    category: url.searchParams.get('category') || undefined,
    authorId: actor.role === 'contributor' ? actor.authorId : undefined,
    page: Number(url.searchParams.get('page') || 1),
  });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);

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
    const article = await createArticle(input, actor);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, article }, { status: 201 });
  } catch (error) {
    if (error instanceof RepositoryError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : 'Could not save the story.', 500);
  }
}
