# kotona.app

Small Astro site for operated projects and reusable system notes.

The scope is intentionally narrow. This is not a portfolio product surface or a
content machine. It is a small, read-only site for compressed project context,
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
npm test
npm run check:content-freshness
npm run check
npm run build
npm run test:worker
npm run check:links
```

Or run the combined validation flow:

```bash
npm run validate
```

## Content authoring

Site metadata and public links live in `src/site.ts`.

Project pages live in `src/content/projects/`.
Project and system notes live in `src/content/notes/`.

To add a note:

1. Create a Markdown file in `src/content/notes/`.
2. Fill in the frontmatter.
3. Keep the structure terse and diagram-heavy where useful.

Frontmatter is schema-validated during `npm run check` and `npm run build`.
Note `projects` and `relates` values are collection slugs and are validated as
references during those checks.

Published project pages must also keep `lastVerified` current. The freshness
check enforces date chronology and a maximum verification age of 90 days.

Draft behavior:

- drafts render in development
- direct draft URLs return 404 in production
- drafts are excluded from production indexes, RSS, `llms.txt`, and the sitemap

## Information architecture

- `/` reader-facing introduction, a curated starting set, projects, and recent notes
- `/projects/` project index
- `/projects/[slug]/` durable project context and current state
- `/notes/` reverse chronological notes index
- `/notes/[slug]/` note detail pages
- `/about/` short context page
- `/log/` chronological site and project-state changelog
- `/rss.xml` RSS feed for published notes
- `/llms.txt` compact machine-readable site map
- `/sitemap-index.xml` XML sitemap
- `/404/` custom not found page

The old `/case-studies/` paths are compatibility redirects. Projects and notes
are the canonical content surfaces.

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

The production hostname `www.kotona.app` is declared as a Worker custom domain
in `wrangler.jsonc`. Wrangler reconciles its DNS record and certificate during
deployment. The apex `kotona.app` hostname belongs to a separate service and
must not be attached to this Worker.

CI lives in `.github/workflows/ci.yml` and runs install, format check, lint,
unit tests, project freshness and Astro checks, the production build, a local
Worker integration smoke test, and an external-link check.
