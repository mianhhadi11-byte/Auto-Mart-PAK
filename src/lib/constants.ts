import type { CategorySlug, Role, SiteSettings } from './types';

export { CATEGORY_SLUGS } from './types';

export const SITE = {
  name: 'MIC TECH',
  legalName: 'MIC TECH Media',
  tagline: 'The signal in technology.',
  description:
    'Independent technology journalism for people who build, buy and govern the next decade of computing.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  locale: 'en_US',
  twitter: '@mictechnews',
  founded: 2026,
  contactEmail: 'hello@mictech.news',
  editorialEmail: 'newsroom@mictech.news',
} as const;

export const CATEGORY_META: Record<
  CategorySlug,
  { name: string; kicker: string; description: string; accent: string; order: number }
> = {
  technology: {
    name: 'Technology',
    kicker: 'Systems',
    description:
      'The architecture of modern computing — chips, clouds, security, energy and the engineering decisions that shape daily life.',
    accent: '#57d9ff',
    order: 1,
  },
  ai: {
    name: 'AI',
    kicker: 'Intelligence',
    description:
      'Reporting and analysis on models, agents, infrastructure and the people building the next layer of software.',
    accent: '#c9f74a',
    order: 2,
  },
  business: {
    name: 'Business',
    kicker: 'Capital',
    description:
      'The deals, earnings, policy and market shifts moving the technology economy — with context, not hype.',
    accent: '#ffc857',
    order: 3,
  },
  startups: {
    name: 'Startups',
    kicker: 'Builders',
    description:
      'The founders, funds and early-stage companies turning technical ideas into durable businesses.',
    accent: '#8ef0a5',
    order: 4,
  },
  mobile: {
    name: 'Mobile',
    kicker: 'In hand',
    description:
      'Phones, platforms and the small decisions that define how billions of people connect.',
    accent: '#a78bfa',
    order: 5,
  },
  gadgets: {
    name: 'Gadgets',
    kicker: 'Objects',
    description:
      'Hardware worth your attention — from audio and wearables to the smart home and the tools on your desk.',
    accent: '#57d9ff',
    order: 6,
  },
  telecom: {
    name: 'Telecom',
    kicker: 'Networks',
    description:
      'Spectrum, connectivity, satellites and the infrastructure behind every call, stream and transaction.',
    accent: '#59e3c2',
    order: 7,
  },
  'social-media': {
    name: 'Social Media',
    kicker: 'Culture',
    description:
      'The platforms, creators and incentives shaping public conversation and the business of attention.',
    accent: '#ff74b1',
    order: 8,
  },
  automobile: {
    name: 'Automobile',
    kicker: 'Mobility',
    description:
      'Electric vehicles, software-defined cars and the messy transition of the world’s roads.',
    accent: '#ff8a4c',
    order: 9,
  },
  education: {
    name: 'Education',
    kicker: 'Talent',
    description:
      'How technology is changing classrooms, credentials and the pathway from learning to work.',
    accent: '#7f9cff',
    order: 10,
  },
  guides: {
    name: 'Guides',
    kicker: 'Useful',
    description:
      'Practical, tested advice for buying better technology, protecting your work and understanding the fine print.',
    accent: '#c9f74a',
    order: 11,
  },
  reviews: {
    name: 'Reviews',
    kicker: 'Tested',
    description:
      'Independent hardware reviews with real-world testing, clear verdicts and no sponsored scores.',
    accent: '#ffc857',
    order: 12,
  },
  opinion: {
    name: 'Opinion',
    kicker: 'Argument',
    description:
      'Reported argument and informed perspective on the choices that technology forces us to make.',
    accent: '#ff6b6b',
    order: 13,
  },
};

export const NAV_CATEGORIES: Array<{ name: string; slug: CategorySlug }> = [
  { name: 'Latest', slug: 'technology' },
  { name: 'Tech', slug: 'technology' },
  { name: 'AI', slug: 'ai' },
  { name: 'Business', slug: 'business' },
  { name: 'Startups', slug: 'startups' },
  { name: 'Mobile', slug: 'mobile' },
  { name: 'Gadgets', slug: 'gadgets' },
  { name: 'Telecom', slug: 'telecom' },
  { name: 'Auto', slug: 'automobile' },
  { name: 'Education', slug: 'education' },
];

export const PRIMARY_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Latest', href: '/latest' },
  { label: 'Tech', href: '/category/technology' },
  { label: 'AI', href: '/category/ai' },
  { label: 'Business', href: '/category/business' },
  { label: 'Startups', href: '/category/startups' },
  { label: 'Mobile', href: '/category/mobile' },
  { label: 'Gadgets', href: '/category/gadgets' },
  { label: 'Telecom', href: '/category/telecom' },
  { label: 'More', href: '/category/opinion' },
];

export const FOOTER_LINKS = {
  newsroom: [
    { label: 'About MIC TECH', href: '/about' },
    { label: 'Editorial standards', href: '/ethics' },
    { label: 'Contact', href: '/contact' },
    { label: 'Advertise', href: '/advertise' },
  ],
  platform: [
    { label: 'Latest news', href: '/latest' },
    { label: 'Video desk', href: '/videos' },
    { label: 'Guides', href: '/category/guides' },
    { label: 'Reviews', href: '/category/reviews' },
    { label: 'Opinion', href: '/category/opinion' },
  ],
  legal: [
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/privacy#terms' },
    { label: 'RSS feed', href: '/rss.xml' },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/mictechnews', icon: 'x' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/mictech', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/mictechofficial', icon: 'instagram' },
  { label: 'YouTube', href: 'https://www.youtube.com/@mictechnews', icon: 'youtube' },
] as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  name: 'MIC TECH',
  tagline: 'The signal in technology.',
  description:
    'Independent technology journalism for people who build, buy and govern the next decade of computing.',
  contactEmail: 'hello@mictech.news',
  editorialEmail: 'newsroom@mictech.news',
  address: 'MIC TECH Media, 14 Signal House, Innovation District',
  social: {
    x: 'https://x.com/mictechnews',
    linkedin: 'https://www.linkedin.com/company/mictech',
    instagram: 'https://www.instagram.com/mictechofficial',
    youtube: 'https://www.youtube.com/@mictechnews',
    whatsapp: 'https://whatsapp.com/channel/mictech',
  },
  newsletterNote:
    'One sharp briefing every weekday. The context behind the headline, written by the MIC TECH newsroom.',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  contributor: 'Contributor',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full control of the newsroom, accounts, authors and publishing.',
  editor: 'Can create, edit, publish and schedule stories, and manage authors.',
  contributor: 'Can draft and submit stories for editorial review. Cannot publish.',
};

export const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    email: 'helloevolution@mictech.pk',
    password: 'mic@@2727',
    name: 'MIC TECH Admin',
  },
];

export const PLACEHOLDER_IMAGE = '/images/editorial/signal-ai-mesh.webp';

export const CACHE_TAG = 'mictech-content';
