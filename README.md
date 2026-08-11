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

This repo targets Node 24 LTS.

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
npm run audit:dependencies
npm run check:content-freshness
npm run check
npm run build
npm run test:worker
npm run test:retrieval
```

Or run the combined validation flow:

```bash
npm run validate
```

Live external-link fetching is intentionally separate from publication CI. A
weekly and manually dispatched `external links` workflow reports third-party
link health without blocking a valid build or deployment. Run it locally when
investigating that report or changing cited sources:

```bash
npm run check:links
```

Timeouts, DNS failures, `403`/`429`, and `5xx` responses are warnings. Confirm a
definitive `404` or `410` in a second scheduled or manual run before changing a
citation.

On a network that sinkholes the Cloudflare Web Analytics beacon, use
`LINK_CHECK_LOCAL_NETWORK_POLICY=1 npm run check:links`.

## Content authoring

Site metadata and public links live in `src/site.ts`.

Project pages live in `src/content/projects/`.
Project and system notes live in `src/content/notes/`.

To add a note:

1. Create a Markdown file in `src/content/notes/`.
2. Fill in the frontmatter.
3. Write from the concrete problem outward, using diagrams only when they make
   a relationship easier to understand.

Frontmatter is schema-validated during `npm run check` and `npm run build`.
Note `projects` and `relates` values are collection IDs and are validated as
references during those checks.

Every note declares a role (`operating`, `synthesis`, `exploration`, or
`project-history`), a claim posture (`guiding`, `prospective`, `exploration`,
or `archival`), and a publication lifecycle (`current`,
`superseded`, `archived`, or `disproven`). Non-current notes require a dated
reason. Superseded notes also require a successor reference, and project state
that invalidated a note can be linked explicitly.

Role selects the writing register and expected evidence; claim posture and
lifecycle do not. See `docs/writing-style.md` for the four role-specific
structures and `docs/templates/post-template.md` for the authoring contract.

Every project declares a compact evidence record: current capability, concrete
proof links, supported integrations, the strongest known limitation, and the
next meaningful proof. Optional `seoTitle` and `socialTitle` fields can clarify
an editorial title outside the site without changing the visible heading.

Project-scoped `terms` add accessible definitions to the first occurrence of
internal terminology in card and project summaries. Keep each definition to one
responsibility-focused sentence.

Published notes and projects receive generated 1200×630 PNG social cards during
development and production builds. A note with an authored `hero` image uses
that image instead. Generated files live under `public/og/generated/` and are
deliberately ignored because the content metadata is their source of truth.

Published project pages must also keep `lastVerified` current. The freshness
check enforces date chronology and a maximum verification age of 90 days.

## Publication boundary

This GitHub repository is public. Only material already cleared for publication
belongs here; treat `git push` as publication even when a file is excluded from
Astro's production output. Branches, commit history, and draft pull requests are
public repository surfaces.

Non-public editorial or work material that is safe for private GitHub custody
belongs in the separate private `kotona-notes-private` repository. Employer-
specific, personal, source-restricted, operationally sensitive, or otherwise
information-private material belongs in the private Forgejo or Obsidian tier.
The public site must not depend on either tier through paths, submodules,
symlinks, build inputs, or generated references.

Promotion from a private tier is an explicit editorial copy after a separate
publishability review. There is no automatic synchronization, and a private
note marked as a possible public candidate is not authorized for publication.
Sanitization alone does not establish publishability.

Draft behavior:

- drafts render in development
- direct draft URLs return 404 in production
- drafts are excluded from production indexes, RSS, `llms.txt`, and the sitemap
- drafts are still visible in public Git history and must already be safe to
  publish

## Information architecture

- `/` reader-facing introduction, a curated starting set, projects, and recent notes
- `/projects/` project index
- `/projects/[slug]/` durable project context and current state
- `/notes/` reverse chronological notes index
- `/notes/[slug]/` note detail pages
- `/tags/` subject index
- `/tags/[tag]/` projects and notes sharing a tag
- `/about/` short context page
- `/privacy/` operational disclosure for analytics, request logs, and email
- `/version.json` deployed source revision and commit URL
- `/log/` chronological site and project-state changelog
- `/rss.xml` RSS feed for published notes
- `/llms.txt` compact machine-readable site map
- `/sitemap-index.xml` XML sitemap
- `/404/` custom not found page

The old `/case-studies/` paths are compatibility redirects. Projects and notes
are the canonical content surfaces.

The deterministic retrieval evaluation discovers those surfaces from
`llms.txt`, reads them through public Markdown negotiation, and verifies that
current authority, historical context, and absent evidence remain retrievable.
Its cases and operating limits are documented in
`docs/retrieval-evaluation.md`.

The accepted machine-first reference-discovery direction is maintained in
`docs/architecture/reference-discovery.md`; its independently reversible
delivery backlog is `docs/plans/reference-discovery.md`. These documents are
plans until their slices land, so the route list above continues to describe
current behavior.

## Deployment

This repo deploys to Cloudflare Workers using the Astro Cloudflare adapter and
`wrangler.jsonc` as the deployment source of truth.

Useful commands:

- `npm run build` builds the Worker and static assets into `dist/`
- `npm run preview` builds and starts the Cloudflare-backed Astro preview
- `npm run deploy` builds and deploys the Worker through Wrangler
- `npm run cf-typegen` regenerates `worker-configuration.d.ts` after binding changes

Production deploys are handled by `.github/workflows/deploy.yml` after the `ci`
workflow succeeds on `main`.

Set these GitHub repository secrets before expecting deploys to run:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The canonical production hostname `kotona.app` and its `www.kotona.app` alias
are declared as Worker custom domains in `wrangler.jsonc`. Wrangler reconciles
their DNS records and certificates during deployment. The Worker permanently
redirects every `www.kotona.app` request to the same path and query on
`kotona.app` with HTTP 308.

Security headers are set in Astro middleware, including a nonce-based Content
Security Policy that permits the Cloudflare Web Analytics beacon without
allowing arbitrary inline scripts.

Production builds receive the triggering commit SHA from the deploy workflow.
The revision is exposed in the footer, `/version.json`, `llms.txt`, and the
`X-Kotona-Revision` response header.

CI lives in `.github/workflows/ci.yml` and runs install, dependency audit,
format check, lint, unit tests, project freshness, Astro content and role
checks, the production build, a local Worker integration smoke test, and an
external-link check. The retrieval evaluation runs after the Worker build and
requires no external model or network access.
