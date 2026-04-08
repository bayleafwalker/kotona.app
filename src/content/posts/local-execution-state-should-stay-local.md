---
title: Local execution state should stay local
date: 2026-04-08T13:00:00Z
contextWindow: workflow tooling work, 2025-2026
draft: false
summary: The sprintctl and kctl workflow is useful largely because it does not pretend every intermediate agent artifact belongs in Git. Live state stays local, committed artifacts stay small, and promotion has to be deliberate.
tags:
  - note
  - workflow
  - agents
---

One of the more useful process decisions in the repo is not about AI at all. It
is about refusing to commit too much of the wrong state.

The runbooks split the world quite cleanly.

Live execution state belongs in local SQLite databases: `.sprintctl` and `.kctl`.
Claim tokens stay local. Handoff bundles stay local unless there is a specific
reason to share them. Session notes are local history. The committed shared view
is much smaller: a sprint snapshot, a knowledge base, and curated training
artifacts when something actually deserves promotion.

That boundary is more important than it first sounds.

Agent-heavy workflows produce a lot of intermediate material. Some of it is
genuinely useful. Much of it is just execution residue: who held a claim, which
session resumed which item, what command sequence happened to work once, which
partial handoff was written because context was about to evaporate.

If you commit all of that by default, the repo becomes a log sink. If you commit
nothing, the process turns into private folklore. The interesting part is the
middle path.

This workflow keeps the fast-changing state local and insists that promotion into
Git should be deliberate.

That means `sprintctl` is the live source of truth for execution status and
claims. `docs/sprint-snapshots/sprint-current.txt` is rendered when a shared
artifact is actually needed. `docs/knowledge/knowledge-base.md` gets updated when
reviewed candidates are intentionally published. `docs/training/` is reserved for
curated worked examples that future agents or humans may genuinely learn from.

I like this because it respects the half-life of workflow artifacts.

Most session state is only valuable while the session is alive. Claim heartbeats,
resume metadata, and local handoffs are operational scaffolding. Pretending they
all deserve permanence in Git is just another way of avoiding judgment.

The runbooks also draw a second useful line: if a rule or example keeps mattering,
promote it out of local notes into a runbook, skill, guide, or training doc.
That avoids the opposite failure mode where everyone vaguely remembers that a
good pattern exists somewhere under `.agents/` but nobody can tell whether it is
still current or whether it was ever meant to be canonical.

There is a quiet discipline in that model. Durable repo state should be small,
human-readable, and intentionally curated. Local execution state can be noisy,
machine-readable, and disposable. Mixing those two categories is how a working
process slowly becomes archaeology.

The practical payoff is coordination. If an exclusive claim already exists, the
repo expects real ownership proof rather than inference from branch names or wish
thinking. If a session dies, the recovery file is local. If a pattern turns out
to be reusable, it can be promoted into `docs/training/` or a runbook where it
belongs.

That is a much saner model than either extreme.

It is saner than pretending every scratch artifact is a precious institutional
memory object. It is also saner than pretending there is no need for durable
shared artifacts because the database or the current agent probably remembers.

The only thing I would watch closely is curation discipline. A model like this
works well only if promotion actually happens when something becomes repeatedly
useful. Otherwise the committed layer stays neat at the cost of becoming too
thin, and the real knowledge drifts back into local-only history.

Still, the baseline principle seems right: not every agent artifact deserves a
Git commit. Execution state should stay local until it earns promotion.
