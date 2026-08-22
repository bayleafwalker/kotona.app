# Glossary

Definitions for the local system names and site-specific concepts that appear
across the notes. This file is the source; a note or project carries the
definitions it needs in its `terms` front matter, and `/llms.txt` generates its
Vocabulary section from the union of those.

Rules for an entry: one sentence, at most 240 characters (the schema limit),
concrete, and not circular. Write it from the corpus's own usage — if no note
uses the term, it does not belong here. A note that defines a term in its own
body does not carry it in `terms`; the inline definition is better placed.

## Local systems

- **Vuoro** — The public label for this family of small, separately owned
  agent-workflow tools.
- **sprintctl** — The CLI and schema that own sprint work, dependencies, claims,
  and handoffs.
- **kctl** — The read-only pipeline that turns reviewed sprint history into
  durable knowledge.
- **actionq** — The PostgreSQL-backed queue that owns actions, sessions, claims,
  and outcomes.
- **actionq-dispatcher** — The one-action coordinator that creates a bounded
  workspace, invokes a worker, and records the result.
- **auditctl** — The tool that indexes audit events and emits portable daily
  evidence shards.
- **agent-cockpit** — The operator interface that composes state from the owning
  tools without becoming their database.
- **Appservice** — The private GitOps repository that holds desired state,
  recovery rules, and operational evidence for the cluster.
- **Homelab Analytics** / **homelab-analytics** — The household data and
  decision platform that owns long-lived semantics, scenarios, policies, and
  approvals.
- **Box** — A contract-first platform scaffold for testing a small reusable
  service kernel before implementing its runtime.
- **Outctl** — A tool that captures a command's full output outside the agent's
  context and returns a bounded projection the agent can query later for the
  omitted evidence.
- **Acceptance Lab** — A local-first prototype that turns agent requirements,
  observed evidence, authority rules, and operating budgets into executable
  promotion decisions.

## Site concepts

- **artifact of record** — An output whose exact identity has to stay bound to
  its evidence; for this site, a note's body, front matter, declared relations,
  and lifecycle state.
- **derived realization** — An output that may differ between generations
  without changing what a reader relies on, such as a rendered page, an RSS
  entry, an `llms.txt` line, or the knowledge graph.
- **generative closure** — The property that enough survives in a note's front
  matter and body to regenerate any of its derived views acceptably.
- **verification closure** — The property that a human or a documented check can
  tell whether a regenerated view is acceptable without re-deriving it by eye.
- **access cell** — A devbox, workstation, CI runner, or ephemeral task
  environment that authenticates a session and mediates reach without owning
  policy, canonical context, or target effects.
- **action envelope** — The unit that carries intent, pinned context, an
  authenticated principal, a scoped capability, a target, and preconditions
  through an attempt to its receipt and the reconciliation of its consequence.
- **settlement boundary** — The predicate deciding whether work may advance:
  evidence sufficient, policy resolves the fork, authority delegated,
  accountability satisfied, and no calibration review due.
- **materialization instance** — A generated local folder that turns a
  participation record into a working view of the repositories a piece of work
  needs, without becoming the authority over them.
- **next-prompt test** — Judging an agent's work by what the operator has to say
  next: a correction, an extension, or an authorization.
- **person of record** — The named human who stays answerable for an action
  whatever share of the work a model performed.
- **legibility** — Whether a system's intent, permission, action, result, and
  correction can be read off its own records instead of reconstructed.
- **explorePrompt** — A note's post-hoc prompt for applying its question
  elsewhere, validated as a sibling of the note rather than a recipe for
  reproducing it.
