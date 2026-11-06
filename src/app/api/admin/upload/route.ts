import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { apiActor } from '@/lib/api-auth';
import { isSanityConfigured, uploadSanityImage } from '@/lib/cms/sanity';
import { assertSameOrigin, jsonError, rateLimit } from '@/lib/security';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError('Cross-site request blocked.', 403);
  const actor = await apiActor();
  if (!actor) return jsonError('Sign in to continue.', 401);
  const limit = rateLimit(`upload:${actor.id}`, 30, 60 * 60 * 1000);
  if (!limit.ok) return jsonError(`Upload limit reached. Try again in ${limit.retryAfter} seconds.`, 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError('Send multipart form data.', 400);
  }
  const file = form.get('file');
  if (!(file instanceof File)) return jsonError('Choose an image file.', 400);
  if (file.size === 0) return jsonError('The selected file is empty.', 400);
  if (file.size > MAX_BYTES) return jsonError('Images must be smaller than 8 MB.', 413);
  if (!ALLOWED.has(file.type)) return jsonError('Use a JPEG, PNG, WebP or AVIF image.', 415);

  const input = Buffer.from(await file.arrayBuffer());
  let optimized: Buffer;
  try {
    const image = sharp(input, { failOn: 'error' });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) throw new Error('No image dimensions.');
    optimized = await image
      .rotate()
      .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
  } catch {
    return jsonError('That file could not be read as a valid image.', 422);
  }

  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'mictech-image';
  const filename = `${base}-${randomUUID().slice(0, 8)}.webp`;

  try {
    if (isSanityConfigured()) {
      const uploaded = await uploadSanityImage(optimized, filename, 'image/webp');
      return NextResponse.json({ ok: true, url: uploaded.url, assetId: uploaded.assetId, storage: 'sanity' });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (blobToken) {
      const blob = await put(`uploads/${filename}`, optimized, {
        access: 'public',
        token: blobToken,
        contentType: 'image/webp',
        addRandomSuffix: false,
      });
      return NextResponse.json({ ok: true, url: blob.url, assetId: blob.pathname, storage: 'vercel-blob' });
    }

    const directory = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), optimized);
    return NextResponse.json({ ok: true, url: `/uploads/${filename}`, storage: 'local' });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'The image could not be stored.',
      500,
    );
  }
}
