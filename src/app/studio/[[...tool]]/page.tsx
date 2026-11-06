import type { Metadata } from 'next';
import { metadata as studioMetadata } from 'next-sanity/studio';
import { Database, ExternalLink } from 'lucide-react';
import { isSanityConfigured } from '@/lib/cms/sanity';
import { Studio } from './Studio';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...studioMetadata,
  title: 'MIC TECH Studio',
};

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ink px-5 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-line bg-panel p-8">
          <span className="grid size-12 place-items-center rounded-xl border border-signal/25 bg-signal/10">
            <Database className="size-6 text-signal" aria-hidden="true" />
          </span>
          <p className="eyebrow mt-5 text-signal/85">Sanity Studio</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-paper">
            Connect a Sanity project to open Studio.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The public site and the custom admin dashboard are running on the built-in local editorial store. To use
            hosted Sanity, add your project credentials to <code className="text-signal">.env.local</code> and restart
            the dev server.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-lg border border-line bg-black/40 p-4 text-xs leading-relaxed text-muted">
{`NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_WRITE_TOKEN=your_editor_token`}
          </pre>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="https://sanity.io/manage"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Create a project <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            <a href="/admin" className="btn btn-secondary">
              Open the custom admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Studio />;
}
