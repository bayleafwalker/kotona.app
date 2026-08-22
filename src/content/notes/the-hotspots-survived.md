---
title: The workshop disappeared. The hotspots survived.
role: synthesis
status: exploration
lifecycle: current
area: organizational systems
published: 2026-08-22
lastRevised: 2026-08-22
projects:
  - vuoro
relates:
  - legibility-is-an-operating-property
  - governance-for-a-team-of-one
  - where-the-assurance-questions-are-already-answered
  - the-human-is-in-the-slow-loop
draft: false
terms:
  - term: EventStorming
    definition:
      Alberto Brandolini's workshop method for modeling a domain on colored
      sticky notes -- commands, domain events, actors, views, and hotspots --
      normally run with a room of stakeholders around a paper timeline.
  - term: llama-swap
    definition:
      A local proxy that lazily loads whichever of several self-hosted models a
      request needs, serving them over one OpenAI-compatible endpoint.
tags:
  - agents
  - workflow
  - audit
  - assurance
summary:
  An EventStorming pass run solo, over agent session logs instead of a
  stakeholder workshop, still produced six ranked findings. The notation
  survived; the workshop did not; the value was in clustering the absences.
explorePrompt: >-
  Use this note as a worked instantiation, not a template to reproduce. The
  transferable question: EventStorming assumes a room -- stakeholders, colored
  paper, a facilitator negotiating vocabulary across departments. Does the
  method still produce anything once that apparatus is gone and the only
  "stakeholders" are several unattended agent harnesses and the operator who
  configured them? This instantiation ran the notation (commands, domain events,
  actors, views, hotspots) as a solo retrospective over the operator's own
  Codex, OpenCode, and Claude Code session logs, then clustered the hotspots
  instead of stopping at the per-tool catalog. It kept the facts: each tool's
  actual actor and event vocabulary, several numbers with stated denominators
  and observation windows, and one instance where the exercise itself surfaced a
  boundary violation worth reporting rather than hiding. It found six recurring
  hotspots, of which the sharpest was that operational naming ("-ready"
  suffixes, an experiment flag) implied gated transitions that no log actually
  recorded. Apply the method to your own agent or service logs -- whatever
  several independent systems already emit without a human curating them into a
  single narrative. Run the notation without the workshop: name your actors and
  aggregates from what the logs actually contain, extract commands and events
  with their real counts and time windows, list what a view showed before each
  command, and then cluster the hotspots across systems rather than reporting
  them separately. Say which hotspot recurs in more than one system, whether any
  of your operational names promise a transition your logs don't record, and
  what you would change first. State plainly which parts you inferred versus
  directly observed, and what you would need to check before trusting the
  inferred parts.
---

The July note on assurance ended with a commitment, not a flourish: "the next
step is proportionality testing of established methods at homelab/small-project
scale." This is that step taken, not a new one. EventStorming -- Alberto
Brandolini's method for modeling a domain on commands, domain events, actors,
views, and hotspots -- got run this week over a fleet of one operator's agent
harnesses instead of a room of stakeholders. It produced six ranked findings for
roughly the cost of seven background survey passes.

## What the method needs, and what it didn't get

EventStorming's usual apparatus is a room: several domain experts, a long roll
of paper, a facilitator negotiating vocabulary across departments that don't
normally talk. None of that existed here. There was one operator, three agent
harnesses (Codex, OpenCode, Claude Code) that don't share a vocabulary or a log
format, and a fourth actor -- a local inference server -- that doesn't log
itself as an actor at all. No stakeholder disagreement, no workshop friction, no
negotiation over what a term means between two departments. Just whatever each
tool's own SQLite state, JSONL transcripts, and config already recorded about
itself.

The notation survived that removal intact. Actors and aggregates came out of
each tool's actual schema -- Codex's thread and goal tables, OpenCode's session
and event tables, Claude Code's task-queue and subagent dispatch calls. Commands
and domain events came out of real log lines, not a stakeholder's paraphrase of
what they thought happened. Views came out of what each tool actually shows
before it acts -- a sandbox policy, a permission prompt, a pre-flight checklist.
What didn't survive was everything that depended on having more than one kind of
person in the room: no vocabulary negotiation, because there was only one
vocabulary to negotiate with itself; no stakeholder-supplied intent, because
intent had to be read back out of operator prompts after the fact.

## The hotspot cluster carried the value

The per-tool catalogs were useful but not the finding. The finding showed up
only after pulling every hotspot into one pile and ranking it, which is the same
move a real EventStorming session makes at the end of a Big Picture pass --
cluster the pink notes, don't just collect them.

Six patterns recurred across tools that don't share code, a log format, or a
vendor:

- **Cost and quota failover is a shadow domain.** None of the three tools logs a
  provider switch as a first-class event; it has to be reconstructed from gaps
  and joins.
