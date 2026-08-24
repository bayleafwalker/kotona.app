# Reference discovery implementation plan

Status: planned  
Architecture: [`docs/architecture/reference-discovery.md`](../architecture/reference-discovery.md)

This is the maintained implementation backlog for the reference-discovery
direction. Work lands in independently reviewable and reversible slices. A slice
is complete only when its contract, tests, and documentation agree;
implementation and deployment are separate activities.

## Delivery order

### 0. Baseline and contract proof

Status: complete; receipt in
[`docs/research/2026-08-24-reference-discovery-baseline.md`](../research/2026-08-24-reference-discovery-baseline.md)

- Run `npm run validate` on the implementation branch before changing behavior.
- Record document counts and agreement among `llms.txt` and `knowledge.json`.
- Capture negotiated Markdown, Explore filtering, and prompt inclusion behavior.
- Reconcile this plan with HEAD if the source has moved from the recorded
  baseline; do not force the old file map onto changed code.

Exit: a clean validation receipt and explicit baseline observations.

### 1. Reference metadata and index

Status: complete; evidence in
[`docs/research/2026-08-24-reference-discovery-baseline.md`](../research/2026-08-24-reference-discovery-baseline.md)

- Add the optional, bounded `reference` schema to notes and projects.
- Build one allowlisted projection shared by public reference surfaces.
- Publish deterministic `/reference-index.json` with the deployed revision.
- Backfill all current projects and a limited high-value technical cohort.
- Advertise and document the new catalog without changing current page behavior.

Exit: drafts are absent; every `llms.txt` document occurs once in the index and
every indexed document occurs in `knowledge.json`; output is stable across
builds; prompt text and arbitrary frontmatter are absent.

### 2. Neutral Markdown and explicit prompts

Status: complete; evidence in
[`docs/research/2026-08-24-reference-discovery-baseline.md`](../research/2026-08-24-reference-discovery-baseline.md)

- Add explicit note and project `.md` paths backed by the existing projection.
- Migrate the catalog's Markdown representation from the negotiated form to
  `access: "direct"` on the explicit `.md` URL, retain negotiated Markdown as
  compatibility, and add the `.prompt.txt` URL to `prompt`.
- Preserve semantic boundaries in the HTML-to-Markdown conversion.
- Prepend deterministic allowlisted reference metadata.
- Remove the complete optional-prompt element before HTML-to-Markdown
  conversion.
- Add plain-text `.prompt.txt` routes only for published prompt-bearing notes.
- Advertise Markdown alternates and preserve canonical-host, draft, lifecycle,
  revision, security, query-string, and `HEAD` behavior.

Exit: explicit and negotiated Markdown are byte-identical; default Markdown has
no optional prompt; representative prompt and prompt-less routes return the
expected 200 and 404 responses without redirect loops.

Fidelity gate. Byte-identity between two representations is not sufficient if
both are lossy. The Markdown representation is the stable reference form, so a
semantic boundary in the HTML may not collapse in conversion:

- A term and its definition keep a lexical boundary. The recorded slice 0
  defect, in which `/notes/measure-the-diagnosis-not-only-the-transcript/`
  converts to `OutctlA tool that captures ...`, is the named regression case.
- Representative structured blocks -- definition lists, blockquote lifecycle
  notices, code fences, and list items -- round-trip without concatenating
  adjacent elements.

### 3. Lifecycle-aware ranked retrieval

Status: complete; evidence in
[`docs/research/2026-08-24-reference-discovery-baseline.md`](../research/2026-08-24-reference-discovery-baseline.md)

- Extract a pure browser-safe lexical ranking module.
- Replace contiguous substring search with tokenized weighted ranking.
- Add deterministic match reasons, lifecycle policy, and result diversity.
- Render a ranked list alongside the graph while retaining the no-JavaScript
  grouped index.
- Extend retrieval cases to allow both exact-rank and acceptable top-k results.

Required vague-intent coverage includes agent handover, planning-document
binding, workspace versus authority, verified migration states, and evaluation
of context or output-reduction tools.

Exit: current successors outrank predecessors by default, historical intent can
retrieve history, long queries do not require contiguous matches, and mixed
project/note top-k expectations pass deterministically.

### 4. Compact human reference actions

Status: pending; depends on slice 2

- Add a compact `Reference: Markdown · Copy · Download` row to notes and
  projects.
- Fetch the explicit `.md` representation for copy and download.
- Rename the prompt block to **Optional exploration template** and keep it
  collapsed.
- Preserve ordinary links without JavaScript and provide truthful clipboard
  failure status, keyboard access, and screen-reader labels.

Exit: copied and downloaded bytes match the public Markdown resource, controls
do not dominate the page, and failure states remain usable.

### 5. Bounded context packet

Status: deferred; not part of the initial delivery

Consider only after deterministic tests and at least three clean-session trials
show that selection quality is adequate. Any implementation remains client-side,
uses exact Markdown bytes, retains source URLs and site revision, selects no
more than four documents by default, and has no recursive expansion, POST
endpoint, or server persistence.

## Cross-cutting acceptance

Each implemented slice runs `npm run validate`. Worker coverage must include:

```text
/reference-index.json
/notes/the-ref-nobody-adds.md
/projects/vuoro.md
/notes/measure-the-diagnosis-not-only-the-transcript.prompt.txt
```

