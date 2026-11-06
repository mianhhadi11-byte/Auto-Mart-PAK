import { Mail, Megaphone, Newspaper, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';

export const metadata = {
  title: 'Contact',
  description: 'Contact the MIC TECH newsroom, advertising team and corrections desk.',
  alternates: { canonical: '/contact' },
};

const desks = [
  {
    icon: Newspaper,
    eyebrow: 'Newsroom',
    title: 'Tips, context and corrections',
    body: 'Send documents, on-the-record comments, correction requests and story tips. Please include enough detail for us to verify the claim.',
    email: 'newsroom@mictech.news',
    subject: 'Newsroom',
  },
  {
    icon: Megaphone,
    eyebrow: 'Advertising',
    title: 'Partnerships and media kits',
    body: 'Request the current media kit, audience data and sponsorship options. Advertising has no influence on editorial coverage.',
    email: 'partners@mictech.news',
    subject: 'Advertising',
  },
  {
    icon: ShieldCheck,
    eyebrow: 'Security',
    title: 'Sensitive disclosures',
    body: 'For sensitive material, email first without attachments and ask for a secure channel. We will respond with options.',
    email: 'secure@mictech.news',
    subject: 'Secure tip',
  },
  {
    icon: Mail,
    eyebrow: 'Careers',
    title: 'Pitches and applications',
    body: 'Freelance pitches should include a one-paragraph summary, your reporting plan and links to previous work.',
    email: 'newsroom@mictech.news',
    subject: 'Pitch',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the newsroom."
        description="We read everything worth reading. For corrections, include the story URL and the exact passage in question."
      />
      <div className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {desks.map((desk) => {
            const Icon = desk.icon;
            return (
              <section key={desk.title} className="rounded-xl border border-line bg-panel p-6">
                <Icon className="size-5 text-signal" aria-hidden="true" />
                <p className="eyebrow mt-4 text-signal/85">{desk.eyebrow}</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-paper">{desk.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desk.body}</p>
                <a
                  href={`mailto:${desk.email}?subject=${encodeURIComponent(desk.subject)}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-signal hover:underline"
                >
                  <Mail className="size-4" aria-hidden="true" /> {desk.email}
                </a>
              </section>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-line bg-panel p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Postal address</p>
            <p className="mt-2 text-sm text-muted">
              MIC TECH Media · 14 Signal House · Innovation District
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-2 sm:mt-0">We do not accept unsolicited press releases by post.</p>
        </div>
      </div>
    </>
  );
}
