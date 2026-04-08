# kotona.app

Small Astro site for writing, notes, and failure write-ups.

The scope is intentionally narrow. This is not a portfolio product surface or a
content machine. It is a minimal static site for things worth writing down when
they survive compression from work and hobby projects.

## Stack

- Astro with TypeScript
- MDX-enabled content collections
- Cloudflare Worker deployment via Wrangler
- Minimal custom CSS
- RSS and sitemap generation

## Local development

This repo targets Node 20 LTS.

```bash
npm ci
npm run dev
```

To preview the deployed Worker behavior locally:

```bash
npm run preview
```

## Validation

Run the same checks locally that CI runs:

```bash
npm run format
npm run lint
npm run check
npm run build
```

Or run the combined validation flow:

```bash
npm run validate
```

## Content authoring

Site metadata and public links live in `src/site.ts`.

Posts live in `src/content/posts/`.

To add a post:

1. Copy `docs/templates/post-template.md` into `src/content/posts/`.
2. Fill in the frontmatter.
3. Keep the structure as simple as the subject allows.

Frontmatter is schema-validated during `npm run check` and `npm run build`.

Draft behavior:

- drafts render in development
- drafts are excluded from production builds
- drafts are excluded from RSS output

## Information architecture

- `/` home page with a short intro and recent writing
- `/writing/` reverse chronological writing index
- `/writing/[slug]/` post detail pages
- `/about/` short context page
- `/rss.xml` RSS feed for published posts
- `/404/` custom not found page

## Deployment

This repo deploys to Cloudflare Workers using the Astro Cloudflare adapter and
`wrangler.jsonc` as the deployment source of truth.

Useful commands:

- `npm run build` builds the Worker and static assets into `dist/`
- `npm run preview` builds and starts a local Wrangler preview
- `npm run deploy` builds and deploys the Worker
- `npm run cf-typegen` regenerates `worker-configuration.d.ts` after binding changes

The Cloudflare dashboard can manage the custom domain attachment itself. This
repo only defines the Worker runtime and build/deploy settings.

CI lives in `.github/workflows/ci.yml` and runs install, format check, lint,
Astro checks, and the production build.
