# MIC TECH

**The signal in technology.** An independent technology news site with a premium dark editorial design, a hosted Sanity CMS option, and a secure role-based newsroom dashboard with a human-reviewed AI writing assistant.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Sanity and Zod — no copied reference code, branding or stock imagery.

---

## What is included

### Public site
- Homepage with breaking ticker, featured lead, latest feed, trending, most-read, desk sections and video.
- Category pages for Technology, AI, Business, Startups, Mobile, Gadgets, Telecom, Social Media, Automobile, Education, Guides, Reviews and Opinion.
- Article pages with lead image, byline, published date/time, category, reading progress, full body, video support, tags, source credit, related stories and social sharing.
- Latest feed, search, author profiles, video desk, newsletter signup and unsubscribe.
- About, editorial standards, contact, advertise, privacy and 404/error/loading states.
- Fully responsive dark interface with accessible focus states, skip link and reduced-motion support.

### Newsroom admin (`/admin`)
- Secure cookie-based sign-in with scrypt password hashing, JWT sessions and rate limiting.
- Three roles: **admin**, **editor**, **contributor**.
- Article list with status tabs, search, category filter, pagination, quick publish/unpublish, featured/trending flags and delete confirmation.
- Full article editor: headline, slug, summary, structured body blocks, category, author, lead image upload, alt text, credit, video URL, tags, source attribution, review score, SEO title, meta description, social caption, schedule date and publishing flags.
- Contributor workflow: contributors can save drafts and submit for review but cannot publish, schedule, change flags or delete.
- Author management (create/edit/delete with reassignment guard).
- Subscriber list with search, status filter and CSV export.
- Editorial policy page and newsroom activity audit log.
- AI assistant for draft, headlines, summary, grammar, SEO, social posts and readability — with explicit AI-assisted marking and no auto-publish.

### CMS modes
The app has two backends behind one repository layer:

| Mode | When | Data | Images |
| --- | --- | --- | --- |
| **Local editorial store** | `NEXT_PUBLIC_SANITY_PROJECT_ID` is blank and no Blob token | `data/mictech.json`, seeded on first request | `public/uploads` |
| **Local store on Vercel Blob** | `DATA_BLOB_READ_WRITE_TOKEN` is set | Private Blob `mictech/store.json` | Public Blob `uploads/*` |
| **Sanity hosted CMS** | Project ID is set | Sanity dataset documents | Sanity image assets |

The public site, admin dashboard and publishing workflow are functional in all modes. Hosted Sanity additionally exposes `/studio`. Vercel Blob keeps the zero-config local CMS working on serverless without a database: the JSON store lives in a private Blob and uploaded images live in a public Blob store.

### SEO and delivery
- Dynamic metadata, canonical URLs and Open Graph/Twitter cards.
- `NewsArticle` and `BreadcrumbList` JSON-LD on article pages.
- XML sitemap, `robots.txt`, RSS feed and PWA manifest.
- Optimised WebP uploads through Sharp (max 1920×1080, 8 MB input limit).
- Published content appears immediately without a redeploy (dynamic public layout + revalidation on writes).
- Sanity webhook endpoint for cache revalidation in hosted deployments.

---

## Requirements

- Node.js 20+ (tested on Node 24)
- npm 10+
- A Sanity project only if you want hosted CMS mode

## Getting started (zero configuration)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The local editorial store is created automatically at `data/mictech.json` on first request.

On Windows PowerShell where script execution is restricted, use `npm.cmd run dev` and the other `npm.cmd` equivalents.

### Newsroom account

The store ships with a single administrator account, seeded in local mode. The demo credentials are hidden on the login screen in production builds.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `helloevolution@mictech.pk` | `mic@@2727` |

You can override the seeded credentials with `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the store is first created. Delete `data/mictech.json` to reseed. Sign in at `/admin/login`.

The repository and API still enforce the full role model (`admin`, `editor`, `contributor`), so additional accounts can be added to the store when you need a larger team. Only the seeded account is an administrator.

> Change the seeded password and set a strong `AUTH_SECRET` before deploying. Auth users always live in the local JSON store, even when content is hosted in Sanity.

---

## Environment variables

Copy `.env.example` to `.env.local` and set what you need. The site runs with no keys in local mode.

### Core
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
AUTH_SECRET=<long-random-string>   # required in production
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### Sanity (optional)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_READ_TOKEN=           # only needed for private datasets
SANITY_API_WRITE_TOKEN=          # required for admin writes
SANITY_REVALIDATE_SECRET=        # shared secret for the webhook
```

