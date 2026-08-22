---
title: The coordinator never touches the repo
role: operating
status: guiding
lifecycle: current
area: agent workflow
published: 2026-06-10
lastRevised: 2026-08-08
projects:
  - household-operating-platform
  - vuoro
relates:
  - subprocess-not-service
  - the-missing-layer-is-binding-not-intelligence
terms:
  - term: homelab-analytics
    definition:
      The household data and decision platform that owns long-lived semantics,
      scenarios, policies, and approvals.
tags:
  - agents
  - workflow
summary:
  Sprint work is split into plan, build, and review dispatches, and the
  orchestrating session is structurally barred from editing deliverables. The
  bar is the point.
---

The coordinating session may inspect repositories, read results, choose the next
task, and stop a sprint. It may not edit a deliverable repository.

Sprint work in `homelab-analytics` is dispatched in three stages:

1. `dispatch-plan` turns the selected work into a checked implementation plan.
2. `dispatch-build` performs the repository changes within that declared scope.
3. `dispatch-review` inspects the result and reports approval or required work.

Every file change must come from one of those scoped sessions. The coordinator
does not get an exception for a typo, an obvious fix, or a change that would be
faster to make directly.

## Why the rule exists

The coordinator has the widest context. It can see the sprint, the plans, the
agent reports, and the state of several repositories. That makes it useful for
sequencing work and unusually dangerous as an editor.

If it changes a file directly, the recorded workflow becomes false. The edit was
not part of a dispatched claim, its scope was not fixed before execution, and
the review stage may never see it. One small edit is unlikely to cause an
incident. Repeating the shortcut creates a system whose audit trail describes
less work than actually happened.

The prohibition turns that problem into something easy to check: the
coordinator's worktree must remain unchanged.

## Assign models by the failure they must avoid

The three stages do not use the same model by default.

| Stage  | Main failure                            | Response                                               |
| ------ | --------------------------------------- | ------------------------------------------------------ |
| Plan   | Missing a dependency or bad sequencing  | Use the strongest model available                      |
| Build  | Drifting from an adequate plan          | Use a cheaper model with a narrow specification        |
| Review | Accepting plausible but incomplete work | Use conservative instructions and an independent model |

This allocation is primarily about where an error can be caught. A shallow plan
poisons everything downstream. A build error can still be found in review. A
reviewer that politely accepts missing work defeats the final gate. Lower cost
is useful, but it follows from those choices rather than deciding them.

## What the coordinator still owns

Keeping it out of the repository does not make the coordinator passive. It still
has to:

- choose the next eligible item;
- cut scope when a sprint is too large;
- decide whether reported evidence is sufficient;
- record a blocked track rather than dispatching around it;
- send review findings back through a new scoped build; and
- decide when the sprint is complete.

When review finds a two-line defect, the coordinator dispatches the repair. It
does not apply the patch itself. When work is blocked, it records the block and
chooses another eligible item. It does not silently widen the task.

## Checks

At the end of every dispatch:

- compare the repository diff with the dispatched scope;
- confirm that the producing session is recorded;
- require review for every deliverable change; and
- verify that the coordinator's own worktree is clean.

If the coordinator has edited a deliverable, stop the sprint. Preserve the diff,
move the change into a properly scoped build session, and review it there. Do
not repair the record after the fact by pretending the edit came from a
dispatch.

The coordinator is useful because it decides what work may happen next. Keeping
it out of the repository makes that decision visible.
