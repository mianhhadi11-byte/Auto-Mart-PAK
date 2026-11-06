import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';

export const metadata = {
  title: 'Editorial standards',
  description: 'MIC TECH editorial standards, corrections policy and rules for AI-assisted reporting.',
  alternates: { canonical: '/ethics' },
};

const principles = [
  {
    title: 'Accuracy before speed',
    body: 'We publish when a claim is verified, not when a competitor posts. If we cannot verify a detail, we say so or leave it out. Anonymous sourcing requires an editor’s approval and a clear public explanation of why anonymity was granted.',
  },
  {
    title: 'Independence',
    body: 'Advertisers do not see stories before publication and cannot approve copy. Sponsored material is labelled and kept out of editorial feeds. We do not accept payment for reviews, rankings or awards.',
  },
  {
    title: 'Corrections and clarifications',
    body: 'Factual errors are corrected promptly. The correction is dated and describes what changed. Substantive clarifications are appended to the story rather than quietly edited away.',
  },
  {
    title: 'Sources and links',
    body: 'Where a primary document, filing, study or dataset exists, we link to it. We distinguish between a company’s claim, an independent test and our own analysis.',
  },
  {
    title: 'AI-assisted work',
    body: 'AI tools may help summarise verified notes, suggest headlines or check readability. They may not invent facts, quotes or sources, and they cannot publish. Every AI-assisted story is checked and approved by a human editor.',
  },
  {
    title: 'Reviews and testing',
    body: 'Review units are tested by the newsroom. We disclose loan units and return them where required. A verdict reflects performance at the tested price, not the best possible configuration.',
  },
];

export default function EthicsPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="Editorial standards"
        description="The rules we hold ourselves to, including how we use AI, handle corrections and keep advertising away from editorial judgement."
      />
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {principles.map((principle, index) => (
              <section key={principle.title} className="rounded-xl border border-line bg-panel p-5 sm:p-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-sm font-semibold tabular-nums text-signal">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-lg font-semibold text-paper">{principle.title}</h2>
                </div>
                <p className="mt-2 pl-8 text-sm leading-relaxed text-muted">{principle.body}</p>
              </section>
            ))}
          </div>
          <aside className="space-y-5">
            <div className="rounded-xl border border-line bg-panel p-6">
              <p className="eyebrow text-signal/85">Report a correction</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Email the newsroom with the story URL, the disputed passage and any supporting material. We aim to
                acknowledge correction requests within one working day.
              </p>
              <a href="mailto:newsroom@mictech.news?subject=Correction%20request" className="mt-3 inline-block text-sm text-signal hover:underline">
                newsroom@mictech.news
              </a>
            </div>
            <div className="rounded-xl border border-line bg-panel p-6">
              <p className="eyebrow text-signal/85">Ownership</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                MIC TECH Media is independently owned. Funding comes from advertising and reader support. Editorial
                decisions are made by the editor-in-chief, not by commercial partners.
              </p>
            </div>
            <Link href="/about" className="btn btn-secondary w-full">
              More about MIC TECH
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
