# Kotona.app Agent Guidance

> Shared environment guidance lives in `/projects/dev/AGENTS.md`.

This is a small, read-only Astro and MDX reference site. Public content lives in
`src/content/projects/` and `src/content/notes/`; site metadata and external
links live in `src/site.ts`. Keep project context compressed, factual, and safe
for publication.

The repository itself is public. Treat every tracked file, branch, commit, and
draft pull request as published regardless of Astro's `draft` flag. Material
that is safe for private GitHub custody but outside the publication boundary
belongs in the private `kotona-notes-private` repository. Employer-specific,
personal, source-restricted, operationally sensitive, or otherwise
information-private material belongs in the private Forgejo or Obsidian tier. Do
not create cross-tier paths, submodules, symlinks, build dependencies, or
automatic promotion. Promotion requires a separate publishability review and an
explicit copy into this repository.

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

Content frontmatter, collection references, freshness, build output, and Worker
behavior are all part of that check. Run `npm run cf-typegen` only after
intentional Worker binding changes.

Browser coverage is a separate gate, because it needs a provisioned browser:

```bash
npx playwright install chromium   # once per machine
npm run test:browser
```

It covers only the seam the other suites cannot reach -- whether the Explore
page presents what the ranking decides. Run it after changing Explore, the
knowledge map, or `src/lib/reference-ranking.js`. It is deliberately absent from
`npm run validate`; add it there only once browser provisioning is reproducible
in CI.

External reachability is a weekly and manually dispatched maintenance signal,
not a publication or deployment invariant. The `external links` workflow runs
`npm run check:links`; run the same command locally when investigating its
report or substantially changing cited sources. Remote timeouts, bot policy,
`403`/`429`, and `5xx` responses are warnings rather than proof of link rot.
Treat one definitive `404` or `410` as an observation; change or remove a
citation only after the same result is confirmed on a second scheduled or manual
run. None of these remote results may block an otherwise valid site revision.

On a network that sinkholes the Cloudflare Web Analytics beacon, set
`LINK_CHECK_LOCAL_NETWORK_POLICY=1` so `check:links` reports that one declared
URL as an intentional block rather than a generic transport warning. The policy
is off by default, it covers only exactly declared URLs, and it accepts only
DNS/sinkhole-shaped failures. The scheduled workflow keeps checking the beacon
normally. Add `LINK_CHECK_SINK_ADDRESSES` if the local resolver answers with
something other than `0.0.0.0` or `::`.

`wrangler.jsonc` is the deployment source of truth. Do not deploy with Wrangler,
change Cloudflare bindings or custom domains, or expose tokens, internal paths,
or operational secrets without separate deployment authority.
