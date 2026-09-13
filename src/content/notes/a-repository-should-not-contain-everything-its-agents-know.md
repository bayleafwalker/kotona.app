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

On 29 August a session-start hook shared by every repository in my workspace
gained a few lines of status output. The harness parses that hook's output as
JSON, so the extra lines did not add a note beside the sprint context it
injected; they discarded the context. No repository changed. A failing test
reported the defect and was written off twice as pre-existing, and the only
other trace was an empty directory the hook created at 15:25. Nothing recorded
which sessions started with their context and which without it, and nothing can
say so now.

## Context is a dependency

An agent's context is a dependency of the run, with the two familiar failures.
Copying shared guidance into `AGENTS.md` is vendoring: Git records what the
agent could read, and a year later the copy is an obsolete fork that still looks
local. Injecting it at session start is an unpinned `latest`: always current,
and the repository no longer describes its own run. The hook failure was the
second kind.

What separates the sources is the event that changes each one. Workstation
guidance changes when a hardening pass lands, a skill when a procedure is
learned better, the repository when the project does. No single commit can pin
all three.

The missing artifact is the lockfile, and it belongs to the run. The repository
commits a manifest of what it selects; each run binds every reference to a
concrete version and writes the record beside the session's other evidence.
Comparing two records is `npm outdated`.

## There is no linker

Code dependencies are combined by a linker with defined semantics: a symbol
resolves or the build fails. Prose is combined by a model, which has none. When
a workstation rule and a repository instruction disagree, nothing reports the
collision; the model settles it and the run looks normal.

So the record has to carry the outcome of every disagreement, not only versions,
and the assembler has to refuse a conflict it cannot classify rather than
resolve it by document order. One rule does not fall out of ordinary policy
design: a local layer may narrow a permission, never broaden it. This site may
forbid a deployment the workstation allows; it may not allow a send the
workstation forbids. The rest is policy for whoever builds the assembler.

An assembler cannot detect a disagreement in prose either. It can require
exceptions to be declared, classify those, and refuse the rest.

## A record for this site

[`scripts/bind-context.mjs`](https://github.com/bayleafwalker/kotona.app/blob/05448bc162b9aaade5a089699f617d52a4daf0f7/scripts/bind-context.mjs)
at `05448bc` is 99 lines. It reads the site's `context.manifest.json`, resolves
names through a provider map that stays on the host, hashes what it read, notes
whether Git holds it, classifies declared exceptions, and exits non-zero on
anything unresolved or refused.

Its first record bound six sources. Both repository files resolved to commits,
and the one declared exception, narrowing deployment, was recorded as narrowed.
The four shared sources resolved to hashes with no version control behind them.
A hash identifies what a run read but cannot restore it, so for those sources
the record is evidence, not yet a lock.

## Three questions

After a run, the record should answer what the repository selected, which exact
material was supplied, and what happened where two sources disagreed. This
site's record answers the first two for files and the third only for declared
disagreements. It would not have caught the August failure: the hook is not in
the manifest, and a new hash would only have shown that the script changed. What
reaches the model is the output, so the next test is binding the injected
preamble and replaying that failure against the record.
