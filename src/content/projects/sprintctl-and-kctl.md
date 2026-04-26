---
title: Building sprint tooling because agents kept editing the wrong line
summary: >-
  sprintctl and kctl are CLI tools for sprint lifecycle management and knowledge
  extraction. They exist because markdown-based sprint state failed under
  agentic editing, and the fix was a schema-enforced database rather than better
  prompts.
date: 2026-04-09
draft: false
project: sprintctl-and-kctl
kind: engineering
status: Published and in active use
repoUrls:
  - https://github.com/bayleafwalker/sprintctl
  - https://github.com/bayleafwalker/kctl
tags:
  - agents
  - workflow
  - cli-tooling
---

## Overview

sprintctl is a Python CLI for managing sprint lifecycle state. kctl is a
companion tool for extracting knowledge from sprint history. They exist because
the previous approach, markdown files edited by both humans and AI agents,
kept failing in the same way: agents would pattern-match on prose structure and
silently corrupt the state they were supposed to update.

The fix was not better instructions with more careful prompting, or rather I got
tired of applying this "fix". The actual fix I arrived after some brainstorming
sessions was removing the ambiguity entirely by putting sprint state into a
schema-enforced SQLite database and making the CLI the only write path. If the
tool rejects a transition, the transition does not happen. That is a smaller
problem than reconstructing what an agent thought it was editing.

The broader motivation came from the same observation: state managed by
convention rather than enforcement eventually gets reinterpreted. Tooling that
enforces its own transitions keeps structural authority with the human without
requiring the agent to be careful about it.

As a neat side benefit, skills and hooks become much standardized between multiple
agentic models and much of the ambiguity I was running into when using three
different frontier model providers was mitigated; if there's only one way to
pick up work and land it then of course it's going to be landed that way.

At the time of work this seemed to be something like a small niche, or rather
my workflow of building a backlog of thoughts, landed as planned work items and
finally implemented throughout single agent sessions seems like unique enough
problem that the existing tooling (shout out marcus/td!) didn't fit the bill.

Generally existing tools were much more tradationally focused on team collaboration
or then focused on the particular problems caused by orchestrating agentic swarms
or agentic handovers than what I was actually facing. So, what's better than throwing
one more tool in the mix to fix problems that I probably cause to myself!

## System shape

Both tools are Python packages installed globally via pipx, with project-local
SQLite databases configured through direnv (`SPRINTCTL_DB`, `KCTL_DB`). The
database directories are gitignored; committed artifacts are rendered snapshots
that serve as the diffable sync surface.

sprintctl enforces a schema across Sprint, Track, WorkItem, and Event tables
with explicit status transitions. The CLI is the authority: there is no backdoor
through direct database writes during normal operation.

kctl reads sprintctl's database read-only and runs `sprintctl maintain check`
as a pre-flight before doing its own work.

That same constraint — one write path enforced by the CLI — is what makes
coordinating work across multiple model tiers tractable. sprintctl becomes
the shared coordination surface rather than a convention each tier has to
honor separately.

The orchestration layer around these tools is a multi-model dispatch pattern
using a three-tier routing setup. Heavier reasoning and planning work routes to
Opus, structured code generation routes to Sonnet, and lightweight checks and
formatting go to Haiku. sprintctl and kctl serve as the shared state surface
that all tiers write to and read from, which means the coordination point is a
database with enforced transitions rather than a shared document that each model
interprets differently.

Session budget management follows from the same instinct. Extended thinking
tokens are expensive and poorly suited to code generation, so the preferred
pattern is minimal isolated sessions with a markdown handoff file (or copy pasted
prompts!) as stateful context. Each session gets one brief, works against the
database, and stops at an explicit checkpoint. `sprint-current.txt` is populated as
semi-transient 'working note', and is small enough that a fresh session can orient
without replaying the full history and gives the human operator, e.g. me, a quick
reference point. Sprint DB can also give a fresh context through single commands,
so picking up work is always easy enough. For longer breaks and multi-session
handovers additional guidelines help land more robust session notes that also
allow for claim upkeep and human intervention.

## Current state

Both tools are published and in active use (by me). sprintctl has full test coverage
with stdlib-only dependencies except Click, WAL-mode SQLite, and idempotent
rendering. kctl has a working extraction pipeline against sprintctl's database.

Recent operational work included moving the full test suite from a blocking
sprint-close gate to an operator-initiated task, a decision that came out of
sprint #23 after the gate created more friction than safety. Pending
implementation items include claim token persistence to disk, architecture
contract tests in dispatch-build verification, and re-logging a coordination
lesson as a durable event.

## Open edges

The multi-model dispatch pattern works but is still partly implicit in how
sessions are structured rather than fully declared in tooling. The routing is a
convention enforced by the operator rather than by sprintctl itself, which means
it depends on discipline more than it should.

The knowledge extraction side (kctl) is also younger than the sprint management
side. The read-only relationship to sprintctl's database is clean, but the
extraction model itself is still being shaped by use rather than by a settled
design. I have existing guideline based patterns for capturing full(er) prompt
outputs as future training artifacts, but those are still pretty limited in
implementation scope.

The broader question, how far schema-enforced tooling can go as a coordination
layer for agentic work before it needs something more dynamic, is still open
and probably the most interesting thing about the project.

I already have some planned work for an overarching orchestrator, but that gets
into something that I don't really have a problem with yet (nor the budget for).
