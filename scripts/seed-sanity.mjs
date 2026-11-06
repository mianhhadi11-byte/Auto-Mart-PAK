#!/usr/bin/env node
/**
 * Seed a hosted Sanity dataset from the local editorial store.
 *
 * Usage:
 *   1. Run the site once so data/mictech.json is created (npm run dev).
 *   2. Add NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN to .env.local.
 *   3. npm run seed:sanity
 *
 * The script is idempotent: documents are created or replaced with stable IDs.
 * Local image files referenced by the store are uploaded to Sanity as assets.
 */

import { createClient } from '@sanity/client';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function loadEnvFile(file) {
  const full = path.join(root, file);
  return fs
    .readFile(full, 'utf8')
    .then((raw) => {
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(trimmed);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (process.env[key]) continue;
        process.env[key] = rawValue.replace(/^["']|["']$/g, '');
      }
    })
    .catch(() => undefined);
}

await loadEnvFile('.env.local');
await loadEnvFile('.env');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2025-01-01';
const sourcePath = process.env.MICTECH_DATA_FILE || path.join(root, 'data', 'mictech.json');

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Add it to .env.local first.');
  process.exit(1);
}
if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN. Create an Editor token in sanity.io/manage.');
  process.exit(1);
}

let store;
try {
  store = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
} catch (error) {
  console.error(`Could not read ${sourcePath}.`);
  console.error('Run `npm run dev` once to create the local editorial store, then try again.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const assetCache = new Map();
const contentTypes = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
};

async function uploadLocalImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/')) return undefined;
  if (assetCache.has(imageUrl)) return assetCache.get(imageUrl);

  const filePath = path.join(root, 'public', imageUrl.replace(/^\//, ''));
  try {
    const buffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const asset = await client.assets.upload('image', buffer, {
      filename: path.basename(filePath),
      contentType: contentTypes[extension] || 'application/octet-stream',
    });
    const reference = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
    assetCache.set(imageUrl, reference);
    console.log(`  uploaded image ${path.basename(filePath)} → ${asset._id}`);
    return reference;
  } catch (error) {
    console.warn(`  ! could not upload ${imageUrl}: ${error instanceof Error ? error.message : error}`);
    return undefined;
  }
}

console.log(`Seeding ${store.articles.length} articles, ${store.authors.length} authors and ${store.categories.length} categories`);
console.log(`Project ${projectId} / dataset ${dataset}`);

let written = 0;

for (const category of store.categories) {
  await client.createOrReplace({
    _id: `category-${category.slug}`,
    _type: 'category',
    name: category.name,
    slug: { _type: 'slug', current: category.slug },
    description: category.description,
    kicker: category.kicker,
    accent: category.accent,
    order: category.order,
  });
  written += 1;
}

for (const author of store.authors) {
  await client.createOrReplace({
    _id: author.id.startsWith('author-') ? author.id : `author-${author.slug}`,
    _type: 'author',
    name: author.name,
    slug: { _type: 'slug', current: author.slug },
    role: author.role,
    bio: author.bio,
    initials: author.initials,
    avatarColor: author.avatarColor,
    email: author.email || undefined,
    twitter: author.twitter || undefined,
    linkedin: author.linkedin || undefined,
  });
  written += 1;
}

for (const article of store.articles) {
  const image = await uploadLocalImage(article.imageUrl);
  await client.createOrReplace({
    _id: article.id.startsWith('article-') ? article.id : `article-${article.slug}`,
    _type: 'article',
    title: article.title,
    slug: { _type: 'slug', current: article.slug },
    excerpt: article.excerpt,
    body: article.body,
    category: { _type: 'reference', _ref: `category-${article.categorySlug}` },
    categorySlug: article.categorySlug,
    author: { _type: 'reference', _ref: article.authorId },
    authorId: article.authorId,
    ...(image ? { image } : {}),
    imageAlt: article.imageAlt,
    imageCredit: article.imageCredit,
    status: article.status,
    featured: article.featured,
    trending: article.trending,
    breaking: article.breaking,
    publishedAt: article.publishedAt,
    videoUrl: article.videoUrl || undefined,
    tags: article.tags,
    seoTitle: article.seoTitle || article.title,
    seoDescription: article.seoDescription || article.excerpt.slice(0, 155),
    socialCaption: article.socialCaption || undefined,
    sourceName: article.sourceName || undefined,
    sourceUrl: article.sourceUrl || undefined,
    readMinutes: article.readMinutes,
    views: article.views || 0,
    rating: article.rating,
    aiAssisted: Boolean(article.aiAssisted),
  });
  written += 1;
  console.log(`  ✓ ${article.status.padEnd(9)} ${article.title}`);
}

console.log(`\nDone. Wrote ${written} documents to ${projectId}/${dataset}.`);
console.log('Open /studio to review the content, then set the webhook secret and start the site.');
