import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { UnsubscribeForm } from '@/components/site/UnsubscribeForm';

export const metadata = {
  title: 'Unsubscribe',
  description: 'Remove your email from the MIC TECH weekday briefing.',
  alternates: { canonical: '/unsubscribe' },
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Briefing"
        title="Leave the list."
        description="No hard feelings. Enter the email address you subscribed with and we will remove it from the MIC TECH briefing."
      />
      <div className="container-page py-10">
        <div className="mx-auto max-w-md rounded-xl border border-line bg-panel p-6">
          <UnsubscribeForm defaultEmail={email || ''} />
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted-2">
            Changed your mind?{' '}
            <Link href="/latest" className="text-signal hover:underline">
              Keep reading the latest
            </Link>{' '}
            or resubscribe from any page.
          </p>
        </div>
      </div>
    </>
  );
}
