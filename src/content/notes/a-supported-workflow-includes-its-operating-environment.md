---
title: A supported workflow includes its operating environment
role: exploration
status: prospective
lifecycle: current
area: agent architecture
published: 2026-11-05
lastRevised: 2026-11-05
projects:
  - vuoro
relates:
  - what-the-subprocess-was-doing-for-free
  - why-production-access-changes-the-shape-of-agent-tooling
  - the-context-window-is-not-the-continuity-boundary
  - authority-must-travel-with-the-action
  - an-idempotency-key-is-not-a-business-invariant
draft: false
tags:
  - agents
  - workflow
  - environments
  - recovery
  - service-operations
summary: >-
  Supporting an agent workflow means supplying its execution environment,
  resource access, verification and recovery. An October target architecture
  separates component releases, qualified distributions and the operated
  service.
explorePrompt: >-
  Determine what a service must own when it promises to carry a workflow through
  to a usable outcome. The worked target architecture distinguishes a component
  release, an immutable qualified composition and an operated service. Its
  support boundary includes execution, state retention, permitted resource
  access, trusted acceptance, interruption recovery and intelligible stopping
  points. Workbench, task, acceptance and preview have different containment
  requirements even when they share infrastructure. Private resources retain
  local admission and output-release control; routine standing authorization and
  administration have separate scopes. Apply the question to a materially
  different workflow and identify where these constraints diverge. An ordinary
  local harness may already satisfy the need, and extra service machinery must
  earn its maintenance cost. Produce the smallest supported composition, its
  ownership and environment table, its recovery obligations and one integrated
  qualification scenario. Include a lost worker, unavailable private resource
  and independently reconstructed result. Distinguish hypothetical design, local
  fixture evidence and installed-service evidence. Say what observation would
  justify removing a layer or narrowing the support promise.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - deciding what an operated agent workflow must actually support
    - separating a component release from a qualified agent-service composition
  establishes:
    - a proposed service boundary and interruption-based qualification test
    - why execution, verification, resource access and recovery belong in
      support scope
  doesNotEstablish:
    - installation or qualification of the proposed hosted service
    - that every repository workflow needs a managed platform
  supplementWith:
    - current component releases, commissioned environments and owner evidence
---

An agent can produce a good patch and still leave the user with the rest of the
job: find somewhere to run it, recover the candidate after the worker vanishes,
rebuild the tests, locate the credentials and work out whether the timed-out
operation committed. Each component may have done what it advertised. The
workflow remains the user's integration work.

**Working model.** A service that offers to carry a workflow through should own
the supported composition that makes the outcome possible: environment,
execution, permitted resource access, verification, retained evidence and
recovery. The component contracts remain independently useful outside that
service.

This is the target I accepted on 29 October for Vuoro, my collection of
separately owned agent-workflow components. The
[accepted implementation programme](https://github.com/bayleafwalker/agentops/blob/b3e9241e4775a1ad5297af9b446252ca5e0c9681/docs/plans/agentops/2026-10-29-operated-agentic-service.md)
records source and local proofs separately from installation and service
qualification. This note explains the proposed support boundary.

## Three different things can be released

A component release supplies one implementation. A work system may correctly
track claims; an execution system may correctly manage attempts. Neither fact
establishes that the versions installed together can finish a supported task.

A distribution names an immutable composition: component versions, workflow
revisions, environment profiles, external requirements and qualification
evidence. Its useful promise is that the declared combination has passed its
stated lifecycle tests. Listing compatible-looking versions is preparation for
that promise.

An operated service commissions the composition and owns its ongoing diagnosis,
availability and recovery. The user should receive a coherent account of a
failure across components. Asking them to discover which repository owns it
hands the integration work back.

These layers allow the same contracts to support a hosted implementation and a
self-hosted reference. Moving between them still requires qualified export,
restore and continuation; a shared file format alone establishes none of those.

## Give each environment one purpose

The October design distinguishes four purposes:

| Environment    | What it needs to preserve or contain                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| Workbench      | Durable editing state, authenticated attachment and recoverable candidate work.      |
| Task execution | One admitted attempt, scoped tools, bounded resources and attributable results.      |
| Acceptance     | A trusted verification basis outside the candidate's writable scope.                 |
| Preview        | A bounded way to inspect the candidate without acquiring control-service privileges. |

Those purposes need not imply four products or four machines. They do require
separate state, credential, network and retention rules. Putting implementer and
verifier in one workspace VM does not establish independence between them.

For one local repository, an existing harness and executable checks may already
provide the required environment. The larger composition earns its cost when
work crosses hosts, private resources or persistent service boundaries and the
operator repeatedly has to reconstruct it.

## Private resources retain an owner

The first proposed deployment is hybrid: an external service for interaction and
durable coordination, isolated execution infrastructure, and a gateway
controlled by the owner of the private resources. The gateway admits named
operations under current local policy and returns attributable observations or
effect records.

A request arriving from the public service does not grant access to the LAN. The
resource owner selects the catalog, target scope, credentials and permitted
output. Administration changes trust, enrollment, policy or recovery authority
through a separate identity, session, credential and network lane. Routine work
can proceed under commissioned standing authorization.

Data movement needs its own check. A tool can execute locally while sending its
result into an external model's context. Execution location, inference location,
artifact storage and telemetry are separate parts of the chosen data profile.
Output restrictions must apply before restricted bytes enter the external
context.

The gateway must also survive enough of an application-cluster outage to report
what failed. A separate VM name proves little if its DNS, journal and credential
recovery all depend on the cluster it is supposed to diagnose.

## Interruption belongs in the normal workflow

The service cannot define support only for a worker that remains alive until the
final response. It needs an exact candidate, a record of outstanding operations
and a successor that can obtain the permitted continuation state.

Replacing a worker does not prove that its target requests stopped. Reconcile
the predecessor or use a destination protocol whose retry is safe across the
remaining possible histories. A stale predecessor must lose the ability to
settle work and to perform further protected operations at the boundaries that
can enforce it.

Some workflows will still stop. A useful stopping point includes the retained
candidate, verified state, unknown effects, the missing prerequisite and the
next permitted step. Recording an unresolved outcome makes the failure usable;
it does not turn it into success.

## The first proof should cross the whole composition

The programme's first integrated demonstration starts from a fresh browser
without a personal workstation dependency. It runs a small repository change,
uses the gateway for a scoped private-resource observation, retains the
candidate, interrupts the worker and continues on an eligible successor. Clean
acceptance then verifies the exact candidate, and integration records what
actually landed.

An independent reader should reconstruct the objective, source, actors,
operation status, verification and acceptance without predecessor chat. Denied
cross-tenant access, stale settlement, unavailable capture and lost responses
belong in the test population alongside successful runs.

Local fixtures already exercise parts of this design. The cited programme
explicitly says they do not qualify the installed service. The first meaningful
result is the same released composition completing and recovering the declared
workflows under its actual resource and identity boundaries.

## Where the model could lose

A supported composition creates maintenance work: compatibility, commissioning,
evidence retention, restore procedures and support across owners. A small local
workflow may finish more reliably with an ordinary harness and fewer moving
parts. A reference distribution that nobody can install or recover is another
source tree the operator has to understand.

My current test is functional. Does the composition let the operator carry real
work through interruption with less reconstruction, while keeping the limits
visible? Until the integrated demonstration supplies that evidence, this is a
service design with a qualification target.
