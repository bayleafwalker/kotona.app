---
title: The coordinator never touches the repo
role: operating
status: guiding
lifecycle: current
area: agent workflow
published: 2026-06-10
lastRevised: 2026-06-10
projects:
  - household-operating-platform
  - sprintctl-and-kctl
relates:
  - subprocess-not-service
  - the-missing-layer-is-binding-not-intelligence
tags:
  - agents
  - workflow
summary: Sprint work is split into plan, build, and review dispatches, and the orchestrating session is structurally barred from editing deliverables. The bar is the point.
---

Sprint execution in homelab-analytics runs through three dispatch skills: dispatch-plan on the most capable model, dispatch-build on the cheapest, dispatch-review in between. Above them sits a coordinating session that holds the sprint state, decides what gets dispatched next, and is not allowed to edit the repo. Not discouraged — barred. Sprint deliverables only arrive through a dispatched session whose scope was declared before it started.

The rule exists because the coordinator is the most dangerous editor in the system. It has the most context, which means it is the most tempted to skip the ceremony and just fix the thing. And a quick fix from the orchestrator is precisely the change that bypasses everything the apparatus was built for: it holds no claim, it was never scoped, it shows up in no review, and the audit trail records a dispatch system that did less than actually happened. One unattributed edit is harmless. The habit dissolves the boundary between coordination and execution, and that boundary is the product.

There's a second thesis nested in the model assignment, and it isn't about cost. Planning, building, and reviewing get different models because they are different jobs with different failure modes. Planning fails by shallow decomposition, which nothing downstream can repair — so it gets the expensive model. Building fails by drifting from a spec, which review exists to catch — so a cheap model with a tight spec is fine, and a tight spec is the planner's deliverable anyway. Review fails by politeness, which is a disposition problem more than a capability problem — so it gets a mid-tier model and conservative instructions, for the same reason compatibility reports should be a little rude.

Read that way, the tiering is an architecture decision: it encodes where errors are allowed to occur and which stage is responsible for catching them. The cost profile falls out as a side effect, which is the correct direction for that dependency to point.

What the coordinator is left with is the work nobody dispatches: sequencing, scope cuts, deciding a track is blocked, deciding a sprint is done. That turns out to be a full job. The sessions that build are replaceable by design. The session that is forbidden to build is the one that has to be right.
