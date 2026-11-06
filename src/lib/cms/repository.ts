import 'server-only';
import { cache } from 'react';
import type {
  Article,
  ArticleInput,
  ArticleStatus,
  AuditEvent,
  Author,
  Category,
  CategorySlug,
  HomepageData,
  Role,
  SiteSettings,
  StoreData,
  Story,
  Subscriber,
} from '@/lib/types';
import { CATEGORY_META, CATEGORY_SLUGS } from '@/lib/constants';
import { blocksToSearchText, contentStats, slugify } from '@/lib/utils';
import { readStore, mutateStore, localStorePath } from './local-store';
import {
  deleteSanityArticle,
  deleteSanityAuthor,
  fetchSanityContent,
  isSanityConfigured,
  patchSanityArticle,
  saveSanityArticle,
  saveSanityAuthor,
  type SanityContent,
} from './sanity';

export class RepositoryError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'RepositoryError';
    this.status = status;
  }
}

export interface Actor {
  id: string;
  name: string;
  email: string;
  role: Role;
  authorId?: string;
}

export interface ContentSource extends SanityContent {
  categories: Category[];
}

const loadContent = cache(async (): Promise<ContentSource> => {
  if (isSanityConfigured()) {
    const content = await fetchSanityContent();
    return { ...content, categories: mergeCategories(content.categories) };
  }
  const store = await readStore();
  return {
    articles: store.articles,
    authors: store.authors,
    categories: mergeCategories(store.categories),
  };
});

function mergeCategories(categories: Category[]): Category[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  return CATEGORY_SLUGS.map((slug) => {
    const meta = CATEGORY_META[slug];
    const existing = bySlug.get(slug);
    return (
      existing ?? {
        id: `cat-${slug}`,
        slug,
        name: meta.name,
        kicker: meta.kicker,
        description: meta.description,
        accent: meta.accent,
        order: meta.order,
      }
    );
  }).sort((a, b) => a.order - b.order);
}

function fallbackAuthor(): Author {
  return {
    id: 'author-mictech-newsroom',
    name: 'MIC TECH Newsroom',
    slug: 'mictech-newsroom',
    role: 'Newsroom',
    bio: 'Reporting and analysis from the MIC TECH editorial team.',
    initials: 'MT',
    avatarColor: 'from-lime-300/35 to-cyan-500/10 text-lime-100',
  };
}

function decorate(article: Article, content: ContentSource): Story {
  const author = content.authors.find((item) => item.id === article.authorId) ?? fallbackAuthor();
  const category =
    content.categories.find((item) => item.slug === article.categorySlug) ??
    content.categories[0] ?? {
      id: 'cat-technology',
      slug: 'technology' as CategorySlug,
      name: 'Technology',
      kicker: 'Systems',
      description: '',
      accent: '#57d9ff',
      order: 1,
    };
  return { ...article, author, category };
}

export function isPublicArticle(article: Article, now = Date.now()) {
  if (!article.publishedAt) return false;
  const published = new Date(article.publishedAt).getTime();
  if (Number.isNaN(published) || published > now) return false;
  return article.status === 'published' || article.status === 'scheduled';
}

function byPublishedDesc(a: Story, b: Story) {
  return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
}

const getPublishedStories = cache(async (): Promise<Story[]> => {
  const content = await loadContent();
  return content.articles.filter((article) => isPublicArticle(article)).map((article) => decorate(article, content)).sort(byPublishedDesc);
});

export async function getSiteSettings(): Promise<SiteSettings> {
  const store = await readStore();
  return store.settings;
}

