---
title: Layering you can't violate by accident
role: operating
status: guiding
lifecycle: current
area: software architecture
published: 2026-06-10
lastRevised: 2026-09-07
projects:
  - household-operating-platform
relates:
  - the-coordinator-never-touches-the-repo
terms:
  - term: homelab-analytics
    definition:
      The household data and decision platform that owns long-lived semantics,
      scenarios, policies, and approvals.
tags:
  - architecture
  - contracts
summary:
  homelab-analytics enforces its named layer seams with pytest. A documented
  architecture is a request; a tested one is a constraint — and the note now
  shows a violation failing, plus where the check stops.
explorePrompt: >-
  Use this note as a worked instantiation, not a rule to copy. The transferable
  question: which architectural constraints in your system survive being edited
  by an actor with no memory of why they exist, and what would it take to move
  the rest into that category? The worked case is a modular monolith whose
  packages are sorted into strata by rate of change, with the layer boundaries
  enforced as ordinary tests that fail the build when an import crosses in the
  wrong direction. The stated motivation is agentic editing: a wrong-direction
  import is the classic plausible change -- it works, it is local, and it is
  exactly how a layered codebase rots into a connected one -- and a contract
  test is the reviewer that never decides the violation is fine this once. A
  documented architecture is a request; a tested one is a constraint. Apply the
  question to a codebase you maintain. List the boundaries you currently rely on
  people absorbing from directory names or review habit, and say which could be
  expressed as a mechanical check today. Name where your constraints differ -- a
  language without inspectable imports, boundaries that are semantic rather than
  structural, a team that would experience the check as an obstacle. Produce the
  checks you would add and the ones you concluded cannot be mechanised, with the
  reason.
---

homelab-analytics is a modular monolith — FastAPI, a worker, a Next.js frontend,
one repo — with its packages sorted into four strata by rate of change: kernel,
semantic engine, product packs, surfaces. The kernel changes rarely and
deliberately. Product packs churn freely. The strata exist so that things which
change together live together, and things which change at different speeds meet
only through declared seams.

None of that is novel as a diagram. The part that earns a note is that the
boundaries are tests. Architecture-contract tests run in the ordinary pytest
suite and fail the build when an import crosses strata in the wrong direction —
a product pack reaching into another pack's internals, a kernel module depending
downward on a surface. The architecture is not a convention the team agrees to,
partly because there is no team. It is a red test.

The honest motivation is agentic editing. A large share of the changes in this
repo are built by dispatched agent sessions against a spec, and agents generate
plausible-looking imports faster than review reliably catches them. A
wrong-direction import is the classic plausible change: it works, it's local,
and it's exactly how a layered codebase rots into a connected one. The contract
test is the reviewer that never gets tired and never decides the violation is
probably fine this once. The agent gets immediate, mechanical feedback inside
its own session, which is also the cheapest possible place to fix the mistake.

## What a violation looks like

The checks are ordinary pytest, reading imports off the AST of named modules.
The rule that the pipeline layer must not reach up into the applications is one
assertion:

```python
def test_transformation_service_does_not_import_application_or_reporting_modules():
    imports = _import_names(ROOT / "packages" / "pipelines" / "transformation_service.py")
    assert not any(name.startswith("apps") for name in imports)
```

Add one wrong-direction import — the pipeline module borrowing a function that
happens to live in an API route:

```python
# packages/pipelines/transformation_service.py
from apps.api.routes.report_routes import build_monthly_report
```

and the suite fails in red, before review, in exactly this form:

```text
>       assert not any(name.startswith("apps") for name in imports)
E       assert not True

FAILED test_architecture_contract.py::test_transformation_service_does_not_import_application_or_reporting_modules
```

The corrected dependency points the other way: the route calls the reporting
service the pipeline layer already publishes, and the pipeline module never
learns the route exists. The failure message is not eloquent, but it does not
need to be — the module name and the rule name say which seam was crossed and in
which direction.

## Where the check stops

The suite is not a generic import linter over the whole tree, and saying so
plainly is part of the contract. A handful of directory-wide direction rules are
enforced everywhere they apply — product packs must not import from the
applications or adapters, the kernel must not import from the packs. Everything
else is a named seam: the imports of one specific module, one forbidden prefix
list, one string-level contract in one application file. A module pair nobody
wrote a test for is still only a convention — the one known sibling-pack
violation is recorded in the stratum map's prose, not asserted in code — the
transitional pipeline layer has no directory-wide rule at all, and a boundary
that is semantic rather than structural (which data a query may touch, which
service may perform an effect) is outside what an import scan can see. The green
run proves the tested seams hold; the strata diagram beyond them is still a
request.

The checks catch real drift, not only injected examples: one read-path function
returning a platform type from inside the pipeline layer forced the kernel to
import downward, failed the direction rule, and moved to the platform package —
with the extracted placement rule written down beside the fix.

A deliberate architectural change is therefore not a test failure to suppress
but one edit with several parts: the move itself, the same change updating the
contract test, and the classification doc that records why the boundary sits
where it does — reclassifications require at minimum a decision record. The
suite's own comment trail shows the pattern: when asset pipelines moved into the
finance domain, the assertions moved with them, and one kernel-adjacent helper
is recorded as deliberately mixed rather than silently tolerated.

This is the executable version of a line from the about page — boundaries that
can survive iteration. Surviving iteration turns out to mean surviving iteration
by actors with no memory of why the boundary exists. A human contributor might
absorb the layering from the directory names. A fresh agent session will not,
and shouldn't have to: the constraint is in CI, where it binds regardless of who
is editing or what they understood.

The evidence requirement is satisfied the same way everything else here is
supposed to be: by repo output. The claim that the tested seams hold is not an
assertion in a README. It's a green test run, and a future violation of any
inspected boundary arrives pre-announced, in red.
