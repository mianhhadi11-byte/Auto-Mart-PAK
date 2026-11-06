import { z } from 'zod';
import { CATEGORY_SLUGS } from '@/lib/types';

export const loginSchema = z.object({
  email: z.string().trim().min(3, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  next: z.string().optional(),
});

const spanSchema = z.object({
  _key: z.string(),
  _type: z.literal('span'),
  text: z.string(),
  marks: z.array(z.string()).default([]),
});

const blockSchema = z.object({
  _key: z.string(),
  _type: z.literal('block'),
  style: z.enum(['normal', 'h2', 'h3', 'blockquote']),
  listItem: z.enum(['bullet', 'number']).optional(),
  level: z.number().optional(),
  children: z.array(spanSchema).min(1),
  markDefs: z
    .array(
      z.object({
        _key: z.string(),
        _type: z.literal('link'),
        href: z.string(),
      }),
    )
    .default([]),
});

export const articleInputSchema = z.object({
  title: z.string().trim().min(8, 'Headline must be at least 8 characters.').max(180),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug is required.')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.'),
  excerpt: z.string().trim().min(20, 'Add a short summary of at least 20 characters.').max(420),
  body: z.array(blockSchema).min(1, 'Add at least one content block.'),
  categorySlug: z.enum(CATEGORY_SLUGS),
  authorId: z.string().trim().min(1, 'Choose an author.'),
  imageUrl: z.string().trim().min(1, 'Add a lead image.'),
  imageAssetId: z.string().optional(),
  imageAlt: z.string().trim().min(5, 'Describe the image for accessibility.').max(240),
  imageCredit: z.string().trim().max(160).default('MIC TECH Studio'),
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  breaking: z.boolean().default(false),
  publishedAt: z.string().datetime({ offset: true }).nullable(),
  videoUrl: z
    .string()
    .trim()
    .url('Enter a valid video URL.')
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(170).optional().or(z.literal('')),
  socialCaption: z.string().trim().max(400).optional().or(z.literal('')),
  sourceName: z.string().trim().max(120).optional().or(z.literal('')),
  sourceUrl: z.string().trim().url().optional().or(z.literal('')),
  rating: z.number().min(0).max(10).optional(),
  aiAssisted: z.boolean().default(false),
});

export const flagsSchema = z.object({
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  breaking: z.boolean().optional(),
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']).optional(),
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const authorInputSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.'),
  role: z.string().trim().min(2, 'Title is required.').max(100),
  bio: z.string().trim().min(20, 'Add a short bio.').max(600),
  email: z.string().trim().email().optional().or(z.literal('')),
  twitter: z.string().trim().url().optional().or(z.literal('')),
  linkedin: z.string().trim().url().optional().or(z.literal('')),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(200),
  source: z.string().trim().max(60).optional(),
});

export const aiTaskSchema = z.enum([
  'draft',
  'headlines',
  'summary',
  'grammar',
  'seo',
  'social',
  'readability',
]);

export const aiRequestSchema = z.object({
  task: aiTaskSchema,
  title: z.string().trim().max(200).optional(),
  text: z.string().trim().max(20000).optional(),
  tone: z.string().trim().max(80).optional(),
  sources: z
    .array(
      z.object({
        name: z.string().trim().max(160),
        url: z.string().trim().max(500),
        text: z.string().trim().max(12000),
      }),
    )
    .max(6)
    .default([]),
});

export function fieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}
