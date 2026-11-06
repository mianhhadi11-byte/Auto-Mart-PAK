import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { requireUser } from '@/lib/auth/dal';

export const metadata = { title: 'Editorial policy' };

const RULES = [
  {
    title: 'Human approval is mandatory',
    body: 'Every story is reviewed by an editor before publication. AI output is a drafting aid, never an author and never an auto-publisher. Contributors can save drafts and submit for review but cannot publish or schedule.',
  },
  {
    title: 'No invented facts',
    body: 'The editorial assistant may only use material supplied in the source notes. Missing facts must be marked [VERIFY]. Names, numbers, dates, quotes and outcomes must be checked against a primary source before a story is submitted.',
  },
  {
    title: 'Attribution and sourcing',
    body: 'Add the primary source name and URL to the story record. Link to original documents where possible. Separate reporting from analysis, and label opinion clearly.',
  },
  {
    title: 'Corrections and updates',
    body: 'Correct errors promptly and transparently. Do not silently rewrite the meaning of a published story. Material changes require an editor and a note in the audit log.',
  },
  {
    title: 'Images and rights',
    body: 'Use original MIC TECH artwork, licensed images or images you have explicit permission to publish. Record credit and alt text for every lead image. Never upload copyrighted images without a licence.',
  },
  {
    title: 'Independence',
    body: 'Sponsored content must be labelled and kept out of editorial feeds. Commercial relationships must never determine a review score or a headline.',
  },
];

export default async function AdminPolicyPage() {
  const user = await requireUser('/admin/policy');

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Standards"
        title="Editorial policy"
        description={`The rules that apply to every byline at MIC TECH. Signed in as ${user.name}.`}
        actions={
          <Link href="/ethics" target="_blank" className="btn btn-secondary">
            Public standards
          </Link>
        }
      />

      <div className="rounded-xl border border-signal/25 bg-signal/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-signal">
          <Sparkles className="size-4" />
          AI-assisted work
        </p>
        <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-muted">
          The assistant runs server-side and uses only the text and source notes you provide. It returns a
          warning and a disclaimer with every response. Applying a suggestion marks the story as AI-assisted.
          A human editor still has to verify every fact and approve publication.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {RULES.map((rule) => (
          <section key={rule.title} className="panel rounded-xl p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-paper">
              <CheckCircle2 className="size-4 shrink-0 text-signal" />
              {rule.title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">{rule.body}</p>
          </section>
        ))}
      </div>

      <div className="panel flex items-start gap-3 rounded-xl p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-signal" />
        <div>
          <h2 className="font-display text-sm font-semibold text-paper">Accountability</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Publishing, flag changes, author edits and sign-ins are recorded in the newsroom audit log. Roles
            are enforced on the server for every API request, not only in the interface. Sessions use an
            HttpOnly, same-site cookie and expire after eight hours.
          </p>
        </div>
      </div>
    </div>
  );
}
