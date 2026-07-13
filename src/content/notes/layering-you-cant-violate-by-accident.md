---
title: Layering you can't violate by accident
status: guiding
area: software architecture
published: 2026-06-10
lastRevised: 2026-06-10
projects:
  - household-operating-platform
relates:
  - the-coordinator-never-touches-the-repo
tags:
  - architecture
  - contracts
summary: homelab-analytics enforces its layer boundaries with pytest. A documented architecture is a request; a tested one is a constraint.
---

homelab-analytics is a modular monolith — FastAPI, a worker, a Next.js frontend, one repo — with its packages sorted into four strata by rate of change: kernel, semantic engine, product packs, surfaces. The kernel changes rarely and deliberately. Product packs churn freely. The strata exist so that things which change together live together, and things which change at different speeds meet only through declared seams.

None of that is novel as a diagram. The part that earns a note is that the boundaries are tests. Architecture-contract tests run in the ordinary pytest suite and fail the build when an import crosses strata in the wrong direction — a product pack reaching into another pack's internals, a kernel module depending downward on a surface. The architecture is not a convention the team agrees to, partly because there is no team. It is a red test.

The honest motivation is agentic editing. A large share of the changes in this repo are built by dispatched agent sessions against a spec, and agents generate plausible-looking imports faster than review reliably catches them. A wrong-direction import is the classic plausible change: it works, it's local, and it's exactly how a layered codebase rots into a connected one. The contract test is the reviewer that never gets tired and never decides the violation is probably fine this once. The agent gets immediate, mechanical feedback inside its own session, which is also the cheapest possible place to fix the mistake.

This is the executable version of a line from the about page — boundaries that can survive iteration. Surviving iteration turns out to mean surviving iteration by actors with no memory of why the boundary exists. A human contributor might absorb the layering from the directory names. A fresh agent session will not, and shouldn't have to: the constraint is in CI, where it binds regardless of who is editing or what they understood.

The evidence requirement is satisfied the same way everything else here is supposed to be: by repo output. The claim that the layering holds is not an assertion in a README. It's a green test run, and any future violation arrives pre-announced, in red.
