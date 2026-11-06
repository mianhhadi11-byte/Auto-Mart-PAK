import { ChartNoAxesColumn, Mail, Newspaper, Play } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';

export const metadata = {
  title: 'Advertise',
  description: 'Reach MIC TECH’s technology, business and product audience without compromising editorial independence.',
  alternates: { canonical: '/advertise' },
};

export default function AdvertisePage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with MIC TECH"
        title="Reach the people building the next decade."
        description="Our readers are engineers, founders, product leaders, policy teams and informed buyers. Advertising is labelled, separated from editorial, and never sold as a verdict."
      />
      <div className="container-page py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Newspaper,
              title: 'Display & newsletter',
              body: 'Premium display placements across the site and the weekday briefing. Fixed placements, clear labelling, no pop-ups or interstitials.',
            },
            {
              icon: Play,
              title: 'Video & audio',
              body: 'Short-form sponsor idents around video reports and explainers, produced to the same visual standard as the newsroom.',
            },
            {
              icon: ChartNoAxesColumn,
              title: 'Research partnerships',
              body: 'Commissioned research and data stories, clearly marked as sponsored and kept out of editorial feeds and rankings.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.title} className="rounded-xl border border-line bg-panel p-6">
                <Icon className="size-5 text-signal" aria-hidden="true" />
                <h2 className="mt-4 font-display text-lg font-semibold text-paper">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </section>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 rounded-2xl border border-line bg-panel p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-signal/85">The short version</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-paper">
              No sponsored scores. No surprise copy approval.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              We will share audience data, formats and rates. We will not sell editorial coverage, hide a commercial
              relationship, or let a sponsor approve a review. If that works for you, we should talk.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-2">Advertising desk</p>
            <a
              href="mailto:partners@mictech.news?subject=Media%20kit"
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-signal hover:underline"
            >
              <Mail className="size-4" aria-hidden="true" /> partners@mictech.news
            </a>
            <p className="mt-3 text-xs leading-relaxed text-muted-2">
              Include your campaign window, budget range and the audience you need to reach.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
