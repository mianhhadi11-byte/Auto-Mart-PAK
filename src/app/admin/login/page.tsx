import { redirect } from 'next/navigation';
import { Logo } from '@/components/site/Logo';
import { LoginForm } from '@/components/admin/LoginForm';
import { getCurrentUser } from '@/lib/auth/dal';
import { isSanityConfigured } from '@/lib/cms/sanity';
import { safeNextPath } from '@/lib/security';

export const metadata = {
  title: 'Sign in',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (user) redirect(safeNextPath(params.next));

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_520px_at_15%_0%,rgba(201,247,74,0.12),transparent_60%),radial-gradient(700px_480px_at_95%_100%,rgba(87,217,255,0.1),transparent_55%)]"
      />
      <header className="container-page flex items-center justify-between py-6">
        <Logo />
        <a href="/" className="text-xs font-medium text-muted transition-colors hover:text-paper">
          Back to mictech.news
        </a>
      </header>

      <main id="main" className="container-page flex flex-1 items-center justify-center py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-panel/80 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden flex-col justify-between gap-10 border-r border-line bg-[linear-gradient(180deg,rgba(201,247,74,0.06),transparent_55%)] p-10 lg:flex">
            <div>
              <p className="eyebrow text-signal">MIC TECH Newsroom</p>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
                Editorial control for the signal in technology.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Draft, review, schedule and publish. Every story is written by a human, checked by an
                editor and approved before it goes live.
              </p>
            </div>

            <ul className="space-y-4 text-sm text-muted">
              {[
                ['Role-based access', 'Admins, editors and contributors see only what they need.'],
                ['Human approval', 'AI assistance never publishes on its own.'],
                ['Live CMS', 'Published stories appear on the public site immediately.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-signal/30 bg-signal/10 text-[10px] font-bold text-signal">
                    ✓
                  </span>
                  <span>
                    <span className="block font-medium text-paper">{title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-2">{body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-line bg-ink/60 p-4 text-xs text-muted-2">
              <p className="font-medium text-muted">Content backend</p>
              <p className="mt-1">
                {isSanityConfigured()
                  ? 'Sanity hosted CMS is connected. Public content is served from your dataset.'
                  : 'Local editorial store is active. Add Sanity environment variables to switch to hosted CMS.'}
              </p>
            </div>
          </section>

          <section className="p-7 sm:p-10">
            <p className="eyebrow">Secure sign-in</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Use your newsroom account. Sessions expire after eight hours.
            </p>
            <LoginForm initialNext={safeNextPath(params.next)} />
          </section>
        </div>
      </main>

      <footer className="container-page py-6 text-center text-xs text-muted-2">
        MIC TECH Media · Authorised newsroom access only
      </footer>
    </div>
  );
}
