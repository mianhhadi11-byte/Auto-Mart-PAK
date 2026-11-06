'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { SocialIcon } from './SocialIcon';

export function ShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={className}>
      <p className="eyebrow mb-2.5">Share this story</p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-signal/50 hover:text-signal"
          aria-label="Share on X"
        >
          <SocialIcon name="x" className="size-3.5" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-signal/50 hover:text-signal"
          aria-label="Share on LinkedIn"
        >
          <SocialIcon name="linkedin" className="size-3.5" />
        </a>
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-signal/50 hover:text-signal"
          aria-label="Share on WhatsApp"
        >
          <SocialIcon name="whatsapp" className="size-3.5" />
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3 text-[0.7rem] font-medium text-muted transition-colors hover:border-signal/50 hover:text-signal"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
