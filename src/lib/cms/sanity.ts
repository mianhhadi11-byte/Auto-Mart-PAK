import 'server-only';
import { createClient, type SanityClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { Article, ArticleInput, Author, Category, CategorySlug, ContentBlock } from '@/lib/types';
import { CATEGORY_META } from '@/lib/constants';
import { contentStats } from '@/lib/utils';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2025-01-01';
const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || '';
const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim() || '';

export function isSanityConfigured() {
  return Boolean(projectId);
}

let readClient: SanityClient | null = null;
let writeClient: SanityClient | null = null;

export function sanityClient(): SanityClient {
  if (!isSanityConfigured()) {
    throw new Error('Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID to enable hosted CMS mode.');
  }
  if (!readClient) {
    readClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token: readToken || undefined,
      useCdn: !readToken,
      perspective: 'published',
    });
  }
  return readClient;
}

export function sanityWriteClient(): SanityClient {
  if (!isSanityConfigured()) {
    throw new Error('Sanity is not configured.');
  }
  if (!writeToken) {
    throw new Error(
      'SANITY_API_WRITE_TOKEN is missing. Add a write token with Editor permissions to publish from the admin dashboard.',
    );
  }
  if (!writeClient) {
    writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token: writeToken,
      useCdn: false,
      perspective: 'published',
    });
  }
  return writeClient;
}

export function urlForImage(source: { asset?: { _ref?: string } } | string | undefined) {
  if (!source) return undefined;
  const builder = imageUrlBuilder({ projectId, dataset });
  return builder.image(source as never);
}

interface SanitySlug {
  current?: string;
}

interface SanityImage {
  asset?: { _ref?: string };
}

interface SanityArticleDoc {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  title?: string;
  slug?: SanitySlug;
  excerpt?: string;
  body?: ContentBlock[];
  categorySlug?: CategorySlug;
  authorId?: string;
  image?: SanityImage;
  imageAlt?: string;
  imageCredit?: string;
  status?: Article['status'];
  featured?: boolean;
  trending?: boolean;
  breaking?: boolean;
  publishedAt?: string | null;
  videoUrl?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  socialCaption?: string;
  sourceName?: string;
  sourceUrl?: string;
  readMinutes?: number;
  views?: number;
  rating?: number;
  aiAssisted?: boolean;
  editorId?: string;
}

interface SanityAuthorDoc {
  _id: string;
  _createdAt?: string;
  name?: string;
  slug?: SanitySlug;
  role?: string;
  bio?: string;
  initials?: string;
  avatarColor?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
}

interface SanityCategoryDoc {
  _id: string;
  name?: string;
  slug?: SanitySlug;
  description?: string;
  kicker?: string;
  accent?: string;
  order?: number;
}

function imageUrlFor(doc: SanityArticleDoc): string {
  const ref = doc.image?.asset?._ref;
  if (!ref) return '/images/editorial/signal-ai-mesh.webp';
  try {
    return urlForImage(doc.image)?.width(1600).fit('max').url() ?? '/images/editorial/signal-ai-mesh.webp';
  } catch {
    return '/images/editorial/signal-ai-mesh.webp';
  }
}

function mapArticle(doc: SanityArticleDoc): Article {
  const slug = doc.slug?.current || doc._id.replace(/^article-/, '');
  return {
    id: doc._id,
    title: doc.title || 'Untitled story',
    slug,
    excerpt: doc.excerpt || '',
    body: Array.isArray(doc.body) ? doc.body : [],
    categorySlug: doc.categorySlug || 'technology',
    authorId: doc.authorId || '',
    imageUrl: imageUrlFor(doc),
    imageAssetId: doc.image?.asset?._ref,
    imageAlt: doc.imageAlt || doc.title || 'MIC TECH editorial illustration',
    imageCredit: doc.imageCredit || 'MIC TECH Studio',
    status: doc.status || 'draft',
    featured: Boolean(doc.featured),
    trending: Boolean(doc.trending),
    breaking: Boolean(doc.breaking),
    publishedAt: doc.publishedAt || null,
    updatedAt: doc._updatedAt || doc._createdAt || new Date().toISOString(),
    createdAt: doc._createdAt || new Date().toISOString(),
    videoUrl: doc.videoUrl || undefined,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    seoTitle: doc.seoTitle || undefined,
    seoDescription: doc.seoDescription || undefined,
    socialCaption: doc.socialCaption || undefined,
    sourceName: doc.sourceName || undefined,
    sourceUrl: doc.sourceUrl || undefined,
    readMinutes: Number(doc.readMinutes) || 1,
    views: Number(doc.views) || 0,
    rating: typeof doc.rating === 'number' ? doc.rating : undefined,
    aiAssisted: Boolean(doc.aiAssisted),
    editorId: doc.editorId || undefined,
  };
}

function mapAuthor(doc: SanityAuthorDoc): Author {
  const slug = doc.slug?.current || doc._id.replace(/^author-/, '');
  return {
    id: doc._id,
    name: doc.name || slug,
    slug,
    role: doc.role || 'Contributor',
    bio: doc.bio || '',
    initials:
      doc.initials ||
      (doc.name || slug)
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(''),
    avatarColor: doc.avatarColor || 'from-lime-300/35 to-emerald-500/10 text-lime-100',
    email: doc.email || undefined,
    twitter: doc.twitter || undefined,
    linkedin: doc.linkedin || undefined,
    createdAt: doc._createdAt,
  };
}

