'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl border border-coral/30 bg-coral/10">
          <AlertTriangle className="size-6 text-coral" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-5 text-coral/90">Something interrupted the signal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-paper">
          This page could not load.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The newsroom data layer may be temporarily unavailable. Try again, or return to the front page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary">
            <RotateCcw className="size-4" aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Front page
          </Link>
        </div>
      </div>
    </div>
  );
}