### AI assistant (optional)
```env
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
AI_PROVIDER=openai               # openai | anthropic
```

With no `AI_API_KEY`, the assistant uses a deterministic extractive "demo" mode so the full interface remains testable. Provider failures also fall back to demo mode with a warning. The key is read only on the server.

### Newsletter email (optional)
```env
RESEND_API_KEY=
NEWSLETTER_FROM=MIC TECH <newsletter@mictech.news>
```

Without a Resend key, signups are still recorded and the API returns success; no welcome email is sent.

---

## Publishing workflow

1. Sign in at `/admin/login` with the admin account.
2. Create a story, add a lead image and save it as a **draft**.
3. Optionally click **Submit for review** and open the review queue from the dashboard.
4. Verify facts/sources and optionally set **Featured**, **Trending** or **Breaking**.
5. Choose **Publish now** or set a future date/time and status **Scheduled**.
6. The public article page, homepage feed, category page, sitemap and RSS update on the next request — no redeploy.

The store ships with one admin account. The full role model is still enforced by the repository and API: if you add an editor or contributor account to the store, contributors can save drafts and submit for review but cannot publish, schedule, change homepage flags, delete stories or edit another author's work.

Scheduled stories become public automatically when `publishedAt <= now` and status is `scheduled` or `published`.

---

## Using hosted Sanity

1. Create a project and a dataset (the default name is `production`) at <https://sanity.io/manage>.
2. Add the project ID and dataset to `.env.local`.
3. Create an API token with **Editor** permissions and set `SANITY_API_WRITE_TOKEN`.
4. If the dataset is private, create a read token and set `SANITY_API_READ_TOKEN`.
5. Add `http://localhost:3000` and your production origin to the project's **CORS origins** with credentials allowed.
6. Run the app once in local mode if you want seed data, then import it:

```bash
npm run dev          # creates data/mictech.json on first request
npm run seed:sanity  # uploads categories, authors, articles and local images
```

7. Restart the app. Public pages and `/admin` now read and write Sanity. Open `/studio` to use the hosted Studio UI.

### Optional webhook
Create a Sanity webhook targeting:

```
POST https://your-domain.com/api/revalidate?secret=YOUR_SANITY_REVALIDATE_SECRET
```

The endpoint validates the secret and revalidates the content cache and layout. The custom admin also calls `revalidatePath` after writes, so a webhook is mainly useful for edits made directly in Studio.

### Sanity project files
- `sanity.config.ts` — Studio configuration and desk structure
- `sanity.cli.ts` — CLI project/dataset config
- `src/sanity/schemaTypes/` — article, author and category schemas

Run the Studio separately with `npm run studio` if you prefer not to embed it.

---

## AI assistant setup and rules

The assistant lives in the article editor. It is server-only (`src/lib/ai.ts`) and is rate limited per account.

Supported tasks: draft, five headline options, summary, grammar correction, SEO title/meta/slug, X and LinkedIn posts, and readability notes.

Guardrails:
- The system prompt only permits facts present in the supplied source notes and requires `[VERIFY]` for missing details.
- The UI starts from your notes or current draft; nothing is invented locally in demo mode.
- Every response includes a disclaimer. Applying a suggestion marks the story as **AI-assisted**.
- Nothing is published automatically. A human editor must verify and approve.
- No source material is sent anywhere unless you configure `AI_API_KEY`.