function mapCategory(doc: SanityCategoryDoc): Category | null {
  const slug = doc.slug?.current as CategorySlug | undefined;
  if (!slug || !(slug in CATEGORY_META)) return null;
  const meta = CATEGORY_META[slug];
  return {
    id: doc._id,
    name: doc.name || meta.name,
    slug,
    description: doc.description || meta.description,
    kicker: doc.kicker || meta.kicker,
    accent: doc.accent || meta.accent,
    order: typeof doc.order === 'number' ? doc.order : meta.order,
  };
}

export interface SanityContent {
  articles: Article[];
  authors: Author[];
  categories: Category[];
}

export async function fetchSanityContent(): Promise<SanityContent> {
  const client = sanityClient();
  const [articleDocs, authorDocs, categoryDocs] = await Promise.all([
    client.fetch<SanityArticleDoc[]>(
      `*[_type == "article"] | order(coalesce(publishedAt, _updatedAt) desc) {
        _id, _createdAt, _updatedAt, title, slug, excerpt, body,
        "categorySlug": coalesce(category->slug.current, categorySlug),
        "authorId": coalesce(author->_id, authorId),
        image, imageAlt, imageCredit, status, featured, trending, breaking, publishedAt,
        videoUrl, tags, seoTitle, seoDescription, socialCaption, sourceName, sourceUrl,
        readMinutes, views, rating, aiAssisted, editorId
      }`,
    ),
    client.fetch<SanityAuthorDoc[]>(
      `*[_type == "author"] | order(name asc) {
        _id, _createdAt, name, slug, role, bio, initials, avatarColor, email, twitter, linkedin
      }`,
    ),
    client.fetch<SanityCategoryDoc[]>(
      `*[_type == "category"] | order(order asc) { _id, name, slug, description, kicker, accent, order }`,
    ),
  ]);

  return {
    articles: articleDocs.map(mapArticle),
    authors: authorDocs.map(mapAuthor),
    categories: categoryDocs.map(mapCategory).filter((item): item is Category => Boolean(item)),
  };
}

function articleToDoc(input: ArticleInput, slug: string, id?: string): Record<string, unknown> {
  const stats = contentStats(input.body);
  const doc: Record<string, unknown> = {
    _type: 'article',
    title: input.title,
    slug: { _type: 'slug', current: slug },
    excerpt: input.excerpt,
    body: input.body,
    categorySlug: input.categorySlug,
    category: { _type: 'reference', _ref: `category-${input.categorySlug}` },
    authorId: input.authorId,
    author: { _type: 'reference', _ref: input.authorId },
    imageAlt: input.imageAlt,
    imageCredit: input.imageCredit,
    status: input.status,
    featured: input.featured,
    trending: input.trending,
    breaking: input.breaking,
    publishedAt: input.publishedAt,
    tags: input.tags,
    seoTitle: input.seoTitle || input.title,
    seoDescription: input.seoDescription || input.excerpt.slice(0, 155),
    socialCaption: input.socialCaption,
    readMinutes: stats.minutes,
    views: 0,
    aiAssisted: input.aiAssisted,
    videoUrl: input.videoUrl || undefined,
    sourceName: input.sourceName || undefined,
    sourceUrl: input.sourceUrl || undefined,
    rating: input.rating,
  };
  if (input.imageAssetId) {
    doc.image = {
      _type: 'image',
      asset: { _type: 'reference', _ref: input.imageAssetId },
    };
  }
  if (id) {
    doc._id = id;
    if (id.startsWith('drafts.')) doc._id = id.replace(/^drafts\./, '');
  }
  return doc;
}

export async function saveSanityArticle(
  input: ArticleInput,
  slug: string,
  id?: string,
): Promise<Article> {
  const client = sanityWriteClient();
  const docId = id || `article-${slug}`;
  const result = await client.createOrReplace(articleToDoc(input, slug, docId) as never);
  const mapped = mapArticle(result as SanityArticleDoc);
  return { ...mapped, imageUrl: input.imageUrl || mapped.imageUrl };
}

export async function patchSanityArticle(
  id: string,
  fields: Partial<Pick<ArticleInput, 'status' | 'featured' | 'trending' | 'breaking' | 'publishedAt'>>,
): Promise<Article> {
  const client = sanityWriteClient();
  const result = await client
    .patch(id)
    .set(fields as Record<string, unknown>)
    .commit({ visibility: 'sync' });
  return mapArticle(result as SanityArticleDoc);
}

export async function deleteSanityArticle(id: string): Promise<void> {
  const client = sanityWriteClient();
  await client.delete(id);
}

export async function uploadSanityImage(
  data: Buffer,
  filename: string,
  contentType: string,
): Promise<{ url: string; assetId: string }> {
  const client = sanityWriteClient();
  const asset = await client.assets.upload('image', data, { filename, contentType });
  const url = urlForImage({ asset: { _ref: asset._id } })?.width(1600).fit('max').url() || '';
  return { url, assetId: asset._id };
}

export async function saveSanityAuthor(input: {
  id?: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
}): Promise<Author> {
  const client = sanityWriteClient();
  const doc = {
    _id: input.id || `author-${input.slug}`,
    _type: 'author',
    name: input.name,
    slug: { _type: 'slug', current: input.slug },
    role: input.role,
    bio: input.bio,
    email: input.email || undefined,
    twitter: input.twitter || undefined,
    linkedin: input.linkedin || undefined,
  };
  const result = await client.createOrReplace(doc as never);
  return mapAuthor(result as SanityAuthorDoc);
}

export async function deleteSanityAuthor(id: string): Promise<void> {
  const client = sanityWriteClient();
  await client.delete(id);
}
