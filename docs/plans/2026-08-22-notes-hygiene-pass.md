# Notes hygiene pass — plan for implementation

Date: 2026-08-22. Source: corpus assessment of all 53 published notes. Executor:
an agent session (Opus). Repo: `kotona.app`, branch from `main`.

## Ground rules

- Content lives in `src/content/notes/*.md`. Schema in `src/content.config.ts`.
  Lifecycle invariants in `src/lib/note-lifecycle.js` (tests in
  `tests/note-lifecycle.test.mjs`). Style rules in `docs/writing-style.md`;
  explore-prompt rules in `docs/explore-prompts.md`.
- Every step below is a separate commit. Do not mix a schema change with prose
  edits in one commit.
- Bump `lastRevised` only on a semantic revision of the note body
  (`docs/explore-prompts.md` "Maintenance after revision"). Reflowing
  paragraphs, fixing typos, or adding `terms`/`explorePrompt` does **not** bump
  it.
- Do not rewrite voice. This is a hygiene pass. If a step tempts you to
  "improve" an argument, stop and leave a TODO in the commit message instead.
- Run the full test suite (`npm test` or whatever `package.json` defines — check
  it first) after every step. Lifecycle and explore-prompt tests are the ones
  most likely to bite.
- Steps are ordered so that earlier ones do not invalidate later ones. Steps 7
  and 3 are mechanical and safe to do first; step 1 is the only one that needs
  editorial judgment and operator review before merge.

---

## Step 7 — Copy defects (do first; trivial)

1. `a-personal-knowledge-system-that-happens-to-render-as-a-website.md`: "an
   real but modest number" → "a real but modest number".
2. `a-merged-pr-is-not-an-architectural-decision.md`: one paragraph in the
   section "The second review has no merge event" has an unwrapped line (starts
   "a date can all trigger it. What it cannot have is a merge event…"). Reflow
   to the 80-col wrap used by the rest of the file.
