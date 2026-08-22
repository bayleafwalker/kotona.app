# Reference discovery implementation plan

Status: planned  
Architecture: [`docs/architecture/reference-discovery.md`](../architecture/reference-discovery.md)

This is the maintained implementation backlog for the reference-discovery
direction. Work lands in independently reviewable and reversible slices. A slice
is complete only when its contract, tests, and documentation agree;
implementation and deployment are separate activities.

## Delivery order

### 0. Baseline and contract proof

Status: pending

- Run `npm run validate` on the implementation branch before changing behavior.
- Record document counts and agreement among `llms.txt` and `knowledge.json`.
- Capture negotiated Markdown, Explore filtering, and prompt inclusion behavior.
- Reconcile this plan with HEAD if the source has moved from the recorded
  baseline; do not force the old file map onto changed code.

Exit: a clean validation receipt and explicit baseline observations.

### 1. Reference metadata and index

Status: pending

- Add the optional, bounded `reference` schema to notes and projects.
- Build one allowlisted projection shared by public reference surfaces.
- Publish deterministic `/reference-index.json` with the deployed revision.
- Backfill all current projects and a limited high-value technical cohort.
- Advertise and document the new catalog without changing current page behavior.

Exit: drafts are absent; every `llms.txt` document occurs once in the index and
every indexed document occurs in `knowledge.json`; output is stable across
builds; prompt text and arbitrary frontmatter are absent.

### 2. Neutral Markdown and explicit prompts

Status: pending; depends on slice 1

- Add explicit note and project `.md` paths backed by the existing projection.
- Prepend deterministic allowlisted reference metadata.
- Remove the complete optional-prompt element before HTML-to-Markdown
  conversion.
- Add plain-text `.prompt.txt` routes only for published prompt-bearing notes.
- Advertise Markdown alternates and preserve canonical-host, draft, lifecycle,
  revision, security, query-string, and `HEAD` behavior.

Exit: explicit and negotiated Markdown are byte-identical; default Markdown has
no optional prompt; representative prompt and prompt-less routes return the
expected 200 and 404 responses without redirect loops.

### 3. Lifecycle-aware ranked retrieval

Status: pending; depends on slice 1

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

The retrieval evaluation continues to exercise only public HTTP surfaces. It
must test reference-index, `llms.txt`, and graph agreement, vague top-k
selection, lifecycle interpretation, and prompt separation. Fresh-session trials
receive only a question, the site root, and ordinary web access; they do not
receive internal paths or known note titles.

Compatibility gates preserve RSS, sitemap, redirects, canonical HTML, content
negotiation, draft exclusion, revision and security headers, and the existing
graph. No slice changes Cloudflare bindings or domains, deploys with Wrangler,
or makes a private tier a source or build dependency.

## Plan maintenance

Update status here when a slice lands and link the implementation evidence.
Change the architecture document when direction or a public contract changes; do
not quietly rewrite this backlog around an incompatible implementation. Deferred
capabilities require their stated evidence gate and, where they add a service or
authority boundary, a separate architecture decision.
