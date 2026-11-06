import Link from 'next/link';
import { ArrowLeft, Search, Signal } from 'lucide-react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="grid flex-1 place-items-center px-5 py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-signal/25 bg-signal/10">
            <Signal className="size-7 text-signal" aria-hidden="true" />
          </span>
          <p className="eyebrow mt-6 text-signal/85">404 · Signal lost</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-paper sm:text-5xl">
            That page is not in the archive.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The link may have moved, the story may be unpublished, or the URL may be wrong. Try the latest feed or search
            the newsroom.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/latest" className="btn btn-primary">
              <ArrowLeft className="size-4" aria-hidden="true" /> Latest news
            </Link>
            <Link href="/search" className="btn btn-secondary">
              <Search className="size-4" aria-hidden="true" /> Search MIC TECH
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
