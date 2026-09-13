---
title: A repository should not contain everything its agents know
role: synthesis
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-09-13
lastRevised: 2026-09-13
projects: []
relates:
  - a-project-folder-is-a-view-not-an-authority
  - the-agent-is-not-the-application
  - layering-you-cant-violate-by-accident
  - the-platform-can-retrieve-the-application-still-has-to-decide
  - the-context-window-is-not-the-continuity-boundary
  - simplicity-is-an-ambitious-property
draft: false
tags:
  - agents
  - context-management
  - documentation
  - workspaces
  - workflow
summary: >-
  Agent context is a dependency of each run: bind shared instructions to
  concrete versions in a per-run record, and because no linker composes prose,
  record every conflict outcome and refuse what cannot be classified.
explorePrompt: >-
  Use this note as a worked instantiation of treating an agent's context as a
  dependency of each run. The transferable question is how a repository can use
  shared instructions, skills, and hooks that change on their own schedule while
  every run stays reconstructable afterwards. The worked answer: copying shared
  guidance is vendoring and silent injection is an unpinned latest; the
  repository commits a manifest of what it selects, and a per-run binding record
  plays the lockfile. The analogy breaks at composition. No linker merges prose,
  so the record must carry the outcome of every declared disagreement, a local
  layer may narrow a permission but never broaden it, and anything
  unclassifiable is refused rather than settled by document order. The
  prototype's first record found most shared sources unversioned, identifiable
  by hash but not restorable, and it binds files rather than the text a hook
  actually injected. Apply this to one repository and agent harness you use.
  Inventory what reaches a session, what event changes each source, and which
  sources could be restored. Say where the dependency framing fails for you, for
  example generated or conversational context. Produce a source table, a minimal
  record schema, the conflict rules you would enforce, and one reconstruction
  test against a past run.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - sharing agent instructions across repositories without copying them
    - reconstructing which shared instructions and skills an agent run received
  establishes:
    - a per-run binding record as the lockfile for agent context, with conflict
      outcomes as part of the record
  doesNotEstablish:
    - a standard manifest syntax or context registry
    - that disagreements between prose instructions can be detected
      automatically
  supplementWith:
    - the repository's local instructions and the output its harness actually
      injects at session start
---

On 29 August a session-start hook in my agent tooling gained a few lines of
status output. The harness parses that hook's output as JSON, so the extra lines
did not add a note beside the sprint context it injected; they discarded the
context. No repository changed. A failing test reported the defect and was
written off twice as pre-existing, and the only other trace was an empty
directory the hook created at 15:25. I found no record of which sessions started
with their context and which started without it.

## Context is a dependency

An agent's context is a dependency of the run, with the two familiar failures.
Copying shared guidance into `AGENTS.md` is vendoring: Git records what the
agent could read, and a year later the copy is an obsolete fork that still looks
local. Injecting it at session start is an unpinned `latest`: always current,
and the repository no longer describes its own run. The hook failure was the
second kind.

What separates the sources is the event that changes each one, and those events
do not coincide:

```text
workstation   agent baseline, harness adapters
              changes when a hardening pass lands

skill         a procedure for one kind of work, such as a handoff
              changes when the procedure is learned better

repository    local architecture, validation, exceptions
              changes when the project does
```

No single commit can pin all three. Flattening them into one local instruction
tree also makes a stale copy indistinguishable from a deliberate pin.

The missing artifact is the lockfile, and it belongs to the run. The repository
commits a manifest of what it selects. This is the one this site now carries:

```json
{
  "context": [
    { "name": "workstation/agent-baseline", "standing": "rule" },
    { "name": "workstation/claude-adapter", "standing": "rule" },
    { "name": "workstation/codex-adapter", "standing": "rule" },
    { "name": "skill/handoff", "standing": "option" }
  ],
  "local": ["AGENTS.md", "docs/writing-style.md"],
  "exceptions": [
    {
      "target": "workstation/agent-baseline#deployment",
      "effect": "narrow",
      "reason": "Deploying needs separate deployment authority."
    }
  ]
}
```

