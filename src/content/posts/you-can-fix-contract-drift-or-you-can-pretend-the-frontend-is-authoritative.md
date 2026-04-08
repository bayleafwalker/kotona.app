---
title: You can fix contract drift or you can pretend the frontend is authoritative
date: 2026-04-08T12:00:00Z
draft: false
summary: Backend-owned contract exports are mainly a way to stop arguing with a stale frontend view of reality. The useful part is not code generation by itself but making the backend the source of truth and then checking the drift explicitly.
tags:
  - note
  - contracts
  - frontend
---

There is a very common peace treaty in web systems where the backend and
frontend both quietly act as though they are the real contract owner, and the
system continues functioning mostly because neither side changes fast enough to
expose the fiction every day.

The backend-owned contracts workstream in homelab-analytics is interesting
because it refuses that arrangement directly.

The backend exports the canonical route and publication contracts. The frontend
consumes generated artifacts from those exports. CI distinguishes stale exports
from stale derived TypeScript output. Release bundles carry the compatibility
summary so reviewers can inspect actual contract drift instead of inferring it
from a pile of unrelated diffs.

That sounds like a codegen story, but the useful part is not really code
generation. The useful part is giving the frontend fewer ways to be politely out
of date.

Once the backend is the source of truth, the question becomes simpler. Either
the committed exports match what the backend says today, or they do not. Either
the derived frontend artifacts match the committed exports, or they do not. That
is already an improvement over the usual low-grade confusion where someone says
"the types are current" and someone else means a different set of generated
files entirely.

The handover note is good because it describes what shipped without pretending
the change is only a build-system detail. Typed transport helpers replaced
handwritten `any`, semantic publication schemas became part of the exported
surface, renderer discovery moved under backend ownership, and extension packs
had to validate through the same contract path as built-ins.

That last part matters. A lot of contract systems are strict for the core app
and mysteriously permissive at the edges where plugins or extension packs enter.
This one seems to be trying not to make that mistake.

What I also like is that the repo treats generated artifacts as reviewable
surface, not private build debris. That is usually the point where people start
complaining about noisy diffs, which is fair enough. But the alternative is
worse: letting drift accumulate until somebody discovers that the frontend has
been speaking to a version of the backend that only existed in its imagination.

There is a trade-off here. Backend-owned contracts make the backend team, or in
this case the backend side of one repo, more responsible for the health of the
consumer surface. That is the right burden, but it is still a burden. Once you
own the contract, you also own the discipline of exporting it, classifying its
changes, and making the release story legible.

That is why I think of this less as a type-safety note and more as a drift note.
The goal is not really to have prettier generated code. The goal is to remove
the quiet ambiguity about who is allowed to define what the API and publication
surface currently are.

`[TODO: clarify whether there were concrete incidents of frontend/backed drift
before this workstream, or whether the design was mostly preventative.]`

Either answer would still make the note worthwhile. Preventing a predictable
class of nonsense before it becomes expensive is a respectable use of effort.

In the meantime, the practical rule is simple enough: if the backend owns the
contract, then export it, check it, bundle it, and stop asking the frontend to
carry a private copy of reality.