import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { FOOTER_LINKS, SITE, SOCIAL_LINKS } from '@/lib/constants';
import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';
import { SocialIcon } from './SocialIcon';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-black/25">
      <div className="container-page">
        <div id="briefing" className="grid gap-8 border-b border-line py-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow text-signal/85">The MIC TECH briefing</p>
            <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold leading-[1.12] tracking-[-0.03em] text-paper sm:text-3xl">
              The context behind the headline, in one sharp weekday email.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Written by the newsroom. No sponsored scores, no breathless hype, no filler.
            </p>
          </div>
          <div className="lg:pl-6">
            <NewsletterForm source="footer" />
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Independent technology journalism for people who build, buy and govern the next decade of computing.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-signal/40 hover:text-signal"
                  aria-label={`MIC TECH on ${social.label}`}
                >
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Newsroom" links={FOOTER_LINKS.newsroom} />
          <FooterColumn title="Platform" links={FOOTER_LINKS.platform} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 text-[0.68rem] text-muted-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} {SITE.legalName}. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Built for the open web.</span>
            <span className="text-white/15">/</span>
            <a href={`mailto:${SITE.contactEmail}`} className="hover:text-signal">
              {SITE.contactEmail}
            </a>
            <span className="text-white/15">/</span>
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-signal">
              Newsroom <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="eyebrow mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted transition-colors hover:text-signal">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
