export const CATEGORY_SLUGS = [
  'technology',
  'ai',
  'business',
  'startups',
  'mobile',
  'gadgets',
  'telecom',
  'social-media',
  'automobile',
  'education',
  'guides',
  'reviews',
  'opinion',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Role = 'admin' | 'editor' | 'contributor';

export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  kicker: string;
  accent: string;
  order: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  initials: string;
  avatarColor: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  createdAt?: string;
}

export interface MarkDef {
  _key: string;
  _type: 'link';
  href: string;
}

export interface Span {
  _key: string;
  _type: 'span';
  text: string;
  marks: string[];
}

export interface ContentBlock {
  _key: string;
  _type: 'block';
  style: 'normal' | 'h2' | 'h3' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  children: Span[];
  markDefs: MarkDef[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: ContentBlock[];
  categorySlug: CategorySlug;
  authorId: string;
  imageUrl: string;
  imageAssetId?: string;
  imageAlt: string;
  imageCredit: string;
  status: ArticleStatus;
  featured: boolean;
  trending: boolean;
  breaking: boolean;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  videoUrl?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  socialCaption?: string;
  sourceName?: string;
  sourceUrl?: string;
  readMinutes: number;
  views: number;
  rating?: number;
  aiAssisted: boolean;
  editorId?: string;
}

export interface Story extends Article {
  author: Author;
  category: Category;
}

export interface EditorialUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  authorId?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  source: string;
  status: 'active' | 'unsubscribed';
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  detail?: string;
  createdAt: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  description: string;
  contactEmail: string;
  editorialEmail: string;
  address: string;
  social: {
    x: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  newsletterNote: string;
}

export interface StoreData {
  version: number;
  settings: SiteSettings;
  categories: Category[];
  authors: Author[];
  users: EditorialUser[];
  articles: Article[];
  subscribers: Subscriber[];
  audit: AuditEvent[];
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface HomepageData {
  breaking: Story[];
  featured: Story[];
  trending: Story[];
  latest: Story[];
  mostRead: Story[];
  categories: Array<{ category: Category; stories: Story[] }>;
  videos: Story[];
  guides: Story[];
  opinion: Story[];
}

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  body: ContentBlock[];
  categorySlug: CategorySlug;
  authorId: string;
  imageUrl: string;
  imageAssetId?: string;
  imageAlt: string;
  imageCredit: string;
  status: ArticleStatus;
  featured: boolean;
  trending: boolean;
  breaking: boolean;
  publishedAt: string | null;
  videoUrl?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  socialCaption?: string;
  sourceName?: string;
  sourceUrl?: string;
  rating?: number;
  aiAssisted: boolean;
}
