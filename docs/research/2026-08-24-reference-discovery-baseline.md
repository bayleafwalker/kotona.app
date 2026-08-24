# Reference discovery baseline (slice 0)

Date: 2026-08-24  
Branch: `reference-discovery-slice-1`  
Baseline commit: `ab0f2b1`  
Plan: [`docs/plans/reference-discovery.md`](../plans/reference-discovery.md)

This is the contract proof required before slice 1 changes behavior. It records
what the published surfaces do today so a later slice can be shown not to have
altered them by accident.

## Validation receipt

`npm run validate` completed successfully on the baseline tree. Notable stages:

- Worker smoke: all production checks passed, including explore-prompt
  rendering, Markdown negotiation, `GET`/`HEAD` negotiation, security headers,
  canonical trailing-slash policy, and discovery endpoints.
- Retrieval evaluation: 59 documents loaded through public Markdown responses;
  all 6 cases passed at rank 1.

## Document counts and surface agreement

| Measure                        | Value                     |
| ------------------------------ | ------------------------- |
| Projects in `llms.txt`         | 5                         |
| Notes in `llms.txt`            | 54                        |
| Vocabulary terms in `llms.txt` | 18                        |
| Nodes in `knowledge.json`      | 59 (54 notes, 5 projects) |
| Edges in `knowledge.json`      | 211                       |
| Published drafts               | 0                         |

Agreement is exact in both directions: every `llms.txt` document href occurs as
a `knowledge.json` node, and every `knowledge.json` note or project href occurs
in `llms.txt`. This is the invariant slice 1's index must preserve.

## Current negotiation and prompt behavior

Observed against `astro preview` on the built output:

| Request                           | Result                             |
| --------------------------------- | ---------------------------------- |
| Note URL, `Accept: text/html`     | `200 text/html`                    |
| Note URL, `Accept: text/markdown` | `200 text/markdown; charset=utf-8` |
| `/notes/<slug>.md`                | `404`                              |
| `/projects/<slug>.md`             | `404`                              |
| `/notes/<slug>.prompt.txt`        | `404`                              |
| `/reference-index.json`           | `404`                              |

Confirmed gaps that the accepted architecture closes:

- Negotiated Markdown still contains the "Explore this note with AI" prompt. All
  54 published notes carry `explorePrompt`; no project does.
- Content pages emit no `Link` headers. Markdown alternates and the reference
  catalog are advertised only from the homepage, so an arbitrary content page
  relies on the client already knowing to try content negotiation.

## Incidental observation, not in slice 1 scope

Negotiated Markdown renders a note's inline term definitions without a
separator, producing concatenated text such as `OutctlA tool that captures ...`
where HTML shows the term and its definition as distinct elements. The
conversion is lossy for the terms block specifically. Slice 2 rebuilds the
Markdown prelude and body handling and is the right place to fix this; it is
recorded here so it is not mistaken for a regression introduced later.

## Slice 1 result

Landed on the same branch: an optional bounded `reference` scope on both
collections, the shared allowlisted projection in `src/lib/reference-index.ts`,
and `/reference-index.json`.

- 59 documents published, matching the baseline count exactly; drafts absent.
- 15 documents carry reference scope: all 5 projects and a 10-note technical
  cohort covering agent handover and authority, planning-document binding,
  workspace versus authority, verified migration and rollback states, and the
  evaluation of context or output-reduction tools.
- 54 documents report `prompt.available`; no prompt text occurs in the catalog.
- Two consecutive builds produced byte-identical output.
- `npm run validate` passed, including the new worker check
  `reference catalog and its advertisement` and 9 new projection unit tests.

The catalog declares HTML as `access: "direct"` and Markdown as
`access: "content-negotiation"` with `accept: "text/markdown"`, which is what
the site actually serves today; a worker check fetches the sampled document
using exactly the declared header. Slice 2 migrates that entry to
`access: "direct"` on the explicit `.md` URL and adds the `.prompt.txt` URL, so
the catalog describes a live transport at every point rather than announcing a
route that does not exist yet.

## Slice 2 result

Explicit Markdown resources, separated prompts, and the fidelity gate landed on
the same branch.

Byte-identity is structural rather than agreed. Middleware resolves
`/notes/<slug>.md` by rewriting to the canonical page and passing the resulting
HTML to `renderReferenceMarkdown`; the negotiated path calls the same function
on the same HTML. There is one renderer, so the two delivery paths cannot drift.

| Request                           | Result                                                  |
| --------------------------------- | ------------------------------------------------------- |
| `/notes/<slug>.md`                | `200 text/markdown`, byte-identical to negotiated       |
| Note URL, `Accept: text/markdown` | `200 text/markdown`                                     |
| `/notes/<slug>.prompt.txt`        | `200 text/plain` with source, lifecycle, revision       |
| `/projects/<slug>.prompt.txt`     | `404 text/plain` (no project publishes a prompt)        |
| `/notes/does-not-exist.md`        | `404 text/plain`, indistinguishable from a draft        |
| `/notes/Not_A_Slug.md`            | ordinary `404`; malformed slugs are not reference paths |
| `HEAD` on any of the above        | same status, content type, and `Link`; no body          |

Contract details:

- The prompt is removed as a complete `<details class="explore-prompt">` element
  before conversion runs, so a paragraph that merely mentions the prompt's label
  survives. A unit test asserts exactly that.
- Each Markdown resource carries `Link: <canonical HTML>; rel="canonical"`, and
  each content page advertises its Markdown alternate, its prompt alternate when
  one exists, and the reference catalog.
- The catalog now publishes the direct `.md` URL and retains negotiation as
  compatibility, plus the prompt resource URL. The worker check drives every one
  of those from the index itself rather than from a hard-coded route.

Fidelity gate. The slice 0 defect is fixed at its source: the inline term
tooltip duplicates a definition the page already publishes as a definition list,
and adjacent inline elements carry no whitespace, so the tooltip is dropped and
the definition list converts to paired `- **Term** -- definition` entries.
`OutctlA tool that captures ...` is now a named regression case in the worker
suite, alongside assertions that code fences, lifecycle blockquotes, and list
items do not concatenate.

`npm run validate` passed: 96 unit tests, 12 worker checks, 6 retrieval cases.
The retrieval evaluation now also asserts the three-surface identity invariant
and prompt separation, checking that the neutral representation excludes the
prompt while the prompt resource carries it with lifecycle context.