export async function listCategories(): Promise<Category[]> {
  const content = await loadContent();
  return content.categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function listAuthors(): Promise<Author[]> {
  const content = await loadContent();
  return content.authors;
}

export async function getAuthor(slug: string): Promise<Author | null> {
  const authors = await listAuthors();
  return authors.find((author) => author.slug === slug || author.id === slug) ?? null;
}

export async function getAuthorWithStories(
  slug: string,
): Promise<{ author: Author; stories: Story[] } | null> {
  const author = await getAuthor(slug);
  if (!author) return null;
  const stories = (await getPublishedStories()).filter((story) => story.author.id === author.id);
  return { author, stories };
}

export async function listPublishedStories(options: {
  category?: string;
  q?: string;
  page?: number;
  perPage?: number;
  tag?: string;
} = {}): Promise<{
  stories: Story[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
}> {
  let stories = await getPublishedStories();
  const perPage = Math.min(Math.max(options.perPage ?? 12, 1), 48);

  if (options.category) {
    stories = stories.filter((story) => story.category.slug === options.category);
  }
  if (options.tag) {
    const tag = options.tag.toLowerCase();
    stories = stories.filter((story) => story.tags.some((item) => item.toLowerCase() === tag));
  }
  if (options.q) {
    const query = options.q.trim().toLowerCase();
    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      stories = stories.filter((story) => {
        const haystack = [
          story.title,
          story.excerpt,
          story.author.name,
          story.category.name,
          story.tags.join(' '),
          blocksToSearchText(story.body),
        ]
          .join(' ')
          .toLowerCase();
        return terms.every((term) => haystack.includes(term));
      });
      stories = stories.sort((a, b) => {
        const score = (story: Story) =>
          (story.title.toLowerCase().includes(query) ? 5 : 0) +
          (story.tags.some((tag) => tag.toLowerCase().includes(query)) ? 2 : 0);
        return score(b) - score(a) || byPublishedDesc(a, b);
      });
    }
  }

  const total = stories.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, options.page ?? 1), pages);
  return {
    stories: stories.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    pages,
    perPage,
  };
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const stories = await getPublishedStories();
  return stories.find((story) => story.slug === slug) ?? null;
}

