---
title: The missing layer is binding, not intelligence
date: 2026-04-27T08:00:00Z
contextWindow: agent workflow tooling work, 2025-2026
draft: true
summary: The useful workflow layer for solo agent work is not a giant orchestration stack. It is a local-first system that remembers claims, checkpoints, routing choices, and promotion boundaries without pretending one operator needs a whole platform team.
tags:
  - note
  - workflow
  - agents
---

The agent work happens. The problem is that the system forgets.

That is the actual failure mode I keep tripping over. The model can plan. The
model can write code. The model can even review its own output well enough to
be useful. But between sessions the system sheds state: what was claimed, what
was deferred, what checkpoint mattered, which model tier was used, which result
was durable, and which output was just residue from a run that happened to go
well once.

That is the part I wanted to fix.

Not "build a general workflow platform". Not "recreate Temporal in miniature".
Not "cosplay as a platform team of one" because frontier models made it newly
fashionable to wrap a queue around a shell command. The scope is smaller and
more boring than that. I want a local-first coordination surface for one
operator using multiple model tiers without relying on memory, branch names, or
the hope that the next session will infer the same story from the repo.

The useful boundary is not "agent framework" versus "no framework". It is
"what needs explicit coordination" versus "what can stay ordinary tooling".

For me, the coordination layer needs to remember a few things reliably:

- what work item is active
- who or what currently owns it
- what checkpoint was reached
- what handoff or audit artifact exists
- what should be promoted into Git and what should stay local

This is also not hypothetical substrate design. The pieces already exist:
`sprintctl` for sprint state and claims, `.agents/skills/` for reusable
operating instructions, `.agents/handoffs/` for session continuity, and thin
harnesses around planning, implementation, and review so the routing stays
explicit. None of those pieces is especially grand on its own. The point is
that they already have jobs, and the missing layer is the glue that binds them
into one repeatable loop.

Everything outside that boundary should stay suspiciously plain.

OpenHands is interesting because it adds a more integrated agent runtime and
task loop, but that still would not solve my need for explicit local claims,
handoff state, and promotion boundaries. Windmill is interesting because it
adds a serious execution plane for jobs, secrets, schedules, and a control UI,
but those are benefits for shared operations rather than for remembering what a
single operator session was doing. Temporal is interesting because it gives you
durable orchestration and retries, but durable orchestration is not the same
thing as deciding what should be claimed, reviewed, promoted, or left as local
residue. That is why none of them is the shape of problem I have today. My
pressure is not missing workflow primitives. My pressure is that planning,
implementation, and review need different memory and budget envelopes, and the
handoff between them needs to survive a session ending.

That is why the routing detail matters.

Planning, implementation, and review have different cost and quality
requirements. Treating them as one generic "run the agent" operation is a nice
way to hide the economics until they start eating the workflow.

```toml
[planning]
model = "opus"
reasoning = "high"
max_cost_usd = 1.50

[implementation]
model = "sonnet"
reasoning = "medium"
max_cost_usd = 0.75

[review]
model = "haiku"
reasoning = "low"
max_cost_usd = 0.10
```

That is not a toy preference file. It is the practical shape of the system.
Planning wants a more expensive model with a wider context and better judgment.
Implementation wants something cheaper and steadier that is still good at
structured code work. Review wants a fast pass that can check the work, surface
obvious misses, and either approve the result or bounce it back for a more
expensive look. The whole point of the dispatch layer is to make that routing
explicit instead of pretending all model calls are interchangeable.

The run itself is not especially glamorous. It is mostly a disciplined sequence
for turning one brief into durable state.

1. `actionq run` starts from a named work item, not from an empty prompt.
2. The planning tier turns the brief into a bounded plan and a checkpoint shape.
3. The system writes the claim and checkpoint into local coordination state.
4. The implementation tier picks up the same item rather than re-deriving scope.
5. The working session lands code, notes, or both against that claim.
6. The run records the handoff artifact that the next session will need.
7. The review tier checks the diff, validation output, and checkpoint contract.
8. The human decides what gets promoted into Git and what remains local residue.
9. The claim is closed, resumed, or deferred with enough state that the next run
   starts from memory instead of reconstruction.

This is also where the Postgres question keeps getting asked too early.

The issue is not "where do I put rows". The issue is coordination. A local
SQLite database is good enough for a single operator who needs claims,
checkpoints, resumable handoffs, and a small amount of durable local memory.
Moving that immediately to Postgres would make the architecture sound more
serious while leaving the actual problem almost unchanged.

Postgres becomes interesting when the coordination itself stops being local:
multiple remote runtimes, shared access, concurrent operators, long-lived
service processes, or a real need to inspect and mutate state away from the
machine where the work is happening. That is a credible future boundary. It is
not the present one.

This distinction matters because it is easy to over-read "local-first" as a
purity preference. It is not. It is a refusal to escalate infrastructure before
the pain justifies it. If the hard part is remembering ownership and checkpoints
between sessions, then the first thing to build is the coordination surface. The
database engine swap can wait until the coordination problem actually grows into
a remote systems problem.

That is also why `auditctl` comes before any bigger orchestrator in my head. If
I am adding one more binding layer, the first thing I want is better audit and
checkpoint memory: what was claimed, which route was chosen, what validations
ran, what artifact became the handoff, and what actually got promoted. That
order of operations matters more than it first sounds. A small system that can
explain a run is more valuable than a larger system that can launch one.

That also means there is a fair amount I am deliberately not building yet:

- a remote Postgres-backed coordination service
- a browser control plane for every run
- long-lived autonomous workers that keep operating after I walk away
- general DAG scheduling across arbitrary tools
- full retrieval memory for every prompt artifact
- policy automation that tries to close the loop without an operator checkpoint

These are not rejected. They are waiting for pain with a name.

The near-term direction is not "add more platform". It is "tighten the local
coordination loop until the missing pressure is obvious". If that pressure shows
up, the follow-on notes write themselves.

Until then, the honest version is simpler.

The agent work is already good enough to matter. The missing system is the one
that remembers what the work meant, how it was routed, what should survive the
session, and which pains have actually earned more machinery.