The published surfaces project one identity set. Agreement is checked as an
invariant rather than by inspecting each output on its own:

```text
llms.txt identity set = reference-index identity set = knowledge.json node set
```

The retrieval evaluation continues to exercise only public HTTP surfaces. It
must test reference-index, `llms.txt`, and graph agreement, vague top-k
selection, lifecycle interpretation, and prompt separation. Fresh-session trials
receive only a question, the site root, and ordinary web access; they do not
receive internal paths or known note titles.

Compatibility gates preserve RSS, sitemap, redirects, canonical HTML, content
negotiation, draft exclusion, revision and security headers, and the existing
graph. No slice changes Cloudflare bindings or domains, deploys with Wrangler,
or makes a private tier a source or build dependency.

## Browser coverage

`npm run test:browser` is a separate gate covering the seam between ranking and
presentation. It exists because a browser pass found two correctness defects in
shipped behaviour that the unit tests, the worker checks, and the retrieval
evaluation all missed: the map filtered by contiguous substring while the ranked
list ranked, and the ranked list ignored the Show controls.

It stays out of `npm run validate` until browser provisioning is reproducible in
CI. Coverage is deliberately four cases -- natural-language ranking driving
every representation, a query that ranks nothing leaving the page usable, filter
composition, and the banded succession result -- because ranking policy is
already proven by unit tests and the retrieval evaluation. The overlap in the
third case is intentional: the unit test proves the policy, and the browser test
proves the page presents its result.

## Post-deployment evaluation

These are standing evidence loops around the protocol, not implementation
slices. Neither gates a revision and neither belongs in `npm run validate`: both
depend on external systems and on time, so a poor result is a trend signal
rather than a defect. Run them after slices 0 through 3 are deployed.

Their purpose is to separate two questions the internal tests cannot tell apart:

```text
Internal retrieval   Does the site itself select the right reference?
External visibility  Given only the public web, does an outside system find
                     this site and choose the right reference from it?
```

### A. External retrieval corpus

Status: instrument frozen 2026-08-24 in
[`docs/external-retrieval-questions.json`](../external-retrieval-questions.json),
method in
[`docs/external-retrieval-evaluation.md`](../external-retrieval-evaluation.md).
Eighteen questions; no run recorded yet.

Freeze 15 to 20 natural-language questions in source control, spanning:

- an exact distinctive concept;
- the same concept paraphrased;
- vague domain intent;
- current-versus-historical authority;
- a query this site should probably not dominate;
- a project current-state lookup.

Record per question and run: date, provider or retrieval system, whether the
site surfaced, rank or prominence where observable, the selected URL, whether it
was the correct document, whether lifecycle was respected, whether a citation or
link was present, and notes.

Do not optimize against individual misses. A control question that this site
correctly fails to dominate is a working result, not a gap. This complements the
fresh-session trials described above, which already start from only a question,
the site root, and ordinary web access.

### B. Machine-surface analytics

Status: instrument chosen 2026-08-24; findings in
[`docs/research/2026-08-24-machine-surface-observability.md`](../research/2026-08-24-machine-surface-observability.md).
Zone-level GraphQL analytics is the instrument, because half the surfaces are
static assets that never invoke the Worker. Workers Logs, already enabled and
persisted, covers the high-intent half and is labelled reference-consumption
telemetry rather than total machine traffic. Routing static assets through the
Worker to make them countable is rejected: observability adapts to the serving
architecture, not the reverse.

The question is narrow: are agents actually walking the discovery paths this
architecture publishes? Browser-side page analytics cannot answer it, because
agent retrieval usually runs no JavaScript. Measurement therefore belongs at the
CDN request layer, which sees every request, rather than only at the Worker,
which sees only the routes it serves.

Surfaces worth counting:

```text
/llms.txt
/reference-index.json
/knowledge.json
/.well-known/agent-skills/*
/notes/<slug>.md and /projects/<slug>.md
/notes/<slug>.prompt.txt
HTML requests carrying Accept: text/markdown
```

Retain only the dimensions that answer the question: requests by surface, status
class, bot or client family where identifiable, direct Markdown versus
negotiated Markdown, and aggregate correlation between a discovery index and
subsequent content paths where that is feasible.

This is deliberately not per-client behavioral measurement. Raw addresses, full
user-agent strings, query strings, and reconstructed per-client journeys are out
of scope. Aggregate machine consumption answers the question and keeps the
privacy posture the site already publishes.

## Sequencing

1. Slices 0 through 3: complete and validated locally.
2. Independent review of the branch.
3. Deploy slices 0 through 3 once they are independently healthy. Slice 4 does
   not change the machine contract and is not a prerequisite for it.
4. Establish the external retrieval baseline and begin machine-surface
   measurement.
5. Slice 4 as human ergonomics.
6. Revisit metadata coverage, embeddings, or a search service only from an
   observed retrieval failure, under the evidence gates already stated.

## Plan maintenance

Update status here when a slice lands and link the implementation evidence. The
post-deployment loops are maintained the same way: record each run's evidence
rather than rewriting the frozen questions to match a better outcome. Change the
architecture document when direction or a public contract changes; do not
quietly rewrite this backlog around an incompatible implementation. Deferred
capabilities require their stated evidence gate and, where they add a service or
authority boundary, a separate architecture decision.