export async function getRelatedStories(story: Story, limit = 4): Promise<Story[]> {
  const stories = await getPublishedStories();
  const sameCategory = stories.filter(
    (item) => item.id !== story.id && item.category.slug === story.category.slug,
  );
  const sharedTags = stories.filter(
    (item) =>
      item.id !== story.id &&
      item.category.slug !== story.category.slug &&
      item.tags.some((tag) => story.tags.includes(tag)),
  );
  const trending = stories.filter((item) => item.id !== story.id && item.trending);
  const pool = [...sameCategory, ...sharedTags, ...trending, ...stories];
  const seen = new Set<string>();
  const result: Story[] = [];
  for (const item of pool) {
    if (seen.has(item.id) || item.id === story.id) continue;
    seen.add(item.id);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

export async function getHomepageData(): Promise<HomepageData> {
  const stories = await getPublishedStories();
  const categories = await listCategories();
  const featured = stories.filter((story) => story.featured).slice(0, 5);
  const breaking = stories.filter((story) => story.breaking).slice(0, 4);
  const trending = stories.filter((story) => story.trending).slice(0, 6);
  const latest = stories.slice(0, 12);
  const mostRead = [...stories].sort((a, b) => b.views - a.views).slice(0, 5);
  const videos = stories.filter((story) => story.videoUrl).slice(0, 4);
  const guides = stories
    .filter((story) => story.category.slug === 'guides' || story.category.slug === 'reviews')
    .slice(0, 5);
  const opinion = stories.filter((story) => story.category.slug === 'opinion').slice(0, 4);

  // Every editorial desk is represented on the front page. The first four are
  // rendered as full sections; the rest appear in the compact "More desks" band.
  const deskOrder = [
    'technology',
    'ai',
    'business',
    'mobile',
    'startups',
    'gadgets',
    'telecom',
    'social-media',
    'automobile',
    'education',
  ] as const;
  const featuredCategories = deskOrder
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is Category => Boolean(category))
    .map((category) => ({
      category,
      stories: stories.filter((story) => story.category.slug === category.slug).slice(0, 3),
    }))
    .filter((entry) => entry.stories.length > 0);

  return {
    breaking: breaking.length > 0 ? breaking : stories.slice(0, 3),
    featured: featured.length > 0 ? featured : stories.slice(0, 5),
    trending,
    latest,
    mostRead,
    categories: featuredCategories,
    videos,
    guides,
    opinion,
  };
}

export async function getVideoStories(limit = 12): Promise<Story[]> {
  const stories = await getPublishedStories();
  return stories.filter((story) => story.videoUrl).slice(0, limit);
}

export async function getSitemapData() {
  const [stories, authors, categories] = await Promise.all([
    getPublishedStories(),
    listAuthors(),
    listCategories(),
  ]);
  return { stories, authors, categories };
}

/* ------------------------------------------------------------------ */
/* Editorial users                                                     */
/* ------------------------------------------------------------------ */

export async function findUserByEmail(email: string) {
  const store = await readStore();
  return store.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const store = await readStore();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function recordLogin(userId: string) {
  return mutateStore((data) => {
    const user = data.users.find((item) => item.id === userId);
    if (user) user.lastLoginAt = new Date().toISOString();
    return user ?? null;
  });
}

/* ------------------------------------------------------------------ */
/* Admin queries                                                       */
/* ------------------------------------------------------------------ */

export interface AdminArticleFilters {
  status?: ArticleStatus | 'all';
  q?: string;
  category?: string;
  authorId?: string;
  page?: number;
  perPage?: number;
}

export async function listAdminArticles(filters: AdminArticleFilters = {}): Promise<{
  articles: Story[];
  total: number;
  page: number;
  pages: number;
  counts: Record<ArticleStatus | 'all', number>;
}> {
  const content = await loadContent();
  let articles = content.articles.map((article) => decorate(article, content));

  const counts: Record<ArticleStatus | 'all', number> = {
    all: articles.length,
    draft: 0,
    review: 0,
    scheduled: 0,
    published: 0,
    archived: 0,
  };
  for (const article of articles) counts[article.status] += 1;

  if (filters.authorId) articles = articles.filter((article) => article.authorId === filters.authorId);
  if (filters.status && filters.status !== 'all') {
    articles = articles.filter((article) => article.status === filters.status);
  }
  if (filters.category) {
    articles = articles.filter((article) => article.category.slug === filters.category);
  }
  if (filters.q) {
    const query = filters.q.toLowerCase();
    articles = articles.filter((article) =>
      [article.title, article.slug, article.author.name, article.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }

  articles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const perPage = Math.min(Math.max(filters.perPage ?? 20, 1), 100);
  const total = articles.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, filters.page ?? 1), pages);
  return {
    articles: articles.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    pages,
    counts,
  };
}

export async function getAdminArticle(id: string): Promise<Story | null> {
  const content = await loadContent();
  const article =
    content.articles.find((item) => item.id === id || item.slug === id) ?? null;
  return article ? decorate(article, content) : null;
}

function validateRoleForStatus(actor: Actor, status: ArticleStatus) {
  if (actor.role === 'contributor' && (status === 'published' || status === 'scheduled')) {
    throw new RepositoryError(
      'Contributors can save drafts or submit for review. An editor must publish or schedule this story.',
      403,
    );
  }
}

function assertCanEdit(actor: Actor, article: Article) {
  if (actor.role === 'contributor') {
    if (article.authorId !== actor.authorId) {
      throw new RepositoryError('Contributors can only edit their own stories.', 403);
    }
    if (article.status === 'published' || article.status === 'scheduled' || article.status === 'archived') {
      throw new RepositoryError('Published stories can only be changed by an editor.', 403);
    }
  }
}

async function ensureUniqueSlug(slug: string, content: ContentSource, excludeId?: string) {
  const base = slugify(slug) || `story-${Date.now()}`;
  let candidate = base;
  let index = 2;
  while (content.articles.some((article) => article.slug === candidate && article.id !== excludeId)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

async function appendAudit(actor: Actor, action: string, target: string, detail?: string) {
  const event: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: actor.id,
    actorName: actor.name,
    action,
    target,
    detail,
    createdAt: new Date().toISOString(),
  };
  await mutateStore((data) => {
    data.audit.unshift(event);
    data.audit = data.audit.slice(0, 200);
  });
  return event;
}

export async function recordAudit(actor: Actor, action: string, target: string, detail?: string) {
  return appendAudit(actor, action, target, detail);
}

export async function createArticle(input: ArticleInput, actor: Actor): Promise<Article> {
  validateRoleForStatus(actor, input.status);
  const content = await loadContent();
  const slug = await ensureUniqueSlug(input.slug || input.title, content);
  const now = new Date().toISOString();
  const stats = contentStats(input.body);
  const publishedAt =
    input.status === 'published'
      ? input.publishedAt || now
      : input.status === 'scheduled'
        ? input.publishedAt
        : null;

  if (input.status === 'scheduled') {
    if (!publishedAt || new Date(publishedAt).getTime() <= Date.now()) {
      throw new RepositoryError('Choose a future date and time for a scheduled story.');
    }
  }

  const article: Article = {
    ...input,
    id: `article-${slug}`,
    slug,
    authorId: actor.role === 'contributor' && actor.authorId ? actor.authorId : input.authorId,
    publishedAt,
    createdAt: now,
    updatedAt: now,
    readMinutes: stats.minutes,
    views: 0,
    editorId: actor.id,
  };

  if (isSanityConfigured()) {
    const saved = await saveSanityArticle(article, slug);
    await appendAudit(actor, 'article.create', saved.title, `Status: ${saved.status}`);
    return saved;
  }

  await mutateStore((data) => {
    data.articles.unshift(article);
  });
  await appendAudit(actor, 'article.create', article.title, `Status: ${article.status}`);
  return article;
}

export async function updateArticle(id: string, input: ArticleInput, actor: Actor): Promise<Article> {
  const content = await loadContent();
  const existing = content.articles.find((article) => article.id === id || article.slug === id);
  if (!existing) throw new RepositoryError('Story not found.', 404);
  assertCanEdit(actor, existing);
  validateRoleForStatus(actor, input.status);

  const slug = await ensureUniqueSlug(input.slug || existing.slug, content, existing.id);
  const now = new Date().toISOString();
  const stats = contentStats(input.body);
  const publishedAt =
    input.status === 'published'
      ? input.publishedAt || existing.publishedAt || now
      : input.status === 'scheduled'
        ? input.publishedAt
        : input.status === 'draft' || input.status === 'review'
          ? null
          : input.publishedAt;

  if (input.status === 'scheduled' && (!publishedAt || new Date(publishedAt).getTime() <= Date.now())) {
    throw new RepositoryError('Choose a future date and time for a scheduled story.');
  }

  const next: Article = {
    ...existing,
    ...input,
    id: existing.id,
    slug,
    authorId: actor.role === 'contributor' && actor.authorId ? actor.authorId : input.authorId,
    publishedAt,
    updatedAt: now,
    readMinutes: stats.minutes,
    views: existing.views,
    editorId: actor.id,
  };

  if (isSanityConfigured()) {
    const saved = await saveSanityArticle(next, slug, existing.id);
    await appendAudit(actor, 'article.update', saved.title, `Status: ${saved.status}`);
    return { ...saved, publishedAt, imageUrl: input.imageUrl || saved.imageUrl };
  }

  await mutateStore((data) => {
    const index = data.articles.findIndex((article) => article.id === existing.id);
    if (index >= 0) data.articles[index] = next;
  });
  await appendAudit(actor, 'article.update', next.title, `Status: ${next.status}`);
  return next;
}

export async function updateArticleFlags(
  id: string,
  flags: Partial<Pick<Article, 'featured' | 'trending' | 'breaking' | 'status' | 'publishedAt'>>,
  actor: Actor,
): Promise<Article> {
  if (actor.role === 'contributor') {
    throw new RepositoryError('Contributors cannot change publishing flags.', 403);
  }
  const content = await loadContent();
  const existing = content.articles.find((article) => article.id === id || article.slug === id);
  if (!existing) throw new RepositoryError('Story not found.', 404);
  if (flags.status) validateRoleForStatus(actor, flags.status);

  const next: Article = {
    ...existing,
    ...flags,
    updatedAt: new Date().toISOString(),
    publishedAt:
      flags.status === 'published'
        ? flags.publishedAt || existing.publishedAt || new Date().toISOString()
        : flags.publishedAt !== undefined
          ? flags.publishedAt
          : existing.publishedAt,
  };

  if (isSanityConfigured()) {
    const saved = await patchSanityArticle(existing.id, {
      status: next.status,
      featured: next.featured,
      trending: next.trending,
      breaking: next.breaking,
      publishedAt: next.publishedAt,
    });
    await appendAudit(actor, 'article.flags', next.title, `Status: ${next.status}`);
    return { ...saved, imageUrl: existing.imageUrl };
  }

  await mutateStore((data) => {
    const index = data.articles.findIndex((article) => article.id === existing.id);
    if (index >= 0) data.articles[index] = next;
  });
  await appendAudit(actor, 'article.flags', next.title, `Status: ${next.status}`);
  return next;
}

export async function deleteArticle(id: string, actor: Actor): Promise<void> {
  if (actor.role === 'contributor') {
    throw new RepositoryError('Contributors cannot delete stories. Ask an editor.', 403);
  }
  const content = await loadContent();
  const existing = content.articles.find((article) => article.id === id || article.slug === id);
  if (!existing) throw new RepositoryError('Story not found.', 404);

  if (isSanityConfigured()) {
    await deleteSanityArticle(existing.id);
  } else {
    await mutateStore((data) => {
      data.articles = data.articles.filter((article) => article.id !== existing.id);
    });
  }
  await appendAudit(actor, 'article.delete', existing.title);
}

export async function createAuthor(
  input: {
    name: string;
    slug: string;
    role: string;
    bio: string;
    email?: string;
    twitter?: string;
    linkedin?: string;
  },
  actor: Actor,
): Promise<Author> {
  if (actor.role === 'contributor') throw new RepositoryError('Not allowed.', 403);
  const content = await loadContent();
  const slug = slugify(input.slug || input.name);
  if (content.authors.some((author) => author.slug === slug)) {
    throw new RepositoryError('An author with that slug already exists.');
  }

  let author: Author;
  if (isSanityConfigured()) {
    author = await saveSanityAuthor({ ...input, slug });
  } else {
    author = {
      id: `author-${slug}`,
      name: input.name,
      slug,
      role: input.role,
      bio: input.bio,
      email: input.email,
      twitter: input.twitter,
      linkedin: input.linkedin,
      initials: input.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(''),
      avatarColor: 'from-lime-300/35 to-cyan-500/10 text-lime-100',
      createdAt: new Date().toISOString(),
    };
    await mutateStore((data) => {
      data.authors.push(author);
    });
  }
  await appendAudit(actor, 'author.create', author.name);
  return author;
}

export async function updateAuthor(
  id: string,
  input: {
    name: string;
    slug: string;
    role: string;
    bio: string;
    email?: string;
    twitter?: string;
    linkedin?: string;
  },
  actor: Actor,
): Promise<Author> {
  if (actor.role === 'contributor') throw new RepositoryError('Not allowed.', 403);
  const content = await loadContent();
  const existing = content.authors.find((author) => author.id === id);
  if (!existing) throw new RepositoryError('Author not found.', 404);
  const slug = slugify(input.slug || existing.slug);

  let author: Author;
  if (isSanityConfigured()) {
    author = await saveSanityAuthor({ ...input, slug, id: existing.id });
  } else {
    author = {
      ...existing,
      ...input,
      slug,
      initials: input.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(''),
    };
    await mutateStore((data) => {
      const index = data.authors.findIndex((item) => item.id === existing.id);
      if (index >= 0) data.authors[index] = author;
    });
  }
  await appendAudit(actor, 'author.update', author.name);
  return author;
}

export async function deleteAuthor(id: string, actor: Actor): Promise<void> {
  if (actor.role !== 'admin' && actor.role !== 'editor') {
    throw new RepositoryError('Not allowed.', 403);
  }
  const content = await loadContent();
  const existing = content.authors.find((author) => author.id === id);
  if (!existing) throw new RepositoryError('Author not found.', 404);
  if (content.articles.some((article) => article.authorId === id)) {
    throw new RepositoryError('Reassign this author’s stories before deleting the profile.');
  }
  if (isSanityConfigured()) {
    await deleteSanityAuthor(id);
  } else {
    await mutateStore((data) => {
      data.authors = data.authors.filter((author) => author.id !== id);
    });
  }
  await appendAudit(actor, 'author.delete', existing.name);
}

/* ------------------------------------------------------------------ */
/* Subscribers, audit and dashboard                                    */
/* ------------------------------------------------------------------ */

export async function listSubscribers(): Promise<Subscriber[]> {
  const store = await readStore();
  return [...store.subscribers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function addSubscriber(email: string, source: string): Promise<Subscriber> {
  const normalized = email.trim().toLowerCase();
  return mutateStore((data) => {
    const existing = data.subscribers.find((subscriber) => subscriber.email === normalized);
    if (existing) {
      existing.status = 'active';
      return existing;
    }
    const subscriber: Subscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: normalized,
      createdAt: new Date().toISOString(),
      source,
      status: 'active',
    };
    data.subscribers.unshift(subscriber);
    return subscriber;
  });
}

export async function unsubscribe(email: string): Promise<boolean> {
  return mutateStore((data) => {
    const subscriber = data.subscribers.find(
      (item) => item.email === email.trim().toLowerCase(),
    );
    if (!subscriber) return false;
    subscriber.status = 'unsubscribed';
    return true;
  });
}

export async function listAudit(limit = 30): Promise<AuditEvent[]> {
  const store = await readStore();
  return store.audit.slice(0, limit);
}

export async function getDashboardStats(actor: Actor) {
  const content = await loadContent();
  const articles = content.articles.filter(
    (article) => actor.role !== 'contributor' || article.authorId === actor.authorId,
  );
  const published = articles.filter((article) => isPublicArticle(article));
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  return {
    total: articles.length,
    published: published.length,
    drafts: articles.filter((article) => article.status === 'draft').length,
    review: articles.filter((article) => article.status === 'review').length,
    scheduled: articles.filter((article) => article.status === 'scheduled').length,
    views: published.reduce((total, article) => total + article.views, 0),
    thisMonth: articles.filter((article) => new Date(article.createdAt) >= monthStart).length,
    subscribers: (await readStore()).subscribers.filter((item) => item.status === 'active').length,
    authors: content.authors.length,
    backend: isSanityConfigured() ? 'Sanity hosted CMS' : 'Local editorial store',
    storePath: isSanityConfigured() ? 'Sanity dataset' : localStorePath(),
  };
}

export async function getTrendingTags(limit = 12): Promise<Array<{ tag: string; count: number }>> {
  const stories = await getPublishedStories();
  const counts = new Map<string, number>();
  for (const story of stories) {
    for (const tag of story.tags) {
      const key = tag.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function findUserAuthorId(userId: string): Promise<string | undefined> {
  const store: StoreData = await readStore();
  return store.users.find((user) => user.id === userId)?.authorId;
}
