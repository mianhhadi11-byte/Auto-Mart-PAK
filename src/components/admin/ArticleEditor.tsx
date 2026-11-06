'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Send,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { AiAssistant } from '@/components/admin/AiAssistant';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { blockToPlainText, cn, createBlock, key, slugify } from '@/lib/utils';
import type { AiResponse, AiTask } from '@/lib/ai';
import type {
  Article,
  ArticleStatus,
  Author,
  Category,
  CategorySlug,
  ContentBlock,
  Role,
  Story,
} from '@/lib/types';

type RowStyle = ContentBlock['style'] | 'bullet' | 'number';

interface BodyRow {
  id: string;
  style: RowStyle;
  text: string;
}

interface ArticleEditorProps {
  article: Story | null;
  authors: Author[];
  categories: Category[];
  user: { id: string; name: string; role: Role; authorId?: string };
}

interface ApiError {
  path: string;
  message: string;
}

const STATUS_OPTIONS: ArticleStatus[] = ['draft', 'review', 'scheduled', 'published', 'archived'];

const STYLE_OPTIONS: Array<{ value: RowStyle; label: string }> = [
  { value: 'normal', label: 'Paragraph' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'blockquote', label: 'Quote' },
  { value: 'bullet', label: 'Bullet list item' },
  { value: 'number', label: 'Numbered list item' },
];

function toRows(body: ContentBlock[]): BodyRow[] {
  // Initial row ids must be deterministic so server and client markup match.
  // New rows added in the browser use key() and never run during hydration.
  return body.map((block, index) => ({
    id: `row-init-${index}`,
    style: block.listItem === 'bullet' ? 'bullet' : block.listItem === 'number' ? 'number' : block.style,
    text: blockToPlainText(block),
  }));
}

function initialRows(body: ContentBlock[] | undefined): BodyRow[] {
  return body?.length ? toRows(body) : [{ id: 'row-init-0', style: 'normal', text: '' }];
}

function toLocalInput(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}`;
}

function fromLocalInput(value: string) {
  if (!value) return null;
  const date = new Date(`${value}:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseTextToRows(text: string): BodyRow[] {
  const rows: BodyRow[] = [];
  const chunks = text
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.startsWith('## ')) {
      rows.push({ id: key('row'), style: 'h2', text: chunk.slice(3).trim() });
      continue;
    }
    if (chunk.startsWith('### ')) {
      rows.push({ id: key('row'), style: 'h3', text: chunk.slice(4).trim() });
      continue;
    }
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every((line) => /^[-*]\s+/.test(line))) {
      for (const line of lines) {
        rows.push({ id: key('row'), style: 'bullet', text: line.replace(/^[-*]\s+/, '') });
      }
      continue;
    }
    if (lines.length > 1 && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      for (const line of lines) {
        rows.push({ id: key('row'), style: 'number', text: line.replace(/^\d+[.)]\s+/, '') });
      }
      continue;
    }
    rows.push({ id: key('row'), style: 'normal', text: chunk });
  }

  return rows.length ? rows : [{ id: key('row'), style: 'normal', text: '' }];
}

