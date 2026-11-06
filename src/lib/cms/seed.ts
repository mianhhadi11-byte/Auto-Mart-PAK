import 'server-only';
import { CATEGORY_META, CATEGORY_SLUGS, DEFAULT_SETTINGS, DEMO_ACCOUNTS } from '@/lib/constants';
import type { Author, Category, EditorialUser, StoreData } from '@/lib/types';
import { hashPassword } from '@/lib/auth/password';

export const SEED_AUTHORS: Author[] = [
  {
    id: 'author-mic-tech-newsroom',
    name: 'MIC TECH Newsroom',
    slug: 'mic-tech-newsroom',
    role: 'Editorial desk',
    bio: 'Reporting and analysis from the MIC TECH editorial team across technology, AI, business and the devices people use every day.',
    initials: 'MT',
    avatarColor: 'from-lime-300/35 to-cyan-500/10 text-lime-100',
  },
  {
    id: 'author-ayesha-rahman',
    name: 'Ayesha Rahman',
    slug: 'ayesha-rahman',
    role: 'Editor-in-Chief',
    bio: 'Ayesha leads the MIC TECH newsroom. She has covered technology policy, infrastructure and the business of computing for more than a decade.',
    initials: 'AR',
    avatarColor: 'from-lime-300/35 to-emerald-500/10 text-lime-100',
    email: 'ayesha@mictech.news',
    twitter: 'https://x.com/mictechnews',
    linkedin: 'https://www.linkedin.com/company/mictech',
  },
  {
    id: 'author-daniyal-khan',
    name: 'Daniyal Khan',
    slug: 'daniyal-khan',
    role: 'Senior AI Correspondent',
    bio: 'Daniyal reports on models, chips and the data-center economy. He writes the weekly Signal & Noise column.',
    initials: 'DK',
    avatarColor: 'from-cyan-300/35 to-blue-500/10 text-cyan-100',
    email: 'daniyal@mictech.news',
    twitter: 'https://x.com/mictechnews',
  },
  {
    id: 'author-mira-sethi',
    name: 'Mira Sethi',
    slug: 'mira-sethi',
    role: 'Business Editor',
    bio: 'Mira covers capital, market structure and the companies building the plumbing of the digital economy.',
    initials: 'MS',
    avatarColor: 'from-amber-300/35 to-orange-500/10 text-amber-100',
    email: 'mira@mictech.news',
    linkedin: 'https://www.linkedin.com/company/mictech',
  },
  {
    id: 'author-omar-farooq',
    name: 'Omar Farooq',
    slug: 'omar-farooq',
    role: 'Devices Editor',
    bio: 'Omar tests phones, laptops and the strange objects that end up on our desks. He cares about repairability more than spec sheets.',
    initials: 'OF',
    avatarColor: 'from-violet-300/35 to-fuchsia-500/10 text-violet-100',
    email: 'omar@mictech.news',
    twitter: 'https://x.com/mictechnews',
  },
  {
    id: 'author-sana-iqbal',
    name: 'Sana Iqbal',
    slug: 'sana-iqbal',
    role: 'Telecom & Policy Reporter',
    bio: 'Sana follows spectrum, satellites and the regulatory choices that decide who gets connected.',
    initials: 'SI',
    avatarColor: 'from-emerald-300/35 to-teal-500/10 text-emerald-100',
    email: 'sana@mictech.news',
  },
  {
    id: 'author-zain-abbas',
    name: 'Zain Abbas',
    slug: 'zain-abbas',
    role: 'Reviews Lead',
    bio: 'Zain runs the MIC TECH test bench. He believes a good review should tell you what a product feels like after the novelty wears off.',
    initials: 'ZA',
    avatarColor: 'from-orange-300/35 to-rose-500/10 text-orange-100',
    email: 'zain@mictech.news',
  },
  {
    id: 'author-hira-nadeem',
    name: 'Hira Nadeem',
    slug: 'hira-nadeem',
    role: 'Culture & Platforms Editor',
    bio: 'Hira covers social platforms, creator economies and the way technology rearranges public life.',
    initials: 'HN',
    avatarColor: 'from-pink-300/35 to-fuchsia-500/10 text-pink-100',
    email: 'hira@mictech.news',
  },
  {
    id: 'author-usman-tariq',
    name: 'Usman Tariq',
    slug: 'usman-tariq',
    role: 'Mobility Editor',
    bio: 'Usman writes about electric vehicles, charging networks and the software creeping into every car.',
    initials: 'UT',
    avatarColor: 'from-red-300/35 to-orange-500/10 text-red-100',
    email: 'usman@mictech.news',
  },
  {
    id: 'author-nadia-shah',
    name: 'Nadia Shah',
    slug: 'nadia-shah',
    role: 'Education & Talent Reporter',
    bio: 'Nadia reports on learning, credentials and the changing pathway from education to work.',
    initials: 'NS',
    avatarColor: 'from-blue-300/35 to-indigo-500/10 text-blue-100',
    email: 'nadia@mictech.news',
  },
  {
    id: 'author-hamza-raza',
    name: 'Hamza Raza',
    slug: 'hamza-raza',
    role: 'Contributing Editor',
    bio: 'Hamza writes reported argument about technology, institutions and the choices we keep postponing.',
    initials: 'HR',
    avatarColor: 'from-rose-300/35 to-red-500/10 text-rose-100',
    email: 'hamza@mictech.news',
  },
];

function buildCategories(): Category[] {
  return CATEGORY_SLUGS.map((slug, index) => {
    const meta = CATEGORY_META[slug];
    return {
      id: `cat-${slug}`,
      slug,
      name: meta.name,
      kicker: meta.kicker,
      description: meta.description,
      accent: meta.accent,
      order: meta.order ?? index + 1,
    };
  }).sort((a, b) => a.order - b.order);
}

async function buildUsers(): Promise<EditorialUser[]> {
  const email = (process.env.ADMIN_EMAIL || DEMO_ACCOUNTS[0].email).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || DEMO_ACCOUNTS[0].password;

  return [
    {
      id: 'user-admin',
      name: DEMO_ACCOUNTS[0].name,
      email,
      role: 'admin',
      authorId: 'author-mic-tech-newsroom',
      passwordHash: await hashPassword(password),
      createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
      lastLoginAt: undefined,
    },
  ];
}

export async function buildSeedData(): Promise<StoreData> {
  const users = await buildUsers();
  const now = Date.now();
  return {
    version: 1,
    settings: DEFAULT_SETTINGS,
    categories: buildCategories(),
    authors: SEED_AUTHORS,
    users,
    articles: [],
    subscribers: [],
    audit: [
      {
        id: 'audit-seed',
        actorId: 'user-admin',
        actorName: 'MIC TECH Admin',
        action: 'system.seed',
        target: 'MIC TECH newsroom',
        detail: 'Initial editorial dataset created.',
        createdAt: new Date(now - 86400000).toISOString(),
      },
    ],
  };
}
