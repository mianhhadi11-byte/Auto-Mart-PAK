'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  Gauge,
  Hash,
  Lightbulb,
  ListChecks,
  Loader2,
  Megaphone,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiResponse, AiTask } from '@/lib/ai';

const TASKS: Array<{
  value: AiTask;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}> = [
  { value: 'draft', label: 'Draft story', hint: 'From verified notes', icon: FileText },
  { value: 'headlines', label: 'Headlines', hint: 'Five options', icon: Lightbulb },
  { value: 'summary', label: 'Summary', hint: 'Two or three sentences', icon: ListChecks },
  { value: 'grammar', label: 'Grammar', hint: 'Correct without adding facts', icon: Wand2 },
  { value: 'seo', label: 'SEO', hint: 'Title, meta and slug', icon: Hash },
  { value: 'social', label: 'Social', hint: 'X and LinkedIn', icon: Megaphone },
  { value: 'readability', label: 'Readability', hint: 'Specific edit notes', icon: Gauge },
];

interface AiAssistantProps {
  open: boolean;
  onClose: () => void;
  title: string;
  draftText: string;
  onApply: (task: AiTask, result: AiResponse) => void;
}

export function AiAssistant({ open, onClose, title, draftText, onApply }: AiAssistantProps) {
  const [task, setTask] = useState<AiTask>('summary');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<AiResponse | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function run() {
    setError('');
    setResult(null);
    setCopied(false);
    const material = notes.trim() || draftText.trim();
    if (!material) {
      setError('Add verified source notes or write a draft first. The assistant must not invent facts.');
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, title: title.trim(), text: material }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        result?: AiResponse;
      };
      if (!response.ok || !payload.ok || !payload.result) {
        setError(payload.error || 'The assistant could not complete that request.');
        return;
      }
      setResult(payload.result);
    } catch {
      setError('Network error. The assistant is unavailable right now.');
    } finally {
      setPending(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy to the clipboard.');
    }
  }

  const activeTask = TASKS.find((item) => item.value === task);
  const canApply = result && task !== 'readability';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close assistant"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-panel shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line/70 bg-[linear-gradient(180deg,rgba(201,247,74,0.07),transparent)] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-signal/30 bg-signal/10 text-signal">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 id="ai-assistant-title" className="font-display text-base font-semibold text-paper">
                Editorial assistant
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-2">
                Works only from the material you supply. Nothing is published automatically.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost size-8 !p-0" aria-label="Close assistant">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div>
            <p className="label">Task</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {TASKS.map((item) => {
                const Icon = item.icon;
                const active = task === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setTask(item.value);
                      setResult(null);
                      setError('');
                    }}
                    className={cn(
                      'rounded-lg border px-2.5 py-2 text-left transition-colors',
                      active
                        ? 'border-signal/40 bg-signal/10 text-paper'
                        : 'border-line bg-ink/40 text-muted hover:border-line hover:bg-white/[0.03]',
                    )}
                    aria-pressed={active}
                  >
                    <Icon className={cn('size-3.5', active ? 'text-signal' : 'text-muted-2')} />
                    <span className="mt-1 block text-[0.7rem] font-medium leading-tight">{item.label}</span>
                    <span className="mt-0.5 block text-[0.6rem] leading-tight text-muted-2">{item.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="ai-notes" className="label">
              Verified source notes <span className="normal-case tracking-normal text-muted-2">(optional)</span>
            </label>
            <textarea
              id="ai-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Paste reporting notes, quotes, figures or a link summary here. If empty, the current draft is used."
              className="input resize-y !text-xs leading-relaxed"
            />
            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-2">
              The assistant will use [VERIFY] where a fact is missing. Never add anything it cannot source.
            </p>
          </div>

          {error ? (
            <p role="alert" className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-xs text-[#ffb4aa]">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="mt-4 rounded-xl border border-line bg-ink/50">
              <div className="flex flex-wrap items-center gap-2 border-b border-line/70 px-3 py-2">
                <span className="badge border-signal/25 text-[0.6rem] text-signal">
                  {result.mode === 'live' ? 'Live model' : 'Demo extract'}
                </span>
                <span className="text-[0.65rem] text-muted-2">
                  {result.provider} · {result.model}
                </span>
                <button type="button" onClick={copy} className="btn btn-ghost ml-auto !px-2 !py-1 !text-[0.65rem]">
                  {copied ? <Check className="size-3 text-signal" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {result.warning ? (
                <p className="border-b border-amber/20 bg-amber/5 px-3 py-2 text-[0.68rem] text-amber">
                  {result.warning}
                </p>
              ) : null}

              {task === 'headlines' && result.items?.length ? (
                <ul className="divide-y divide-line/60">
                  {result.items.map((headline) => (
                    <li key={headline} className="flex items-center gap-2 px-3 py-2">
                      <span className="min-w-0 flex-1 text-xs leading-relaxed text-paper">{headline}</span>
                      <button
                        type="button"
                        onClick={() => onApply(task, { ...result, text: headline, items: [headline] })}
                        className="btn btn-secondary !px-2 !py-1 !text-[0.62rem]"
                      >
                        Use
                      </button>
                    </li>
                  ))}
                </ul>
              ) : task === 'seo' && result.fields ? (
                <dl className="space-y-2 px-3 py-3 text-xs">
                  {Object.entries(result.fields).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[0.62rem] uppercase tracking-wider text-muted-2">{key}</dt>
                      <dd className="mt-0.5 break-words text-paper">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : task === 'social' && result.fields ? (
                <div className="space-y-3 px-3 py-3">
                  {Object.entries(result.fields).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[0.62rem] uppercase tracking-wider text-muted-2">{key}</p>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-paper">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap px-3 py-3 font-sans text-xs leading-relaxed text-paper">
                  {result.text}
                </pre>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 px-3 py-2">
                <p className="max-w-md text-[0.62rem] leading-relaxed text-muted-2">{result.disclaimer}</p>
                {canApply ? (
                  <button
                    type="button"
                    onClick={() => {
                      onApply(task, result);
                      onClose();
                    }}
                    className="btn btn-primary !py-1.5 !text-[0.68rem]"
                  >
                    <Check className="size-3" />
                    Apply to editor
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line/70 bg-ink/40 px-5 py-3">
          <p className="text-[0.65rem] leading-relaxed text-muted-2">
            {activeTask?.label} · human review required
          </p>
          <button type="button" onClick={run} disabled={pending} className="btn btn-primary">
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            {pending ? 'Working…' : 'Generate'}
          </button>
        </footer>
      </section>
    </div>
  );
}