The names are symbolic. Where each one lives is host state, kept in a provider
map that is not committed. Each run binds every reference to a concrete version
and writes the record beside the session's other evidence. The manifest is
committed; the record cannot be, because the same manifest resolves differently
on different days and machines.

Two records side by side show what `npm outdated` shows. If the handoff skill
were edited after the record below was written, comparing that record with the
next one would give:

```text
skill/handoff
  bound:    962e2a3d00db   (13 September)
  now:      a different hash
  custody:  unversioned, so the bound text cannot be recovered
```

## There is no linker

Code dependencies are combined by a linker with defined semantics: a symbol
resolves or the build fails. Prose is combined by a model, which has none. When
a workstation rule and a repository instruction disagree, nothing reports the
collision; the model settles it and the run looks normal.

So the record has to carry the outcome of every disagreement, not only versions.
An assembler cannot see a disagreement in prose either: exceptions have to be
declared, and one it cannot classify is refused rather than resolved by document
order. One rule does not fall out of ordinary policy design: a local layer may
narrow a permission, never broaden it. This site may forbid a deployment the
workstation allows; it may not allow a send the workstation forbids.

The prototype's whole classification fits in a table:

```text
declared effect   on a rule   on a default   on knowledge or an option
narrow            narrowed    narrowed       narrowed
replace           refused     replaced       refused
broaden           refused     refused        refused
anything else     refused     refused        refused
```

A target without a known standing is refused too. How defaults, knowledge, and
optional skills should rank beyond that is left to whoever builds the assembler.

## A record for this site

[`scripts/bind-context.mjs`](https://github.com/bayleafwalker/kotona.app/blob/b88a4948de415df25d5e99f5a1ae5e1c39a3ce10/scripts/bind-context.mjs)
at `b88a494` is 97 lines. It reads the manifest, resolves names through the
provider map, hashes what it read, records the repository and blob id for
anything Git holds, classifies declared exceptions, and exits non-zero on
anything unresolved or refused.

Its record on 13 September, with host paths removed and hashes shortened:

```json
{
  "schema": "context-binding/v0",
  "context": [
    {
      "name": "workstation/agent-baseline",
      "standing": "rule",
      "custody": "unversioned",
      "sha256": "51c9899a0066"
    },
    {
      "name": "workstation/claude-adapter",
      "standing": "rule",
      "custody": "unversioned",
      "sha256": "52920b4455ea"
    },
    {
      "name": "workstation/codex-adapter",
      "standing": "rule",
      "custody": "unversioned",
      "sha256": "19f4f39d18df"
    },
    {
      "name": "skill/handoff",
      "standing": "option",
      "custody": "unversioned",
      "sha256": "962e2a3d00db"
    }
  ],
  "local": [
    {
      "name": "AGENTS.md",
      "custody": "git",
      "sha256": "6eecf07f4233",
      "blob": "f6cfee694a3c"
    },
    {
      "name": "docs/writing-style.md",
      "custody": "git",
      "sha256": "2a5a946ef101",
      "blob": "6c91c0c35b5d"
    }
  ],
  "exceptions": [
    {
      "target": "workstation/agent-baseline#deployment",
      "effect": "narrow",
      "outcome": "narrowed"
    }
  ],
  "problems": 0
}
```

Both repository files resolved to Git blobs, and the one declared exception was
recorded as narrowed. The four shared sources resolved to hashes with no version
control behind them. A hash identifies what a run read but cannot restore it, so
for those sources the record is evidence, not yet a lock.

## Three questions

After a run, the record should answer:

1. What did this repository select?
2. Which exact material was supplied?
3. What happened where two sources disagreed?

This site's record answers the first two for files and the third only for
declared disagreements. It would not have caught the August failure: the hook is
not in the manifest, and a new hash would only have shown that the script
changed. What reaches the model is the output, so the next test is binding the
injected preamble and replaying that failure against the record.