- **State dies at the session boundary.** Codex currently has 9 of 18 tracked
  goals blocked, partly on evidence that no longer exists to recover. A
  dispatched retrospective subagent inside the Claude Code corpus itself had
  already classified 78 cross-session "what did this look like before the fix"
  instances -- 43 of them against transient infrastructure state with no
  surviving record, 31 recoverable from git, 4 from a saved artifact.
- **Denial is a workflow step, not an exception.** Codex logs `cluster_identity`
  and `read_only_policy` denials as ordinary events its own reasoning adapts
  around; OpenCode escalates unmatched tool patterns to the operator by design;
  one heavily loaded Claude Code session logged 92 permission-mode transitions.
  What mechanism produced each of those 92 isn't established by the session log
  alone -- that's a claim about transition count, not about 92 individual human
  clicks.
- **Live-infra commands get rerun without a freshness check.**
  `flux reconcile source git` reran five times over about eleven days in one
  project; `sprintctl doctor` reran twelve days apart in another. Neither rerun
  carried an explicit prior claim, an observed revision, a validity condition,
  or a stated reason to refresh -- that absence is the finding, not an assertion
  that either rerun was redundant. Live cluster state isn't something a session
  can cache across a boundary it doesn't track.
- **Local inference is invisible in its own ledger.** A local `llama-swap`
  instance, serving five self-hosted models over one endpoint, ran 123 of 239
  logged OpenCode sessions (51.5%) at $0.00 across a roughly 25-day window
  (2026-07-26 to 2026-08-20), against $33.50 total spend on the two hosted
  providers -- most of it nine sessions on one model averaging roughly
  $2.65/session. None of that is in OpenCode's own event table; it only exists
  by joining session rows to a model field.
- **Operational naming promises a transition the log doesn't record.** Its own
  section, below.

## The name is doing work the system isn't

This one implicates the operator's own tooling directly, which is exactly why it
belongs here rather than as a separate note. Project directories named
`vuoro-dispatch-ready` and `vuoro-outctl-ready` read, on sight, as a readiness
gate -- something computed a condition and flipped a state. Nothing in the
session logs records that transition. They are worktree snapshots, named as if
they were the output of a check that was never instrumented. Codex has the same
shape in a different register: a `shadow_selection_experiment` flag that implies
an A/B test over which skill gets activated, with no corresponding event showing
an arm being selected or compared.

Both read as a state machine because the name says so, not because a log
confirms it. That's a legibility gap in exactly the sense
[Legibility is an operating property](/notes/legibility-is-an-operating-property/)
already argues: a name that promises a joinable transition is a claim, and an
unrecorded transition means the claim is currently unverifiable, not merely
undocumented. The fix is cheap relative to the diagnosis -- log the transition
or rename the directory -- which is what makes it worth stating plainly instead
of living with it.

## Where the method could be lying to me

The exercise ran on sampled logs, not exhaustive ones -- large SQLite tables and
multi-megabyte transcripts were queried and spot-checked, not read in full. Some
causal claims in the first draft didn't survive a second pass: an apparent
billing-driven failover from a cheaper hosted model to a more expensive one
turned out, once queried directly, not to be established by the session
aggregation at all -- the cheaper model kept running throughout at low volume,
and nothing in the data shows one event causing the other. That correction is
itself part of the result: a solo retrospective has no second stakeholder in the
room to catch an inferred link before it hardens into a stated fact, which is
exactly the coordination problem
[Governance for a team of one](/notes/governance-for-a-team-of-one/) already
names -- the missing party here wasn't headcount, it was a second pass.

One survey pass also crossed its own observation boundary: it was scoped to
compare tool configuration between two hosts, and it enumerated credential-store
paths on the remote host to establish presence and size. It captured no
contents, and the harness itself flagged the pattern for review rather than
letting it pass quietly. No paths, hostnames, or addresses appear in this note.
That flag is worth reporting on its own terms -- it's evidence that supervised
agent work sometimes needs correcting mid-course, which is more credible than
any assurance claim I could make about the setup in the abstract.

## What changed because of it

Nothing about the underlying tools moved yet; the events and the projection that
would make the hotspots joinable in real time still have to be built. What moved
is ordering: this note fixes six dated, ranked absences in the current
operational event model before any packaging work starts on top of them. That is
the small-scale test
[Where the assurance questions are already answered](/notes/where-the-assurance-questions-are-already-answered/)
committed to running, reported the way that note asked for it to be reported --
with the failure modes named, not smoothed over.

The falsifiable part is the part that matters. The next honest move is to
implement the priority-one events this pass surfaced -- starting wherever
auditctl already owns the closest analogue -- and rerun the same board. A second
board that shows some of these six hotspots closed, some still open, and
possibly a new one exposed by the fix is the real result. This note is the
baseline half of that pair, not a conclusion on its own.
