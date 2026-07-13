---
title: The ref nobody adds
status: guiding
area: agent workflow
published: 2026-07-13
lastRevised: 2026-07-13
projects:
  - sprintctl-and-kctl
relates:
  - the-missing-layer-is-binding-not-intelligence
  - the-coordinator-never-touches-the-repo
tags:
  - agents
  - workflow
  - documentation
summary: The sprint database held 831 work items and seven doc refs, six of them the same document. The reference command existed the whole time. The missing piece was never a tool — it was placement on the path the agent actually walks.
---

The feeling was a disconnect: sprint items carry a one-line title, the real implementation thinking lives in documents somewhere in the repo, and the two never seem to meet. Feelings about workflow are cheap, so the first move was to measure. The sprint database holds 831 work items across eleven repos. The number of document references ever attached to an item is seven. All seven live in the sprint tool's own repo, and six of them point at the same plan document.

The reference mechanism is not missing. `item ref add --type doc` has existed the whole time — a table, a command, a list view. So the measurement says something sharper than "docs are underused": a primitive was built, shipped, and never entered the loop. Items are titles over empty description fields, while the planning documents on the far side of the gap are genuinely good — per-task what, where, how, and done-when. Nothing machine-readable connects them.

The gap has already presented its invoice. One project spent an entire sprint doing nothing but reconciling documentation status against reality — plan documents marked "not started" for work that had shipped months earlier. That is the same disconnect running in reverse: if items never point at docs, docs never learn what the items did.

The tempting diagnosis is a missing tool, because a missing tool has an exciting fix. The correct diagnosis is a missing convention. The shaping workflow — the step where a raw idea becomes a claimable item — never asks for a reference. The resume surfaces — the context bundle an agent receives when it picks up work — never render one. A capability that sits outside the walked path is indistinguishable from a capability that was never built.

This generalizes past sprint tooling. For an agent, information that is not on the path it actually walks does not exist. Search does not rescue this, though "the agent can always search the repo" feels like it should. Search fires when the agent already suspects a document exists. The failure mode is not "searched and found nothing" — it is "never suspected there was anything to find." A pointer costs one line in a resume bundle. A suspicion cannot be provisioned at all.

The fix, in order of expense: put identity and status in document frontmatter, make the shaping step attach a reference or explicitly record that none exists, and render references in every surface an agent reads on its way into work. No new tool appears anywhere in that list, and that is the point — the convention is also the experiment. If agents start using documents once the pointer sits in their path, the convention was the whole fix. If they ignore documents handed to them directly, no bridge tool was going to save the situation, and it is better to learn that before building one.

Tooling earns its place after the convention proves there is traffic to carry. Build the road where the desire path already runs, not where the map says walking ought to occur.
