# Reference discovery architecture

Status: accepted direction, not yet implemented  
Accepted: 2026-08-10  
Source baseline: `6c610a4627bd71dd2781e94d0a998db1b958e900`

This document is the repository authority for the intended public reference
discovery architecture. It incorporates the publication-safe design handoff
identified by SHA-256
`2745a8530fc225fb91c1ee2d85e2c3b334de35f7d75a9ecc95d9f011b83514f3`. Repository
policy, current source, and tests remain authoritative when an implementation
detail in the handoff no longer fits.

## Outcome and boundary

A fresh session given only `https://kotona.app` and a vague relevant question
should be able to discover useful public projects and notes, distinguish their
role and lifecycle, retrieve stable Markdown, and understand the scope of the
claims it carries. Reference content does not gain authority over the receiving
session's task, policy, repository state, permissions, or acceptance criteria.

The site remains public, read-only, cacheable, and account-free. The design does
not add authentication, protected resources, a general API, an MCP server,
embeddings, a vector database, or server-side context assembly. Those require a
new measured need and a separate architecture decision.

## Public protocol

HTML remains canonical. The planned static protocol adds ordinary GET resources:

```text
/llms.txt
/reference-index.json
/knowledge.json
/notes/<slug>.md
/projects/<slug>.md
/notes/<slug>.prompt.txt   # only when the published note has a prompt
```

`knowledge.json` continues to describe topology and declared relationships.
`reference-index.json` is a separate, flattened catalog for selection, scope,
representations, and retrieval fields. Combining them would couple graph and
retrieval contracts unnecessarily.

Explicit `.md` paths and negotiated Markdown must return the same bytes. They
are generated from the published representation with an allowlisted metadata
prelude; raw source frontmatter and repository paths are never exposed. HTML
URLs remain canonical, and draft, lifecycle, canonical-host, revision, and
security behavior remain intact.

Content pages advertise their Markdown alternate and the reference catalog with
HTTP `Link` metadata. Machine paths are the primary contract. Human copy and
download controls fetch the same Markdown bytes rather than rebuilding them.

## Reference scope

Notes and projects gain an optional declarative `reference` sidecar:

```yaml
reference:
  purpose: design-rationale
  discoverFor:
    - handing work from one agent session to another
  establishes:
    - why references must appear on the path an agent actually walks
  doesNotEstablish:
    - current repository or runtime state
  supplementWith:
    - current task evidence and acceptance criteria
```

`purpose` is one of `current-project-orientation`, `operating-guidance`,
`design-rationale`, `evaluation-method`, `historical-evidence`, or
`exploratory-hypothesis`. The fields describe capability and claim boundaries;
they must not contain instructions that purport to override a receiving agent.
The sidecar starts optional and is backfilled for current projects and a small,
high-value technical cohort before broader editorial adoption.

The public index is an allowlisted deterministic projection, ordered by type and
ID. It includes the deployed site revision, public identity and classification,
reference scope when present, HTML and Markdown representations, and prompt
availability without prompt text. Project evidence remains bounded by
`lastVerified`.

## Prompt separation

`explorePrompt` remains an optional editorial artifact, but it is not part of
the neutral default Markdown reference. HTML may show it in a collapsed
**Optional exploration template** block. An explicit `.prompt.txt` resource is
available only when deliberately requested and precedes the prompt with source,
lifecycle, and revision context.

This separation prevents portable task language from being mistaken for source
authority while preserving the existing editorial capability. Prompt routes must
return 404 for unpublished, draft, or prompt-less notes.

## Retrieval policy

Retrieval remains deterministic and local. A shared browser-safe implementation
tokenizes queries, applies a small stop-word set, scores weighted fields,
applies lifecycle and type policy, diversifies top results, and exposes stable
match reasons. Curated `reference.discoverFor` phrases receive the strongest
boost; titles remain strong.

For equal lexical relevance, current project evidence and current operating or
synthesis notes precede current explorations, historical material, and
superseded or disproven notes. This is a discovery safety policy, not a
universal truth ranking.

Two explicit intents read from the query's raw words may override the default
preference. Historical intent -- `previously`, `originally`, `superseded` and
similar -- reverses the preference for current material. Project intent, which
is only the words `project` and `projects`, raises current project pages,
because a reader asking which project owns something wants the evidence page
rather than the notes reasoning about ownership. Both are deliberately narrow:
they decide what leads, and everything stays retrievable either way. The
vocabulary the whole corpus shares -- `owns`, `authority`, `state` -- is
excluded from both, since a broad note matching many such ordinary words can
otherwise outrank the document that actually answers the question.

The Explore graph remains a relationship interface and keeps its complete
no-JavaScript index. Ranked search is also rendered as a readable list so graph
position is never mistaken for relevance.

The corpus embedded in the page is metadata plus each document's distinctive
prose terms: the tokens it uses that few other documents use, minus the ones its
own scored metadata already carries. Whole bodies stay out of the page -- a
machine client retrieves those from the `.md` resources -- but a reader who
searches a term a document discusses and never names in its title, summary,
area, tags, or curated scope now reaches it. Metadata alone left such a query
with an empty map and an empty ranked list beside a grouped index that claimed
to be complete.

Prose is recall underneath the curated ranking, never a re-pricing of it. It
carries the lowest field weight, and term rarity is measured twice: curated
fields are priced among curated fields, while a prose match is priced against
the whole corpus. Pricing both over everything is what re-ranks authority --
measured that way, a note lost its lead because the term its author declared it
discoverable for had grown common in other documents' prose. A worker check
holds the invariant directly: for every question the retrieval evaluation asks,
the page's leading three results must be the ones curated metadata alone
produces.

Retrieval quality beyond that is asserted as properties, not golden rankings.
`tests/explore-probes.json` holds probes by class -- prose-only terms,
technology names, multi-token prose, metadata leaders, common vocabulary, and
known limitations -- each asserting that an expected document ranks within a
window, that a query returns enough or few enough results, or that curated
leaders did not move. Known limitations are fixtures too: `wardley mapping` is
the first recorded phrase-level miss, where a document-frequency filter cannot
know that two words are one concept. That class is answered by distinctive
adjacent phrases if it earns the complexity, not by widening the term cutoff.

Embeddings are reconsidered only after vague-intent top-k evaluation and fresh
sessions demonstrate a material recall failure that curated metadata and lexical
ranking cannot correct. A search API or MCP adapter is reconsidered only when
the complete index becomes materially expensive, clients need server-side
ranking, protected resources appear, or static discovery measurably fails.

## Compatibility and reversibility

- `knowledge.json`, `llms.txt`, negotiated Markdown, and canonical HTML remain.
- The reference sidecar begins optional.
- Explicit Markdown routing can be disabled without removing negotiation.
- Ranked Explore search can roll back while the machine index remains useful.
- Human controls can be removed without changing the protocol.
- A later client-side context packet is capped, non-persistent, and separately
  gated; it is not part of the accepted initial implementation.

No part of this architecture authorizes a Wrangler deployment, binding change,
custom-domain change, or publication of non-public material.
