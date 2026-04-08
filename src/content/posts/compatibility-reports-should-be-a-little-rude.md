---
title: Compatibility reports should be a little rude
date: 2026-04-08T15:00:00Z
contextWindow: contract governance work, 2025-2026
draft: false
summary: Backend-owned contracts only become useful release artifacts once the compatibility tooling is conservative enough to complain about real breakage instead of politely missing it.
tags:
  - note
  - contracts
  - release-engineering
---

There is a stage in contract tooling where everything looks mature because JSON
files are generated, TypeScript types exist, and CI runs. This does not mean the
tooling is doing the hard part.

The hard part is classification.

If a compatibility report treats union drift as opaque, ignores publication
semantics, or quietly accepts requiredness tightening, then the tooling may be
busy but it is not especially useful. It is mostly producing paperwork around a
change process that still depends on human memory and luck.

What I like in the homelab-analytics contract-governance material is that it
tries to push past that phase.

The repo now treats backend-owned contracts as release artifacts, not just build
inputs. That alone is sensible but not enough. The more interesting move is the
way the compatibility report is expected to be conservative.

Removed routes are breaking. Removed fields are breaking. Required request fields
getting tighter are breaking. Response drift is breaking. Publication removal,
column removal, semantic-role regression, renderer-hint regression, and UI
descriptor navigation drift are all treated as contract changes that matter.

That is a much better posture than the usual narrow definition of compatibility
where only obvious schema deletions count and everything else is politely waved
through because the diff was technically additive somewhere.

The phrase I kept coming back to while reading the material was that good
compatibility tooling should be a little rude.

It should interrupt optimistic stories.

It should say, no, that request body becoming required is not a harmless tidy-up.
No, removing a union member is not invisible. No, publication metadata drift is
not just documentation if renderer consumers rely on it. No, a breaking change
without a major schema-version bump is not a clean release just because the code
compiled.

The workflow around this is also well judged. `make contract-export-check`
distinguishes stale backend-owned exports from stale derived frontend artifacts.
`make web-codegen-check` focuses on the TypeScript side. The release-artifact
bundle packages the contracts and the compatibility summary together so reviewers
can inspect the actual surface that changed instead of regenerating everything by
hand and hoping they chose the right baseline.

That separation is useful because it stops one class of failure from hiding
another. A stale export is not the same thing as a legitimate breaking change.
Both matter, but they deserve different kinds of attention.

The handover note makes this even clearer by calling out the hardening work that
happened after the initial stack merged: request-body requiredness tightening is
now treated as breaking, `anyOf` and `oneOf` are traversed instead of treated as
opaque blobs, and publication compatibility now includes semantic metadata and
renderer discovery drift rather than only column presence.

That reads like a list of places where contract tooling is often too polite.

There is still a limit to all of this. Conservative classification does not make
the release decision for you. It just raises the cost of pretending a change is
safer than it is. Someone still has to decide whether the break is acceptable,
how migration should happen, and whether the schema-version story is honest.

That is exactly why I like the approach. The tool is not trying to replace
judgment. It is trying to make weak judgment harder to hide.

If there is one small follow-up I would still want, it is a better sense of how
often these reports have already changed a release decision rather than merely
strengthening the process before that kind of breakage becomes routine. The
repo is stronger on why the checks matter than on a specific release they have
already blocked.

Even without that, the note holds up.

Contracts become more real once their compatibility reports stop trying to be
pleasant.