---

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/login` | POST | Sign in, rate limited, sets HttpOnly cookie |
| `/api/auth/logout` | POST | Clear session |
| `/api/admin/articles` | GET/POST | List (scoped) / create article |
| `/api/admin/articles/[id]` | PATCH/DELETE | Update / delete article |
| `/api/admin/articles/[id]/flags` | PATCH | Publish, schedule, feature, trend, break |
| `/api/admin/upload` | POST | Validate, resize, convert and store image |
| `/api/admin/ai` | POST | Run an assistant task |
| `/api/admin/authors` | POST | Create author |
| `/api/admin/authors/[id]` | PATCH/DELETE | Update / delete author |
| `/api/newsletter` | POST | Subscribe |
| `/api/newsletter/unsubscribe` | POST | Unsubscribe |
| `/api/revalidate` | POST | Secret-protected Sanity webhook |

All mutation routes require a valid session, same-origin requests and role checks. Uploads and AI calls have per-user limits.

---

## Project structure

```text
src/
  app/
    (site)/                 Public pages (dynamic, CMS-backed)
    admin/                  Login + protected newsroom dashboard
    api/                    Auth, admin, newsletter and revalidate routes
    studio/                 Embedded Sanity Studio or setup instructions
    sitemap.ts robots.ts manifest.ts rss.xml/
  components/
    site/                   Public UI
    admin/                  Newsroom UI and editor
  lib/
    cms/                    Sanity adapter, local store, seed, repository
    auth/                   Password hashing, JWT sessions, DAL
    ai.ts validation.ts security.ts constants.ts types.ts utils.ts
  sanity/schemaTypes/       Content schemas
  proxy.ts                  Optimistic /admin cookie gate (Next 16 proxy convention)
scripts/
  seed-sanity.mjs           Local store → Sanity import
  generate-editorial-images.mjs
  generate-videos.mjs
data/mictech.json           Local store (gitignored, generated)
public/images/editorial/    Original generated editorial artwork
public/videos/              Original generated video reports
```

---

## Security notes

- Passwords use Node `scrypt` with per-user salts; hashes never leave the server.
- Sessions are signed JWTs in an HttpOnly, SameSite=Lax cookie and expire after 8 hours.
- `src/proxy.ts` blocks unauthenticated `/admin` navigation; every page and API repeats the check server-side.
- Mutations verify the request origin and role.
- Login attempts are rate limited per IP + email; AI and upload routes are limited per user.
- `AUTH_SECRET` falls back to a development value only for local review. In any `NODE_ENV=production` server, missing or short secrets make sign-in fail with a clear 503 (and no session can be verified), so a misconfigured deployment can never accept forged cookies. Set at least 32 random characters.
- The local store writes atomically through a serialized queue to avoid corrupting JSON under concurrent writes.
- Uploaded images are validated by MIME type, size and Sharp decoding before being written.

---

## Scripts

```bash
npm run dev             # development server
npm run build           # production build + type validation
npm run start           # serve the production build
npm run typecheck       # tsc --noEmit
npm run lint            # Oxlint
npm run studio          # Sanity Studio dev server
npm run studio:build    # build the Studio
npm run seed:sanity     # import local content into Sanity
npm run generate:images # regenerate original editorial artwork
npm run generate:videos # regenerate original video reports
```

---

## Production deployment

### Vercel (Blob-backed local CMS)

1. Import the repository into Vercel, or run `vercel` from the project root.
2. Create two Blob stores in the project: one **private** store for the JSON CMS (connect it with the `DATA_` prefix so it exposes `DATA_BLOB_READ_WRITE_TOKEN`) and one **public** store for article images (default `BLOB_READ_WRITE_TOKEN`).
3. Set `NEXT_PUBLIC_SITE_URL` to the deployment URL, plus a 32+ character `AUTH_SECRET` and the seeded `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. Deploy. On the first request the store is seeded into the private Blob with the single admin account.
5. Sign in at `/admin/login`, publish a story, upload a lead image and confirm it appears on the public site.

### Node host with a persistent disk

1. Set `NEXT_PUBLIC_SITE_URL` and `AUTH_SECRET`.
2. Mount a persistent volume for `data/mictech.json` and `public/uploads` (or point `MICTECH_DATA_FILE` at the volume).
3. Build and start with `npm run build` and `npm run start`.

### Hosted Sanity

Set the Sanity project, dataset and write token, add your production domain to Sanity CORS origins, and configure the revalidation webhook. Auth users still live in the local store, so pair Sanity with a persistent host or Blob store.

Change the seeded admin password, then verify the draft → review → publish workflow.

---

## Content and licensing

The store starts with an empty article list so you can publish your own reporting immediately. Any sample companies, products and people that remain in author profiles are fictional demonstration content. Editorial images and video reports were generated locally for this project. No reference source code, logo, branding or copyrighted media is included.