3. `judge-agents-by-the-next-prompt.md`: the August update banner says the note
   is superseded, but the table under "How I route the work now" ("Principal
   analyst | GPT-5.6 Sol …") still reads as live routing guidance. Add one
   sentence directly above that table: "The assignments below are the July 2026
   snapshot and are not maintained." Do not delete the table — it is the
   historical record. No `lastRevised` bump (clarification, not revision).

Commit: `notes: fix copy defects from 2026-08-22 assessment`.

---

## Step 3 — Paragraph-style drift (mechanical)

Goal: one wrapping convention across the corpus. Rendering is unchanged; this is
about diff hygiene and editing rhythm.

1. Establish the convention: hard-wrap prose at 80 columns (the majority style).
   Tables, code fences, URLs, and frontmatter scalars are exempt.
2. Reflow the unwrapped-long-paragraph notes (all June/July, one-line-per-
   paragraph source): `layering-you-cant-violate-by-accident`,
   `subprocess-not-service`, `the-aftertaste-of-resolution`,
   `the-ref-nobody-adds`, `the-workshop-is-learning-my-accent`,
   `moving-a-live-cluster-to-a-new-subnet`, `nfc-tokens-pointing-at-a-manifest`,
   `why-i-publish-explore-prompts`,
   `a-personal-knowledge-system-that-happens-to-render-as-a-website`,
   `judge-agents-by-the-next-prompt`, `the-candidate-produced-somewhere-else`,
   `where-the-cohort-comes-from`,
   `where-the-assurance-questions-are-already-answered`,
   `the-queue-was-never-the-hard-part`, `governance-for-a-team-of-one`. Verify
   with `awk 'length>80' file | grep -v http` that only exempt lines remain.
3. `the-human-is-in-the-slow-loop.md` is the opposite problem: 119 of 229
   paragraphs are single sentences. **Do not** mechanically merge them. Do a
   light editorial pass that joins one-line paragraphs only where they form a
   single thought (typically 2–4 consecutive one-liners). Keep standalone
   one-liners where they are deliberate emphasis (e.g. "The loops are
   coupled."). Target: roughly halve the paragraph count. This is the only
   semantic-adjacent edit in this step; bump `lastRevised` for this file only.
4. Check whether prettier touches `.md` under the current config
   (`prettier.config.mjs` only loads the astro plugin). If prose wrapping can be
   enforced by `proseWrap: "always"` + `printWidth: 80` without reflowing tables
   badly, add it and document in `docs/writing-style.md` "Shared checks". If it
   damages tables, do not add it; record the convention in the style doc
   instead.

Commit(s): `notes: normalize paragraph wrapping` and, separately,
`notes: consolidate one-line paragraphs in slow-loop note`.

---

## Step 5 — Exercise `lifecycle: disproven`

1. `measure-the-diagnosis-not-only-the-transcript.md`: currently
   `lifecycle: superseded`, `supersededBy: [a-platform-capability-…]`. The
   assessment's reading: the note's _product_ recommendation ("Outctl should
   continue as the context-management layer") was falsified by native PTC, while
   its evaluation findings stand. `a-platform-capability…` itself defines
   "Disproven: when the underlying claim failed against evidence" and
   "Superseded: … a newer capability or conclusion now owns the current
   guidance." Both readings are defensible. **Decision rule:** the note's own
   headline claim was "What outctl has earned … The project should continue."
   That claim failed against evidence → `disproven`.
2. Before changing it, read `src/lib/note-lifecycle.js` and
   `tests/note-lifecycle.test.mjs`: `disproven` has no `supersededBy`
   requirement, and `current` forbids invalidation metadata. Confirm the
   knowledge-graph, atlas, llms.txt and explore-prompt renderers handle
   `disproven` (grep `disproven` under `src/`). If any renderer has a
   `superseded || archived` branch that silently drops `disproven`, fix the
   renderer first and add a test case.
3. Change the note: `lifecycle: disproven`, keep `lifecycleChanged`, rewrite
   `lifecycleReason` to say which claim was disproven and which findings
   survive. Keep a pointer to the successor — if the schema only allows
   `supersededBy` on superseded notes, put the link in `lifecycleReason` and in
   the existing update banner at the top of the body. Update the banner wording
   from "superseded" to "disproven" and keep the one-line statement that the
   measurements remain valid.
4. Update the note's `explorePrompt` (if present) per `docs/explore-prompts.md`
   "Lifecycle": it must state the note is disproven before anything else.
5. Update `a-platform-capability-does-not-exist-all-at-once.md` where it says
   "[Measure the diagnosis…] should become superseded" → "has been marked
   disproven: its mechanism findings stand, its product recommendation did not."
   This is a one-line factual update; no `lastRevised` bump needed unless you
   judge it semantic.
6. Add a test assertion (in `tests/note-lifecycle.test.mjs` or
   `tests/knowledge-graph.test.mjs`) that at least one note in each lifecycle
   state renders correctly, so the fourth state cannot silently rot again.

Commit:
`notes: mark Outctl evaluation note disproven; cover all lifecycle states`.

---

## Step 4 — Private vocabulary: `terms` on notes

Goal: a first-time reader meets a definition on the page where the term first
appears. Mechanism already exists for projects (`terms: [{term, definition}]`,
rendered by `src/components/AnnotatedText.astro` via `EntryCard`).

1. Schema: add `terms` (same shape as `sharedProjectSchema.terms`, default `[]`)
   to the notes collection in `src/content.config.ts`.
2. Rendering: find where a note body/summary is rendered (`src/pages/notes/…`)
   and where `EntryCard` is used for notes. Pass `terms` through so the same
   annotation appears on note pages and cards. Check the Markdown-negotiated
   response (`tests/markdown-response.test.mjs`) and `llms.txt`: decide whether
   terms are emitted there as a short "Terms:" list after the summary
   (recommended — agents are the readers who most need it) and add a test.
3. Write definitions once, in `docs/glossary.md` (new), ≤240 chars each to
   satisfy the schema limit. Seed list, grouped:
   - Local systems: Vuoro, sprintctl, actionq / ActionQ, actionq-dispatcher,
     auditctl, Outctl, Acceptance Lab, agent-cockpit, homelab-analytics,
     Appservice.
   - Site concepts: artifact of record, derived realization, generative closure,
     verification closure, access cell, action envelope, settlement boundary,
     next-prompt test, person of record, legibility (as used here),
     materialization instance, explorePrompt. Definitions must be one sentence,
     concrete, and not circular. Write them from the notes' own usage; do not
     invent scope.
4. Apply: for each note, add `terms` entries for the local-system names and site
   concepts that appear in that note **and** are not defined in its body. Use
   `grep -l` per term to build the list; review each hit, since some notes
   define the term inline (e.g. `derived-status-is-earned` defines artifact of
   record / derived realization and should not carry those as terms). Cap at ~6
   terms per note; if a note needs more, that is a signal for step 1, not a
   reason for a longer list.
5. Link the glossary from `docs/writing-style.md` and add a "Shared checks"
   line: a note that introduces a local system name or site-specific concept
   either defines it in the body or carries it in `terms`.
6. Optional, only if cheap: a `/glossary` page generated from the union of all
   `terms`. Do not hand-maintain a second list — generate it, or skip it.

Commits: `content: add terms to note schema and renderers`, then
`notes: add term definitions` (content only).

---

## Step 6 — explorePrompt coverage

Current: 23 of 53. Policy (`why-i-publish-explore-prompts`,
`docs/explore-prompts.md`): every editorially finished note carries one,
generated post-hoc, validated as a sibling-not-clone.

1. Inventory: `grep -L '^explorePrompt:' src/content/notes/*.md` → 30 files.
2. Prioritize in this order (the assessment's strongest notes first, then by
   role): `the-wallpaper-is-a-build-artifact`,
   `the-candidate-passed-the-upgrade-did-not`,
   `the-node-remembers-what-git-does-not`, `the-queue-was-never-the-hard-part`,
   `a-platform-capability-does-not-exist-all-at-once`,
   `what-107-isolated-completions-did-not-show`, then remaining `operating` and
   `synthesis` notes, then `exploration`, then `project-history`.
3. For non-current notes (superseded/archived/disproven), the prompt must open
   with the lifecycle statement and successor pointer. Do these last; they are
   lowest value.
4. Process per note, per `docs/explore-prompts.md`: draft from the finished note
   only; run the sibling validation in a clean context against a scenario
   sharing the problem but not the constraints; if clean-context execution is
   unavailable, do the rubric review and say so in the commit message. 80–2400
   chars. One `>-` scalar, no sub-fields.
5. Do **not** bump `lastRevised` for adding a prompt.
6. Batch commits of ~5 notes: `notes: add explore prompts (batch N)`. Run
   `tests/explore-prompts.test.mjs` after each batch.
7. Stop condition: all current notes covered. Report any note where a
   sibling-valid prompt could not be produced — that is evidence the note's
   conclusion is not transferable, which is worth knowing and should be listed
   in the final report rather than forced.

---

## Step 2 — The closing template

Facts: `docs/writing-style.md` requires exploration notes to "end with current
confidence or the next test." So the triplet is policy, not accident. The
problem is the near-verbatim form in five August notes:
`a-platform-capability…`, `measure-the-diagnosis…`,
`the-next-prompt-was-only-the-visible-error`, `the-platform-can-retrieve…`,
`what-107-isolated-completions…`.

1. Amend `docs/writing-style.md` → Exploration register: keep the requirement;
   add: "State confidence only for claims whose confidence genuinely differs;
   one tier is fine. Vary the form — a sentence, a short list, or a single named
   test. Do not use the fixed 'high / moderate / low' triplet as a closing
   formula."
2. Edit the five notes. Rule per note: keep every tier that carries distinct
   information; fold the rest into prose; keep "the next test" wherever it names
   a concrete, runnable test. Suggested outcomes:
   - `a-platform-capability…`: the three tiers are genuinely different (hot-path
     invalidated / durable evidence open / Outctl vs runner). Keep the content,
     but rewrite as two sentences rather than the labelled triplet; keep the
     final "That would be a successful result." ending.
   - `measure-the-diagnosis…`: now disproven (step 5). Confidence statement is
     historical; leave it, since the note is a record.
   - `the-next-prompt…`: three tiers are distinct; keep but reword so it does
     not mirror the one above. Keep the "next test is narrow" sentence — it is
     the note's strongest concrete commitment.
   - `the-platform-can-retrieve…`: "high / moderate / deliberately low" — fold
     into one sentence; the section "What would change this allocation" already
     does the job.
   - `what-107…`: "low in the strong claim, moderate in the working model" — two
     tiers, keep as one sentence; the "Next discriminating tests" list is
     already the next-test content.
3. These are semantic edits to the ending: bump `lastRevised`; review each
   note's `explorePrompt` for the same reason (the prompt may quote the
   confidence line).

Commit: `notes: vary exploration-note closings; amend style guide`.

---

## Step 1 — Redundancy in the action-envelope cluster (needs operator review)

Facts. The envelope idea (intent → permission → attempt → receipt →
reconciliation; location is access, not authority) is restated in:

| Note                                                       | Lifecycle  | Role        | Holds the idea as                                           |
| ---------------------------------------------------------- | ---------- | ----------- | ----------------------------------------------------------- |
| `the-deployment-boundary-was-only-a-place`                 | superseded | exploration | origin                                                      |
| `the-devbox-is-an-access-cell`                             | superseded | exploration | origin (location half)                                      |
| `authority-must-travel-with-the-action`                    | current    | synthesis   | **declared merge of the two above**                         |
| `the-agent-is-not-the-application`                         | current    | synthesis   | application-side framing                                    |
| `legibility-is-an-operating-property`                      | current    | synthesis   | five-fact join (intent/permission/action/result/correction) |
| `the-person-of-record`                                     | current    | exploration | accountability side                                         |
| `a-project-folder-is-a-view-not-an-authority`              | current    | operating   | applied to workspaces                                       |
| `why-production-access-changes-the-shape-of-agent-tooling` | current    | synthesis   | applied to harness binding                                  |

Decision: **do not merge notes.** `authority-must-travel…` already is the
canonical statement (540 words, declared synthesis of the two superseded notes).
The fix is to make the other five _point_ to it and delete the paragraphs that
restate it, keeping only what each note adds.

1. Designate `authority-must-travel-with-the-action` as canonical for the
   envelope. Add a one-line note in its body: "Other notes link here rather than
   restating the envelope." Ensure its `relates` lists all five downstream
   notes.
2. For each of the five current notes, do a paragraph-level diff against the
   canonical note. Mark each paragraph as (a) restates the envelope, (b) applies
   it to this note's subject, (c) unrelated. Replace every (a) paragraph with
   **one sentence** that names the idea and links to the canonical note, placed
   where the first (a) paragraph was. Keep all (b) and (c). Expected deltas:
   - `the-agent-is-not-the-application`: "Give tools narrow permission" and the
     receipt sentence restate; keep the context-compilation and
     organizational-memory sections (those are this note's contribution).
   - `legibility-is-an-operating-property`: the five-fact list is this note's
     own framing and stays; the paragraph on governed tools recording
     "permission, target, request, immediate response, and later observed state"
     restates → link.
   - `the-person-of-record`: mostly (b)/(c); likely one sentence to link.
   - `a-project-folder-is-a-view…`: already links once ("This is the same
     distinction described more generally in…"); check the lease/claim section
     for a second restatement.
   - `why-production-access…`: the "Authority context" paragraph already links;
     the "PTC owns the hot path" section repeats "the runner or application
     still owns credentials, target scope, permissions, approvals, and execution
     receipts" nearly verbatim from `a-platform-capability…` — that is a second
     redundancy pair (platform-capability ↔ production-access); trim one side,
     preferably production-access, since platform-capability is the dated
     record.
3. Produce a before/after word count per note in the commit message. Target: the
   five notes lose 10–25% of their length; none loses a section heading.
4. Update `relates` so every trimmed note lists the canonical note, and the
   knowledge graph tests (`tests/knowledge-graph.test.mjs`) still pass.
5. Semantic edits → bump `lastRevised` on every touched note; review each
   `explorePrompt`.
6. **Open a PR for this step alone and stop.** The operator reviews the diffs
   before merge; trimming published argument is not something to self-approve.
   Include in the PR body the paragraph classification table from 2.

Commit: `notes: make action-envelope cluster point to canonical note`.

---

## Final report

When done, report: per step, files touched, tests run and their result,
`lastRevised` bumps made, and anything skipped with the reason. List any note
where an explore prompt could not pass sibling validation (step 6.7) and any
paragraph in step 1 you were unsure how to classify.

---

## Follow-ups deferred out of this pass

**Render a `Terms` block under the note summary.** `AnnotatedText` matches
against the summary text only, so a note's `terms` produce a visible definition
for a human reader only where the term appears in that summary — 11 of the 21
notes that carry terms. Agents get all of them through the `## Vocabulary`
section of `/llms.txt`.

Body annotation is the complete fix and is a real change: it means
post-processing rendered HTML or the Markdown AST, and deciding
first-occurrence-only versus every occurrence. Defer it.

The cheap partial fix, and the one to do first: render a small `Terms` block
under the summary on `src/pages/notes/[slug].astro` for any note with a
non-empty `terms` array, reusing `TermHint`. No body parsing, no new component.
That closes the human-reader gap for the other 10 notes.

**Spot-check explore prompts in a clean context.** Step 6 added 30 prompts
validated by rubric review rather than isolated clean-context execution, which
`docs/explore-prompts.md` permits with disclosure. Thirty is enough that a
sibling check on two or three — one current, one superseded — is cheap insurance
before they are treated as settled.

**Spot-check result, 2026-08-22.** Three prompts were run in isolated
clean-context sessions (Sonnet, no tools, prompt text plus a sibling scenario
only; the note itself was never supplied). Graded by a session that had read the
notes but not written the prompts.

| Note                                             | Scenario                                                                  | Result                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `judge-agents-by-the-next-prompt` (superseded)   | Finance lead reviewing two human analysts monthly                         | Pass. Led with the lifecycle disclosure, did not act on the routing table, produced a gap list; three of its five blind spots match the successor note, two are new (per-worker decomposition, supervisor drift).                                                                                         |
| `the-node-remembers-what-git-does-not` (current) | Proxmox fleet with Ceph and ZFS stores the host does not own              | Pass. Mapped every store to the four dispositions, matched two cases to the note's incidents, and diverged on externally-authoritative stores with a reason. ZFS feature flags are a sharper instance of the note's rollback thesis than either incident in the note — worth citing on a future revision. |
| `the-wallpaper-is-a-build-artifact` (current)    | Nondeterministically trained 7B model with a legal data-deletion deadline | Pass. Per-conclusion verdicts; explicitly rejected "regeneration is reconstruction" under nondeterminism and said why. Produced a receipt schema and a gate table with artifact class per gate.                                                                                                           |

No prompt produced a summary or clone.

**Coverage caveat.** Only `judge-agents-by-the-next-prompt` came from this
pass's batch of 30. `the-node-remembers-what-git-does-not` and
`the-wallpaper-is-a-build-artifact` already carried prompts at the plan commit
and predate the hygiene pass — both appear on the plan's step-6 priority list,
which was wrong about which notes were missing prompts, and that is the likely
route by which they were sampled. So this tests 1 of the 30 rubric-reviewed
prompts plus 2 written under the older process. It is evidence that the rubric
route can produce a sibling-valid prompt, not that the batch is settled. 29
remain unexecuted.

**Two by-products worth acting on**, both candidates for a note revision rather
than a prompt change:

- ZFS feature flags — one-directional state written by the new version — are a
  cleaner instance of the rollback thesis than either incident in
  `the-node-remembers-what-git-does-not`.
- "Regeneration is reconstruction" does not hold under nondeterministic
  production. That is a real scope limit on `the-wallpaper-is-a-build-artifact`
  which the note does not state.
