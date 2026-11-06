import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { SITE } from '@/lib/constants';

export const metadata = {
  title: 'Privacy & terms',
  description: 'How MIC TECH handles personal data, cookies, newsletter subscriptions and editorial content.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy, cookies and terms"
        description="Plain-language notes on what we collect, why we collect it and what you can ask us to remove."
      />
      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-muted">
          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-2">Last updated: 2 November 2026</p>

          <section>
            <h2 className="font-display text-xl font-semibold text-paper">What we collect</h2>
            <p className="mt-2">
              If you subscribe to the briefing, we store the email address you provide, the page that referred you and
              the date of subscription. If you sign in to the newsroom, we store a session cookie and record sign-in
              events for security. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-paper">Cookies</h2>
            <p className="mt-2">
              The public site does not use advertising or analytics cookies. The admin dashboard uses one essential,
              HttpOnly session cookie (<code className="text-signal">mictech_session</code>) to keep you signed in. It
              expires after eight hours or when you sign out.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-paper">Newsletter</h2>
            <p className="mt-2">
              Subscribers receive the MIC TECH weekday briefing and occasional editorial updates. Every email includes an
              unsubscribe link. You can also remove your address on the{' '}
              <Link href="/unsubscribe" className="text-signal hover:underline">
                unsubscribe page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-paper">Service providers</h2>
            <p className="mt-2">
              Hosted content may be stored in Sanity. Newsletter email delivery may use Resend. These providers process
              data on our behalf and are bound by their own security and privacy terms. The site can run entirely on a
              local editorial store without external providers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-paper">Your rights</h2>
            <p className="mt-2">
              You can ask us to access, correct or delete the personal data we hold about you, or withdraw newsletter
              consent. Email{' '}
              <a href={`mailto:${SITE.contactEmail}`} className="text-signal hover:underline">
                {SITE.contactEmail}
              </a>{' '}
              and we will respond within a reasonable period. We may need to verify your identity before acting.
            </p>
          </section>

          <section id="terms" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-paper">Terms of use</h2>
            <p className="mt-2">
              Content is provided for general information. It is not legal, financial or professional advice. You may
              quote short extracts with clear attribution and a link. Republishing full articles, images or video without
              written permission is not allowed. We may update these terms; the date at the top of this page will change.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-paper">Security</h2>
            <p className="mt-2">
              Newsroom accounts use hashed passwords, HttpOnly session cookies, role-based permissions and rate limiting.
              If you believe you have found a security issue, contact{' '}
              <a href="mailto:secure@mictech.news" className="text-signal hover:underline">
                secure@mictech.news
              </a>{' '}
              before disclosing it publicly.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
