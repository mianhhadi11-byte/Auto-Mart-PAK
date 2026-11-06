'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { cn, slugify } from '@/lib/utils';
import type { Author } from '@/lib/types';

interface AuthorForm {
  id: string | null;
  name: string;
  slug: string;
  role: string;
  bio: string;
  email: string;
  twitter: string;
  linkedin: string;
}

function blankForm(): AuthorForm {
  return { id: null, name: '', slug: '', role: '', bio: '', email: '', twitter: '', linkedin: '' };
}

function formFromAuthor(author: Author): AuthorForm {
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    role: author.role,
    bio: author.bio,
    email: author.email ?? '',
    twitter: author.twitter ?? '',
    linkedin: author.linkedin ?? '',
  };
}

export function AuthorsManager({ authors }: { authors: Author[] }) {
  const router = useRouter();
  const [form, setForm] = useState<AuthorForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function update<K extends keyof AuthorForm>(key: K, value: AuthorForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const response = await fetch(
        form.id ? `/api/admin/authors/${encodeURIComponent(form.id)}` : '/api/admin/authors',
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug || slugify(form.name),
            role: form.role,
            bio: form.bio,
            email: form.email,
            twitter: form.twitter,
            linkedin: form.linkedin,
          }),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        errors?: Array<{ path: string; message: string }>;
      };
      if (!response.ok || !data.ok) {
        setError(data.error || 'The author could not be saved.');
        const map: Record<string, string> = {};
        for (const item of data.errors ?? []) map[item.path] = item.message;
        setFieldErrors(map);
        return;
      }
      setForm(null);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/authors/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || 'The author could not be deleted.');
        setDeleting(null);
        return;
      }
      setConfirmDelete(null);
      setDeleting(null);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-[#ffb4aa]">
          {error}
        </p>
      ) : null}

      {form ? (
        <section className="panel rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-paper">
                {form.id ? `Edit ${form.name || 'author'}` : 'New author'}
              </h2>
              <p className="mt-1 text-xs text-muted-2">
                Author profiles appear on article pages and the public author directory.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setFieldErrors({});
                setError('');
              }}
              className="btn btn-ghost size-8 !p-0"
              aria-label="Close author form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
            <div>
              <label htmlFor="author-name" className="label">
                Name
              </label>
              <input
                id="author-name"
                value={form.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          name: value,
                          slug: current.id ? current.slug : slugify(value),
                        }
                      : current,
                  );
                }}
                className="input"
                required
              />
              {fieldErrors.name ? <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="author-slug" className="label">
                Slug
              </label>
              <input
                id="author-slug"
                value={form.slug}
                onChange={(event) => update('slug', event.target.value)}
                className="input font-mono !text-xs"
                required
              />
              {fieldErrors.slug ? <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.slug}</p> : null}
            </div>
            <div>
              <label htmlFor="author-role" className="label">
                Title / beat
              </label>
              <input
                id="author-role"
                value={form.role}
                onChange={(event) => update('role', event.target.value)}
                className="input"
                placeholder="Senior reporter"
                required
              />
              {fieldErrors.role ? <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.role}</p> : null}
            </div>
            <div>
              <label htmlFor="author-email" className="label">
                Email <span className="normal-case tracking-normal text-muted-2">(optional)</span>
              </label>
              <input
                id="author-email"
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                className="input"
              />
              {fieldErrors.email ? <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.email}</p> : null}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="author-bio" className="label">
                Bio
              </label>
              <textarea
                id="author-bio"
                value={form.bio}
                onChange={(event) => update('bio', event.target.value)}
                rows={3}
                className="input resize-y"
                required
              />
              {fieldErrors.bio ? <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.bio}</p> : null}
            </div>
            <div>
              <label htmlFor="author-twitter" className="label">
                X / Twitter URL
              </label>
              <input
                id="author-twitter"
                type="url"
                value={form.twitter}
                onChange={(event) => update('twitter', event.target.value)}
                className="input"
                placeholder="https://x.com/…"
              />
              {fieldErrors.twitter ? <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.twitter}</p> : null}
            </div>
            <div>
              <label htmlFor="author-linkedin" className="label">
                LinkedIn URL
              </label>
              <input
                id="author-linkedin"
                type="url"
                value={form.linkedin}
                onChange={(event) => update('linkedin', event.target.value)}
                className="input"
                placeholder="https://linkedin.com/in/…"
              />
              {fieldErrors.linkedin ? (
                <p className="mt-1 text-[0.68rem] text-coral">{fieldErrors.linkedin}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                {form.id ? 'Save author' : 'Create author'}
              </button>
              <button type="button" onClick={() => setForm(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button type="button" onClick={() => setForm(blankForm())} className="btn btn-primary">
          <Plus className="size-4" />
          New author
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {authors.map((author) => (
          <article key={author.id} className="panel flex flex-col rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-full border border-line bg-gradient-to-br font-display text-sm font-semibold',
                  author.avatarColor,
                )}
                aria-hidden="true"
              >
                {author.initials || author.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-sm font-semibold text-paper">{author.name}</h2>
                <p className="truncate text-[0.68rem] text-muted-2">{author.role}</p>
              </div>
              <span className="badge border-line text-[0.58rem] text-muted-2">
                {author.id.startsWith('author-') ? author.id.replace('author-', '') : author.id}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-muted">{author.bio}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] text-muted-2">
              {author.email ? (
                <a href={`mailto:${author.email}`} className="inline-flex items-center gap-1 hover:text-signal">
                  <Mail className="size-3" /> Email
                </a>
              ) : null}
              {author.twitter ? (
                <a href={author.twitter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-signal">
                  <ExternalLink className="size-3" /> X
                </a>
              ) : null}
              {author.linkedin ? (
                <a href={author.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-signal">
                  <ExternalLink className="size-3" /> LinkedIn
                </a>
              ) : null}
              <a href={`/author/${author.slug}`} target="_blank" className="inline-flex items-center gap-1 hover:text-signal">
                <UserRound className="size-3" /> Profile
              </a>
            </div>

            <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-3">
              <button
                type="button"
                onClick={() => {
                  setForm(formFromAuthor(author));
                  setFieldErrors({});
                  setError('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-secondary flex-1 !py-1.5 !text-[0.68rem]"
              >
                <Pencil className="size-3" /> Edit
              </button>
              {confirmDelete === author.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => void remove(author.id)}
                    disabled={deleting === author.id}
                    className="btn btn-danger flex-1 !py-1.5 !text-[0.68rem]"
                  >
                    {deleting === author.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="btn btn-ghost !px-2 !py-1.5 !text-[0.68rem]"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(author.id)}
                  className="btn btn-ghost size-8 !p-0 hover:!text-coral"
                  aria-label={`Delete ${author.name}`}
                  title="Delete author"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {authors.length === 0 ? (
        <div className="panel rounded-xl px-5 py-12 text-center">
          <UserRound className="mx-auto size-6 text-muted-2" />
          <p className="mt-2 font-display text-sm font-medium text-paper">No author profiles yet</p>
          <p className="mt-1 text-xs text-muted-2">Create an author before assigning stories.</p>
        </div>
      ) : null}
    </div>
  );
}
