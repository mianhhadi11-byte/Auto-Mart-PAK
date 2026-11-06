import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Newsroom',
    template: '%s | MIC TECH Newsroom',
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink text-paper">{children}</div>;
}
