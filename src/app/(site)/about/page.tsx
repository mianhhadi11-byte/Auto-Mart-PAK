import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { AuthorAvatar } from '@/components/site/AuthorAvatar';
import { listAuthors } from '@/lib/cms/repository';
import { SITE } from '@/lib/constants';

export const metadata = {
  title: 'About',
  description: 'Who we are, how MIC TECH reports, and what we will not do.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const authors = await listAuthors();

  return (
    <>
      <PageHero
        eyebrow="About MIC TECH"
        title="Technology reporting with the noise removed."
        description="MIC TECH is an independent newsroom covering the systems, companies and decisions shaping the next decade of computing. We explain what changed, why it matters and what to verify next."
      />

      <div className="container-page py-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8 text-pretty leading-relaxed text-muted">
            <section>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-paper">Why we exist</h2>
              <p className="mt-3">
                Technology coverage has become a race for the fastest reaction. That is useful for the feed and bad for
                understanding. MIC TECH is built around a slower question: what actually changed, and who does it affect?
              </p>
              <p className="mt-3">
                We report on chips and data centres, models and agents, devices and networks, capital and policy, mobility
                and education. We test products instead of repeating spec sheets. We name uncertainty instead of hiding it.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-paper">How we work</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ['Independent', 'No sponsored verdicts, no pay-for-coverage, no hidden advertiser copy.'],
                  ['Tested', 'Reviews come from hands-on use on the MIC TECH test bench.'],
                  ['Sourced', 'Claims link to primary documents wherever a primary document exists.'],
                  ['Corrected', 'Mistakes are corrected in public, with a dated note on the story.'],
                  ['Human', 'AI can assist a draft. A human editor verifies and publishes every story.'],
                  ['Transparent', 'We label analysis, opinion and AI-assisted work clearly.'],
                ].map(([title, body]) => (
                  <li key={title} className="rounded-xl border border-line bg-panel p-4">
                    <span className="text-sm font-semibold text-paper">{title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">{body}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-paper">The newsroom</h2>
              <p className="mt-3">
                Our desks cover Technology, AI, Business, Startups, Mobile, Gadgets, Telecom, Social Media, Automobile,
                Education, Guides, Reviews and Opinion. Freelance pitches are welcome.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {authors.slice(0, 6).map((author) => (
                  <Link
                    key={author.id}
                    href={`/author/${author.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-line bg-panel p-4 transition-colors hover:border-white/25"
                  >
                    <AuthorAvatar author={author} size="md" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-paper group-hover:text-signal">{author.name}</span>
                      <span className="mt-0.5 block text-[0.68rem] text-muted-2">{author.role}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-line bg-panel p-6">
              <p className="eyebrow text-signal/85">The practical details</p>
              <div className="mt-4 space-y-4 text-sm text-muted">
                <p className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                  <span>
                    <span className="block text-xs uppercase tracking-[0.12em] text-muted-2">General</span>
                    <a href={`mailto:${SITE.contactEmail}`} className="text-paper hover:text-signal">
                      {SITE.contactEmail}
                    </a>
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                  <span>
                    <span className="block text-xs uppercase tracking-[0.12em] text-muted-2">Newsroom</span>
                    <a href={`mailto:${SITE.contactEmail}`} className="text-paper hover:text-signal">
                      newsroom@mictech.news
                    </a>
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                  <span>{SITE.name} Media, 14 Signal House, Innovation District</span>
                </p>
              </div>
              <Link href="/contact" className="btn btn-secondary mt-5 w-full">
                Contact the newsroom <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-xl border border-line bg-panel p-6">
              <p className="eyebrow text-signal/85">Pitch us</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                We commission reported features, sharp explainers and tested guides. Send a short pitch, your reporting
                plan and what you can verify.
              </p>
              <a href="mailto:newsroom@mictech.news?subject=Pitch" className="mt-3 inline-block text-sm text-signal hover:underline">
                newsroom@mictech.news
              </a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
