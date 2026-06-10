# kotona.app

Small Astro site for project notes and system notes.

The scope is intentionally narrow. This is not a portfolio product surface or a
content machine. It is a minimal static site for compressed project context,
system rules, and reference designs.

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

Project notes live in `src/content/projects/`.
System notes live in `src/content/notes/`.

To add a system note:

1. Create a Markdown file in `src/content/notes/`.
2. Fill in the frontmatter.
3. Keep the structure terse and diagram-heavy where useful.

Frontmatter is schema-validated during `npm run check` and `npm run build`.

Draft behavior:

- drafts render in development
- drafts are excluded from production builds
- drafts are excluded from RSS output

## Information architecture

- `/` home page with a short intro, projects, and recent notes
- `/notes/` reverse chronological notes index
- `/notes/[slug]/` note detail pages
- `/about/` short context page
- `/rss.xml` RSS feed for published notes
- `/404/` custom not found page

## Deployment

This repo deploys to Cloudflare Workers using the Astro Cloudflare adapter and
`wrangler.jsonc` as the deployment source of truth.

Useful commands:

- `npm run build` builds the Worker and static assets into `dist/`
- `npm run preview` builds and starts a local Wrangler preview
- `npm run deploy` builds, excludes the generated `_worker.js` bundle from static asset upload, and deploys the Worker
- `npm run cf-typegen` regenerates `worker-configuration.d.ts` after binding changes

Production deploys are handled by `.github/workflows/deploy.yml` after the `ci`
workflow succeeds on `main`.

Set these GitHub repository secrets before expecting deploys to run:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The Cloudflare dashboard can still manage the custom domain attachment itself.
This repo defines the Worker runtime, build settings, and deployment path.

CI lives in `.github/workflows/ci.yml` and runs install, format check, lint,
Astro checks, and the production build.