export function ArticleEditor({ article, authors, categories, user }: ArticleEditorProps) {
  const router = useRouter();
  const isContributor = user.role === 'contributor';
  const canPublish = !isContributor;
  const lockedAuthorId = isContributor ? user.authorId : undefined;

  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [nowMs] = useState(() => Date.now());
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [rows, setRows] = useState<BodyRow[]>(() => initialRows(article?.body));
  const [categorySlug, setCategorySlug] = useState<CategorySlug>(
    article?.categorySlug ?? ('technology' as CategorySlug),
  );
  const [authorId, setAuthorId] = useState(
    lockedAuthorId || article?.authorId || authors[0]?.id || '',
  );
  const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? '');
  const [imageAssetId, setImageAssetId] = useState(article?.imageAssetId ?? '');
  const [imageAlt, setImageAlt] = useState(article?.imageAlt ?? '');
  const [imageCredit, setImageCredit] = useState(article?.imageCredit ?? 'MIC TECH Studio');
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? 'draft');
  const [publishedAt, setPublishedAt] = useState(toLocalInput(article?.publishedAt));
  const [videoUrl, setVideoUrl] = useState(article?.videoUrl ?? '');
  const [tagsText, setTagsText] = useState(article?.tags.join(', ') ?? '');
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription ?? '');
  const [socialCaption, setSocialCaption] = useState(article?.socialCaption ?? '');
  const [sourceName, setSourceName] = useState(article?.sourceName ?? '');
  const [sourceUrl, setSourceUrl] = useState(article?.sourceUrl ?? '');
  const [rating, setRating] = useState(article?.rating?.toString() ?? '');
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [trending, setTrending] = useState(article?.trending ?? false);
  const [breaking, setBreaking] = useState(article?.breaking ?? false);
  const [aiAssisted, setAiAssisted] = useState(article?.aiAssisted ?? false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12),
    [tagsText],
  );

  const plainBody = useMemo(
    () =>
      rows
        .map((row) => row.text)
        .filter(Boolean)
        .join('\n\n'),
    [rows],
  );

  const isLive = article
    ? Boolean(article.publishedAt) &&
      new Date(article.publishedAt as string).getTime() <= nowMs &&
      (article.status === 'published' || article.status === 'scheduled')
    : false;

  const checklist = [
    { label: 'Headline is at least 8 characters', done: title.trim().length >= 8 },
    { label: 'Summary is at least 20 characters', done: excerpt.trim().length >= 20 },
    { label: 'Story has content', done: rows.some((row) => row.text.trim().length > 0) },
    { label: 'Lead image is set', done: Boolean(imageUrl) },
    { label: 'Image description is set', done: imageAlt.trim().length >= 5 },
    { label: 'Category and author selected', done: Boolean(categorySlug && authorId) },
  ];

  function fieldError(path: string) {
    return errors.find((error) => error.path === path)?.message;
  }

  function patchRow(id: string, patch: Partial<BodyRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function moveRow(index: number, direction: -1 | 1) {
    setRows((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addRow(style: RowStyle = 'normal') {
    setRows((current) => [...current, { id: key('row'), style, text: '' }]);
  }

  function removeRow(id: string) {
    setRows((current) => {
      const next = current.filter((row) => row.id !== id);
      return next.length ? next : [{ id: key('row'), style: 'normal', text: '' }];
    });
  }

  function applyAi(task: AiTask, result: AiResponse) {
    setAiAssisted(true);
    setSuccess('');
    if (task === 'headlines') {
      setTitle(result.text.slice(0, 180));
      if (!slugTouched) setSlug(slugify(result.text));
      return;
    }
    if (task === 'summary') {
      setExcerpt(result.text.slice(0, 420));
      return;
    }
    if (task === 'seo' && result.fields) {
      if (result.fields.seoTitle) setSeoTitle(result.fields.seoTitle);
      if (result.fields.seoDescription) setSeoDescription(result.fields.seoDescription);
      if (result.fields.slug && !slugTouched) setSlug(slugify(result.fields.slug));
      return;
    }
    if (task === 'social' && result.fields) {
      setSocialCaption((result.fields.linkedin || result.fields.x || '').slice(0, 400));
      return;
    }
    if (task === 'grammar') {
      setRows(parseTextToRows(result.text));
      return;
    }
    if (task === 'draft') {
      const lines = result.text.replace(/\r/g, '').split('\n');
      const bodyLines: string[] = [];
      let inSources = false;
      for (const line of lines) {
        if (/^sources:\s*$/i.test(line.trim())) {
          inSources = true;
          continue;
        }
        if (inSources) continue;
        if (/^hed:\s*/i.test(line)) {
          setTitle(line.replace(/^hed:\s*/i, '').trim().slice(0, 180));
          continue;
        }
        if (/^dek:\s*/i.test(line)) {
          setExcerpt(line.replace(/^dek:\s*/i, '').trim().slice(0, 420));
          continue;
        }
        bodyLines.push(line);
      }
      setRows(parseTextToRows(bodyLines.join('\n')));
    }
  }

  function clientValidate() {
    const next: ApiError[] = [];
    if (title.trim().length < 8) next.push({ path: 'title', message: 'Headline must be at least 8 characters.' });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      next.push({ path: 'slug', message: 'Use lowercase letters, numbers and hyphens only.' });
    }
    if (excerpt.trim().length < 20) {
      next.push({ path: 'excerpt', message: 'Add a summary of at least 20 characters.' });
    }
    if (!rows.some((row) => row.text.trim())) {
      next.push({ path: 'body', message: 'Add at least one content block.' });
    }
    if (!imageUrl.trim()) next.push({ path: 'imageUrl', message: 'Add a lead image.' });
    if (imageAlt.trim().length < 5) {
      next.push({ path: 'imageAlt', message: 'Describe the image for accessibility.' });
    }
    if (!authorId) next.push({ path: 'authorId', message: 'Choose an author.' });
    setErrors(next);
    if (next.length) {
      setFormError('Check the highlighted fields before saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  }

  async function save(nextStatus?: ArticleStatus, options: { publishNow?: boolean } = {}) {
    setFormError('');
    setSuccess('');
    if (!clientValidate()) return;

    const statusToSave = nextStatus ?? status;
    let publishedIso: string | null = null;
    if (statusToSave === 'published') {
      publishedIso = options.publishNow
        ? new Date().toISOString()
        : fromLocalInput(publishedAt) || article?.publishedAt || new Date().toISOString();
    } else if (statusToSave === 'scheduled') {
      publishedIso = fromLocalInput(publishedAt);
      if (!publishedIso || new Date(publishedIso).getTime() <= Date.now()) {
        setErrors([{ path: 'publishedAt', message: 'Choose a future date and time to schedule this story.' }]);
        setFormError('Choose a future date and time to schedule this story. Times are UTC.');
        return;
      }
    } else if (statusToSave === 'archived') {
      publishedIso = fromLocalInput(publishedAt) || article?.publishedAt || null;
    }

    const body = rows
      .filter((row) => row.text.trim())
      .map((row) =>
        row.style === 'bullet' || row.style === 'number'
          ? createBlock('normal', row.text, row.style)
          : createBlock(row.style, row.text),
      );

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      body,
      categorySlug,
      authorId: lockedAuthorId || authorId,
      imageUrl: imageUrl.trim(),
      imageAssetId: imageAssetId || undefined,
      imageAlt: imageAlt.trim(),
      imageCredit: imageCredit.trim() || 'MIC TECH Studio',
      status: statusToSave,
      featured: canPublish ? featured : false,
      trending: canPublish ? trending : false,
      breaking: canPublish ? breaking : false,
      publishedAt: publishedIso,
      videoUrl: videoUrl.trim() || undefined,
      tags,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      socialCaption: socialCaption.trim() || undefined,
      sourceName: sourceName.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      rating: rating.trim() ? Number(rating) : undefined,
      aiAssisted,
    };

    setSaving(true);
    try {
      const response = await fetch(
        article ? `/api/admin/articles/${encodeURIComponent(article.id)}` : '/api/admin/articles',
        {
          method: article ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        errors?: ApiError[];
        article?: Article;
      };
      if (!response.ok || !data.ok || !data.article) {
        setErrors(data.errors ?? []);
        setFormError(data.error || 'The story could not be saved.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setStatus(data.article.status);
      setPublishedAt(toLocalInput(data.article.publishedAt));
      setSuccess(
        data.article.status === 'published'
          ? 'Published. The story is live on the public site.'
          : data.article.status === 'scheduled'
            ? 'Scheduled. It will go live automatically at the chosen time.'
            : data.article.status === 'review'
              ? 'Submitted for editorial review.'
              : 'Saved.',
      );
      if (!article) {
        router.replace(`/admin/articles/${encodeURIComponent(data.article.id)}`);
      }
      router.refresh();
    } catch {
      setFormError('Network error. Your changes were not saved.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setFormError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        url?: string;
        assetId?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        setFormError(data.error || 'The image could not be uploaded.');
        return;
      }
      setImageUrl(data.url);
      setImageAssetId(data.assetId ?? '');
      if (imageAlt.trim().length < 5 && title.trim().length >= 5) setImageAlt(title.trim());
    } catch {
      setFormError('Network error while uploading the image.');
    } finally {
      setUploading(false);
    }
  }

  async function deleteStory() {
    if (!article) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(article.id)}`, {
        method: 'DELETE',
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setFormError(data.error || 'The story could not be deleted.');
        setDeleting(false);
        return;
      }
      router.replace('/admin/articles');
      router.refresh();
    } catch {
      setFormError('Network error while deleting the story.');
      setDeleting(false);
    }
  }

  const availableStatuses = isContributor ? (['draft', 'review'] as ArticleStatus[]) : STATUS_OPTIONS;

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
        className="space-y-5"
      >
        <header className="flex flex-col gap-4 border-b border-line/70 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-2">
            <Link href="/admin/articles" className="inline-flex items-center gap-1 hover:text-paper">
              <ArrowLeft className="size-3.5" />
              Stories
            </Link>
            <span aria-hidden="true">/</span>
            <span>{article ? 'Edit story' : 'New story'}</span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                {aiAssisted ? (
                  <span className="badge border-aqua/30 text-aqua">
                    <Sparkles className="size-2.5" /> AI-assisted
                  </span>
                ) : null}
                {isLive ? (
                  <Link
                    href={`/article/${article?.slug}`}
                    target="_blank"
                    className="badge border-signal/30 text-signal hover:bg-signal/10"
                  >
                    <ExternalLink className="size-2.5" /> View live
                  </Link>
                ) : null}
              </div>
              <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-paper">
                {article ? 'Edit story' : 'Write a new story'}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                {isContributor
                  ? 'Save as a draft or submit for review. An editor approves every story before publication.'
                  : 'Changes go live immediately after saving a published story. No redeploy required.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setAiOpen(true)} className="btn btn-secondary">
                <Sparkles className="size-3.5 text-signal" />
                AI assistant
              </button>
              {isContributor ? (
                <>
                  <button type="button" onClick={() => void save('draft')} disabled={saving} className="btn btn-secondary">
                    <Save className="size-3.5" />
                    Save draft
                  </button>
                  <button type="button" onClick={() => void save('review')} disabled={saving} className="btn btn-primary">
                    {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                    Submit for review
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => void save()} disabled={saving} className="btn btn-secondary">
                    <Save className="size-3.5" />
                    Save changes
                  </button>
                  {status !== 'published' ? (
                    <button
                      type="button"
                      onClick={() => void save('published', { publishNow: true })}
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                      Publish now
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </header>

        {formError ? (
          <div role="alert" className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-[#ffb4aa]">
            {formError}
            {errors.length > 1 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                {errors.slice(1).map((error) => (
                  <li key={`${error.path}-${error.message}`}>{error.message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-2 rounded-xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <section className="panel rounded-xl p-4 sm:p-5">
              <h2 className="font-display text-sm font-semibold text-paper">Headline & summary</h2>
              <p className="mt-1 text-xs text-muted-2">The headline and summary appear on cards, search and social.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="title" className="label">
                    Headline
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (!slugTouched) setSlug(slugify(event.target.value));
                    }}
                    maxLength={180}
                    className="input !text-base"
                    placeholder="A specific, factual headline"
                    aria-invalid={Boolean(fieldError('title'))}
                  />
                  <div className="mt-1 flex justify-between gap-2 text-[0.68rem]">
                    <span className="text-coral">{fieldError('title')}</span>
                    <span className="text-muted-2">{title.length}/180</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="slug" className="label">
                    URL slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-2">/article/</span>
                    <input
                      id="slug"
                      value={slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setSlug(event.target.value);
                      }}
                      maxLength={100}
                      className="input font-mono !text-xs"
                      placeholder="story-url-slug"
                      aria-invalid={Boolean(fieldError('slug'))}
                    />
                  </div>
                  <p className="mt-1 text-[0.68rem] text-coral">{fieldError('slug')}</p>
                </div>

                <div>
                  <label htmlFor="excerpt" className="label">
                    Summary / excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    rows={3}
                    maxLength={420}
                    className="input resize-y"
                    placeholder="Two sentences that explain what happened and why it matters."
                    aria-invalid={Boolean(fieldError('excerpt'))}
                  />
                  <div className="mt-1 flex justify-between gap-2 text-[0.68rem]">
                    <span className="text-coral">{fieldError('excerpt')}</span>
                    <span className="text-muted-2">{excerpt.length}/420</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-sm font-semibold text-paper">Story body</h2>
                  <p className="mt-1 text-xs text-muted-2">
                    Supports basic inline marks: <code className="text-signal">**bold**</code>,{' '}
                    <code className="text-signal">*italic*</code>, <code className="text-signal">[link](url)</code>.
                  </p>
                </div>
                <span className="badge border-line text-[0.6rem] text-muted-2">
                  {rows.filter((row) => row.text.trim()).length} blocks
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {rows.map((row, index) => {
                  const inputId = `body-row-${row.id}`;
                  return (
                    <div key={row.id} className="rounded-lg border border-line/70 bg-ink/35 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <label htmlFor={inputId} className="sr-only">
                          Block {index + 1} type
                        </label>
                        <select
                          value={row.style}
                          onChange={(event) => patchRow(row.id, { style: event.target.value as RowStyle })}
                          className="input !w-auto !py-1 !text-[0.68rem]"
                        >
                          {STYLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <span className="ml-auto text-[0.62rem] text-muted-2">#{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveRow(index, -1)}
                          disabled={index === 0}
                          className="btn btn-ghost size-7 !p-0"
                          aria-label="Move block up"
                        >
                          <ArrowUp className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveRow(index, 1)}
                          disabled={index === rows.length - 1}
                          className="btn btn-ghost size-7 !p-0"
                          aria-label="Move block down"
                        >
                          <ArrowDown className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="btn btn-ghost size-7 !p-0 hover:!text-coral"
                          aria-label="Remove block"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                      <textarea
                        id={inputId}
                        value={row.text}
                        onChange={(event) => patchRow(row.id, { text: event.target.value })}
                        rows={row.style === 'h2' || row.style === 'h3' ? 1 : row.style === 'normal' ? 4 : 2}
                        className={cn(
                          'input mt-2 resize-y',
                          row.style === 'h2' && '!font-display !text-base !font-semibold',
                          row.style === 'h3' && '!font-display !text-sm !font-semibold',
                          row.style === 'blockquote' && '!italic',
                        )}
                        placeholder={
                          row.style === 'h2' || row.style === 'h3'
                            ? 'Section heading'
                            : row.style === 'blockquote'
                              ? 'A quote or pull line'
                              : row.style === 'bullet' || row.style === 'number'
                                ? 'List item'
                                : 'Write a paragraph…'
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <button type="button" onClick={() => addRow('normal')} className="btn btn-secondary !py-1.5 !text-[0.68rem]">
                  <Plus className="size-3" /> Paragraph
                </button>
                <button type="button" onClick={() => addRow('h2')} className="btn btn-secondary !py-1.5 !text-[0.68rem]">
                  <Plus className="size-3" /> Heading
                </button>
                <button type="button" onClick={() => addRow('blockquote')} className="btn btn-secondary !py-1.5 !text-[0.68rem]">
                  <Plus className="size-3" /> Quote
                </button>
                <button type="button" onClick={() => addRow('bullet')} className="btn btn-secondary !py-1.5 !text-[0.68rem]">
                  <Plus className="size-3" /> Bullet
                </button>
                <button type="button" onClick={() => addRow('number')} className="btn btn-secondary !py-1.5 !text-[0.68rem]">
                  <Plus className="size-3" /> Numbered
                </button>
              </div>
              <p className="mt-2 text-[0.68rem] text-coral">{fieldError('body')}</p>
            </section>

            <section className="panel rounded-xl p-4 sm:p-5">
              <h2 className="font-display text-sm font-semibold text-paper">Sources, tags & video</h2>
              <p className="mt-1 text-xs text-muted-2">
                Attribution is part of the record. Add the primary source used for this report.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sourceName" className="label">
                    Source name
                  </label>
                  <input
                    id="sourceName"
                    value={sourceName}
                    onChange={(event) => setSourceName(event.target.value)}
                    className="input"
                    placeholder="Company filing, interview, report…"
                  />
                </div>
                <div>
                  <label htmlFor="sourceUrl" className="label">
                    Source URL
                  </label>
                  <input
                    id="sourceUrl"
                    type="url"
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    className="input"
                    placeholder="https://…"
                    aria-invalid={Boolean(fieldError('sourceUrl'))}
                  />
                  <p className="mt-1 text-[0.68rem] text-coral">{fieldError('sourceUrl')}</p>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="tags" className="label">
                    Tags
                  </label>
                  <input
                    id="tags"
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    className="input"
                    placeholder="AI, chips, policy (comma separated, max 12)"
                  />
                  {tags.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span key={tag} className="badge border-line text-[0.6rem] text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="videoUrl" className="label">
                    Video URL
                  </label>
                  <input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    className="input"
                    placeholder="/videos/report.mp4 or https://…"
                    aria-invalid={Boolean(fieldError('videoUrl'))}
                  />
                  <p className="mt-1 text-[0.68rem] text-coral">{fieldError('videoUrl')}</p>
                </div>
                <div>
                  <label htmlFor="rating" className="label">
                    Review score <span className="normal-case tracking-normal text-muted-2">(optional)</span>
                  </label>
                  <input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    className="input"
                    placeholder="8.5"
                  />
                </div>
              </div>
            </section>

            <section className="panel rounded-xl p-4 sm:p-5">
              <h2 className="font-display text-sm font-semibold text-paper">SEO & social</h2>
              <p className="mt-1 text-xs text-muted-2">
                Leave blank to fall back to the headline, summary and canonical article URL.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="seoTitle" className="label">
                    SEO title
                  </label>
                  <input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    maxLength={70}
                    className="input"
                    placeholder={title || 'Defaults to the headline'}
                  />
                  <p className="mt-1 text-right text-[0.68rem] text-muted-2">{seoTitle.length}/70</p>
                </div>
                <div>
                  <label htmlFor="seoDescription" className="label">
                    Meta description
                  </label>
                  <textarea
                    id="seoDescription"
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    rows={2}
                    maxLength={170}
                    className="input resize-y"
                    placeholder={excerpt || 'Defaults to the summary'}
                  />
                  <p className="mt-1 text-right text-[0.68rem] text-muted-2">{seoDescription.length}/170</p>
                </div>
                <div>
                  <label htmlFor="socialCaption" className="label">
                    Social caption
                  </label>
                  <textarea
                    id="socialCaption"
                    value={socialCaption}
                    onChange={(event) => setSocialCaption(event.target.value)}
                    rows={3}
                    maxLength={400}
                    className="input resize-y"
                    placeholder="Optional caption for social sharing."
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="panel rounded-xl p-4">
              <h2 className="font-display text-sm font-semibold text-paper">Publishing</h2>

              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="status" className="label">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as ArticleStatus)}
                    className="input"
                  >
                    {availableStatuses.map((option) => (
                      <option key={option} value={option}>
                        {option === 'review' ? 'In review' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="publishedAt" className="label">
                    Publish date & time <span className="normal-case tracking-normal text-muted-2">(UTC)</span>
                  </label>
                  <input
                    id="publishedAt"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(event) => setPublishedAt(event.target.value)}
                    className="input"
                    aria-invalid={Boolean(fieldError('publishedAt'))}
                  />
                  <p className="mt-1 text-[0.68rem] text-coral">{fieldError('publishedAt')}</p>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted-2">
                    Required for scheduling. “Publish now” ignores this field.
                  </p>
                </div>

                {canPublish ? (
                  <div className="space-y-1.5 border-t border-line/70 pt-3">
                    <p className="label !mb-1.5">Homepage flags</p>
                    <FlagToggle icon={Star} label="Featured" value={featured} onChange={setFeatured} tone="amber" />
                    <FlagToggle icon={TrendingUp} label="Trending" value={trending} onChange={setTrending} tone="aqua" />
                    <FlagToggle icon={Flame} label="Breaking" value={breaking} onChange={setBreaking} tone="coral" />
                  </div>
                ) : (
                  <p className="rounded-lg border border-line/70 bg-ink/40 px-3 py-2 text-[0.68rem] leading-relaxed text-muted-2">
                    An editor controls homepage flags and publication.
                  </p>
                )}

                <div className="space-y-1.5 border-t border-line/70 pt-3">
                  {isContributor ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void save('draft')}
                        disabled={saving}
                        className="btn btn-secondary w-full !rounded-lg"
                      >
                        <Save className="size-3.5" /> Save draft
                      </button>
                      <button
                        type="button"
                        onClick={() => void save('review')}
                        disabled={saving}
                        className="btn btn-primary w-full !rounded-lg"
                      >
                        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                        Submit for review
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void save()}
                        disabled={saving}
                        className="btn btn-primary w-full !rounded-lg"
                      >
                        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        {status === 'scheduled' ? 'Save & schedule' : 'Save changes'}
                      </button>
                      {status !== 'published' ? (
                        <button
                          type="button"
                          onClick={() => void save('published', { publishNow: true })}
                          disabled={saving}
                          className="btn btn-secondary w-full !rounded-lg"
                        >
                          <Send className="size-3.5" /> Publish now
                        </button>
                      ) : null}
                    </>
                  )}
                </div>

                {article ? (
                  <div className="border-t border-line/70 pt-3">
                    {confirmDelete ? (
                      <div className="space-y-1.5">
                        <p className="text-[0.68rem] leading-relaxed text-coral">
                          Delete this story permanently? This cannot be undone.
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => void deleteStory()}
                            disabled={deleting}
                            className="btn btn-danger flex-1 !py-1.5 !text-[0.68rem]"
                          >
                            {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="btn btn-secondary flex-1 !py-1.5 !text-[0.68rem]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="btn btn-ghost w-full !justify-start !px-0 !text-[0.7rem] hover:!text-coral"
                      >
                        <Trash2 className="size-3" /> Delete story
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="panel rounded-xl p-4">
              <h2 className="font-display text-sm font-semibold text-paper">Lead image</h2>
              <div className="mt-3">
                {imageUrl ? (
                  <div className="relative overflow-hidden rounded-lg border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={imageAlt || 'Lead image preview'} className="aspect-video w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageAssetId('');
                      }}
                      className="absolute right-2 top-2 grid size-7 place-items-center rounded-full border border-white/20 bg-black/70 text-white hover:bg-black"
                      aria-label="Remove lead image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-line bg-ink/40 text-center">
                    <div className="px-3">
                      <ImagePlus className="mx-auto size-5 text-muted-2" />
                      <p className="mt-1 text-[0.68rem] text-muted-2">No image selected</p>
                    </div>
                  </div>
                )}

                <label
                  className={cn(
                    'btn btn-secondary mt-3 w-full !rounded-lg cursor-pointer',
                    uploading && 'pointer-events-none opacity-60',
                  )}
                >
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading ? 'Optimising…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadImage(file);
                      event.target.value = '';
                    }}
                  />
                </label>

                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="imageUrl" className="label">
                      Image URL
                    </label>
                    <input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      className="input !text-xs"
                      placeholder="/images/editorial/… or https://…"
                      aria-invalid={Boolean(fieldError('imageUrl'))}
                    />
                    <p className="mt-1 text-[0.68rem] text-coral">{fieldError('imageUrl')}</p>
                  </div>
                  <div>
                    <label htmlFor="imageAlt" className="label">
                      Alt text
                    </label>
                    <textarea
                      id="imageAlt"
                      value={imageAlt}
                      onChange={(event) => setImageAlt(event.target.value)}
                      rows={2}
                      maxLength={240}
                      className="input resize-y !text-xs"
                      placeholder="Describe what the image shows."
                      aria-invalid={Boolean(fieldError('imageAlt'))}
                    />
                    <p className="mt-1 text-[0.68rem] text-coral">{fieldError('imageAlt')}</p>
                  </div>
                  <div>
                    <label htmlFor="imageCredit" className="label">
                      Credit
                    </label>
                    <input
                      id="imageCredit"
                      value={imageCredit}
                      onChange={(event) => setImageCredit(event.target.value)}
                      className="input !text-xs"
                      placeholder="MIC TECH Studio"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="panel rounded-xl p-4">
              <h2 className="font-display text-sm font-semibold text-paper">Story details</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="category" className="label">
                    Category
                  </label>
                  <select
                    id="category"
                    value={categorySlug}
                    onChange={(event) => setCategorySlug(event.target.value as CategorySlug)}
                    className="input"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="author" className="label">
                    Author
                  </label>
                  <select
                    id="author"
                    value={lockedAuthorId || authorId}
                    onChange={(event) => setAuthorId(event.target.value)}
                    disabled={Boolean(lockedAuthorId)}
                    className="input disabled:opacity-70"
                  >
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  {lockedAuthorId ? (
                    <p className="mt-1 text-[0.68rem] text-muted-2">Contributors are credited as themselves.</p>
                  ) : null}
                  <p className="mt-1 text-[0.68rem] text-coral">{fieldError('authorId')}</p>
                </div>
              </div>
            </section>

            <section className="panel rounded-xl p-4">
              <h2 className="font-display text-sm font-semibold text-paper">Pre-publish checklist</h2>
              <ul className="mt-3 space-y-1.5">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-start gap-2 text-[0.7rem] leading-relaxed">
                    {item.done ? (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-signal" />
                    ) : (
                      <Circle className="mt-0.5 size-3.5 shrink-0 text-muted-2" />
                    )}
                    <span className={item.done ? 'text-muted' : 'text-muted-2'}>{item.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-line/70 pt-2">
                <button
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className="btn btn-ghost w-full !justify-start !px-0 !text-[0.7rem]"
                >
                  <Sparkles className="size-3 text-signal" />
                  Check with the AI assistant
                </button>
              </div>
            </section>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
          <p className="text-[0.68rem] text-muted-2">
            {article ? `Story ID: ${article.id}` : 'New story'} · All times UTC
          </p>
          <div className="flex gap-2">
            <Link href="/admin/articles" className="btn btn-secondary">
              Cancel
            </Link>
            {isContributor ? (
              <button type="button" onClick={() => void save('review')} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                Submit for review
              </button>
            ) : (
              <button type="button" onClick={() => void save()} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save changes
              </button>
            )}
          </div>
        </div>
      </form>

      <AiAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title={title}
        draftText={[title, excerpt, plainBody].filter(Boolean).join('\n\n')}
        onApply={applyAi}
      />
    </>
  );
}

function FlagToggle({
  icon: Icon,
  label,
  value,
  onChange,
  tone,
}: {
  icon: typeof Star;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  tone: 'amber' | 'aqua' | 'coral';
}) {
  const toneClass = {
    amber: value ? 'border-amber/30 bg-amber/10 text-amber' : '',
    aqua: value ? 'border-aqua/30 bg-aqua/10 text-aqua' : '',
    coral: value ? 'border-coral/30 bg-coral/10 text-coral' : '',
  }[tone];
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors',
        value ? toneClass : 'border-line/70 text-muted hover:bg-white/[0.03] hover:text-paper',
      )}
    >
      <Icon className="size-3.5" />
      <span className="flex-1 text-left">{label}</span>
      <span className={cn('grid size-4 place-items-center rounded border', value ? 'border-current' : 'border-line')}>
        {value ? <Check className="size-2.5" /> : null}
      </span>
    </button>
  );
}
