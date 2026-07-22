# Kotona.app Agent Guidance

> Shared environment guidance lives in `/projects/dev/AGENTS.md`.

This is a small, read-only Astro and MDX reference site. Public content lives
in `src/content/projects/` and `src/content/notes/`; site metadata and external
links live in `src/site.ts`. Keep project context compressed, factual, and safe
for publication.

Every note must declare a content `role` in frontmatter. Role selects the
register (`operating`, `synthesis`, `exploration`, or `project-history`); it is
separate from claim posture and lifecycle. Read `docs/writing-style.md` and use
`docs/templates/post-template.md` when adding or substantially revising notes.
Use lifecycle succession for replaced reasoning instead of deleting its public
history or leaving a former framing on a discovery surface.

Use Node 24 and validate ordinary changes with:

```bash
npm run validate
```

Content frontmatter, collection references, freshness, build output, Worker
behavior, and external links are all part of that check. Run `npm run
cf-typegen` only after intentional Worker binding changes.

`wrangler.jsonc` is the deployment source of truth. Do not deploy with Wrangler,
change Cloudflare bindings or custom domains, or expose tokens, internal paths,
or operational secrets without separate deployment authority.
