import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import './globals.css';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'MIC TECH — The signal in technology',
    template: '%s | MIC TECH',
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.legalName,
  category: 'technology',
  keywords: [
    'technology news',
    'AI news',
    'startups',
    'gadgets',
    'telecom',
    'reviews',
    'MIC TECH',
  ],
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/rss.xml' },
  },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: 'MIC TECH — The signal in technology',
    description: SITE.description,
    images: [
      {
        url: '/images/editorial/signal-ai-mesh.webp',
        width: 1600,
        height: 900,
        alt: 'MIC TECH editorial illustration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.twitter,
    creator: SITE.twitter,
    title: 'MIC TECH — The signal in technology',
    description: SITE.description,
    images: ['/images/editorial/signal-ai-mesh.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#080a0b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only z-[100] bg-signal px-4 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
