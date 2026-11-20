---
title: "Vuoro: governed work without a cockpit-shaped monolith"
summary: >-
  Vuoro keeps work identity, evidence and acceptance intact when an agent is
  replaced. Public source offers a disposable settlement evaluation and a dated
  cross-harness case; current hosted operation remains unverified here.
published: 2026-04-09
lastRevised: 2026-11-20
revisionSummary: >-
  Replaced the retired cockpit as the main account with the local settlement
  workflow, current source owners and a bounded recorded handoff; preserved
  historical evidence and its limits.
lastVerified: 2026-11-20
draft: false
project: vuoro
kind: engineering
status: Local evaluation and recorded handoff; hosted state unverified
featured: true
repoUrls:
  - https://github.com/bayleafwalker/vuoro
  - https://github.com/bayleafwalker/sprintctl
  - https://github.com/bayleafwalker/sovite
  - https://github.com/bayleafwalker/agentops
externalUrl: https://vuoro.cloud/
evidence:
  capability: >-
    Public source supplies a disposable settlement consumer, separately owned
    work and execution contracts, and revision-bound documentation retrieval. A
    public October record describes one accepted hosted-to-native handoff and
    protected evidence publication.
  latest: >-
    Source checked 20 November: service 0.1.106 is a release-preparation
    candidate. The optional demo deliberately pins older client 0.1.2, service
    0.1.97 and Sprintctl 0.22.0 artifacts for its evaluation.
  proofLinks:
    - label: Pinned settlement demo and prerequisites
      href: https://github.com/bayleafwalker/vuoro/blob/b0066ec139943316c6ccf7d16bb88e5bd9b1f2a6/packages/vuoro-demo/README.md
    - label: Dated hosted-to-native case and capture limits
      href: https://github.com/bayleafwalker/agentops/blob/891d07113323c81589e751bf2e6dad76e4de565c/docs/evidence/2026-10-09-mi1-bindery/README.md
    - label: Current service candidate and migration boundary
      href: https://github.com/bayleafwalker/vuoro/blob/b0066ec139943316c6ccf7d16bb88e5bd9b1f2a6/packages/vuoro-service/README.md
    - label: Execution-owner source and hosted limits
      href: https://github.com/bayleafwalker/sovite/blob/2e2bf52c945819cd8fd710af58c8e22398239c57/README.md
    - label: Accepted delivery scope and later amendments
      href: https://github.com/bayleafwalker/vuoro/blob/b0066ec139943316c6ccf7d16bb88e5bd9b1f2a6/docs/plans/2026-10-17-product-delivery-plan.md
  integrations:
    - Sprintctl work contracts
    - Sovite execution contracts
    - PostgreSQL
  knownLimitation: >-
    This review inspected public source and ran one local documentation search.
    It did not rerun settlement, inspect private provider captures, query a
    hosted service or verify a deployed release. The recorded handoff is one
    bounded case, with incomplete capture and no comparative cost result.
  nextProof: >-
    Qualify a current installed workflow against a real domain objective,
    preserve an interrupted operation and its recovery, then record the accepted
    result, later consequence and operator burden.
tags:
  - agents
  - workflow
  - cli-tooling
terms:
  - term: Vuoro
    definition:
      The portable work, evidence and acceptance contracts composed from
      separately owned workflow tools.
reference:
  purpose: current-project-orientation
  discoverFor:
    - evaluating takeover and stale-result refusal in a disposable local
      workflow
    - locating the current work, knowledge and execution owners
    - inspecting a dated hosted-to-native handoff without inferring live
      readiness
  establishes:
    - that public source supplies an isolated local settlement evaluation with
      explicit prerequisites and negative controls
    - that a public evidence record describes one bounded cross-harness handoff
      and protected publication, while retaining capture gaps
  doesNotEstablish:
    - current hosted deployment, installed versions or resource-owner
      qualification
    - whole-estate capture coverage, general model quality or comparative cost
      savings
  supplementWith:
    - current release and runtime observations before relying on an installed
      workflow
    - actual domain outcomes and operator effort before attributing value to the
      composition
---

## One work item, including failure

An agent has produced a patch and then disappears. Its successor needs to find
that exact patch, establish which checks still apply, and finish the work
without letting a late predecessor settle it again. A dependent task must stay
blocked until the work owner accepts the result.

That is the smallest useful entrance to Vuoro. Sprintctl owns work and its
acceptance decision. Vuoro composes the contracts and retained evidence. Native
harnesses, or Sovite's installed execution service, do the execution. A
completed worker process and an accepted work item remain separate events.

## What can be inspected or used now

| Scope                  | Public entry point                                                                                                                                                                                                                                  | What it establishes                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local evaluation       | The [disposable settlement consumer](https://github.com/bayleafwalker/vuoro/blob/b0066ec139943316c6ccf7d16bb88e5bd9b1f2a6/packages/vuoro-demo/README.md) has an install recipe, prerequisite check, receipt output and deliberate failure controls. | A route to run the scripted scenario on an owned local database. Its source availability is not a fresh test-pass receipt.                                 |
| Recorded real work     | The [9 October handoff record](https://github.com/bayleafwalker/agentops/blob/891d07113323c81589e751bf2e6dad76e4de565c/docs/evidence/2026-10-09-mi1-bindery/README.md) links the public report and merged changes.                                  | A bounded published account of hosted-to-native continuation and protected evidence publication. Raw provider captures remain private.                     |
| Source implementation  | Current work adapters, workspace storage, documentation retrieval and Sovite execution interfaces are in the pinned repositories below.                                                                                                             | Inspectable implementation; installation and live qualification must be checked separately. Service 0.1.106 is explicitly a release-preparation candidate. |
| Intended outcome       | The amended delivery plan requires a real domain improvement, recoverable operation and measured operator burden.                                                                                                                                   | Accepted delivery scope, with qualification gates still attached.                                                                                          |
| Historical composition | The former AgentOps cockpit and its earlier system map survive in the historical record below.                                                                                                                                                      | Earlier design and dated operations, with no claim of present availability.                                                                                |

The [hosted pilot](https://vuoro.cloud/) and the
[interactive showcase](https://demo.vuoro.cloud/) are separate entry points. A
walkthrough or a source repository does not establish an installed workflow.

## Inspect the local settlement workflow

The demo's
[pinned guide](https://github.com/bayleafwalker/vuoro/blob/b0066ec139943316c6ccf7d16bb88e5bd9b1f2a6/packages/vuoro-demo/README.md)
requires Python 3.12+, PostgreSQL 16 tools, Git and a non-root Unix user. It
starts a private temporary database and loopback service; it accepts no
production database URL or cloud credentials. The demo pins Vuoro client 0.1.2,
Vuoro service 0.1.97 and Sprintctl 0.22.0. Service 0.1.106 is the separately
inspected release-preparation candidate.

The scenario follows one work item and its dependent:

1. A caller creates work X and dependent Y, reserves an exact release, and
   records a Git artifact.
2. A fixture verifier checks that artifact. Artifact acceptance alone leaves X
   unsettled and Y blocked.
3. The caller's process is killed. A new caller cannot take over until the work
   owner considers the first lease stale.
4. The successor takes over. The predecessor's late result is refused while its
   payload is retained.
5. The successor supplies the required checks. The work owner's decision settles
   X and permits Y to proceed.
6. The receipt records the operations, expected refusals and cleanup outcome.
   Success requires confirmed shutdown of the owned service and database.

The guide includes controls for omitted verification, an omitted required check
and a wrong artifact digest. Those runs must finish as incomplete. The scenario
uses scripted participants and local evaluation identities. It does not test
commercial harnesses, a database crash or a production rollout.

## What the recorded handoff actually showed

The public
[MI-1 case](https://github.com/bayleafwalker/agentops/blob/891d07113323c81589e751bf2e6dad76e4de565c/docs/evidence/2026-10-09-mi1-bindery/README.md)
records a different exercise. A hosted Claude assessment became a public Git
handoff. A fresh native Codex session continued from that artifact without the
predecessor's private conversation, corrected claims and ran targeted tests. The
report documented a case where changing the decision procedure left its
advertised implementation hash unchanged.

The case then published the exact report through a separately authorized
verifier and applier. The record describes refusals for stale or missing proof,
an interruption after branch publication, and recovery that reused that branch.
Its public links identify the report and resulting merges. The raw captures and
owner checkpoints were not re-inspected for this page.

Capture was incomplete even in this narrow case: two of three run records were
reconstructible, while its single effect was reconstructible. The original
vendor-comparison track was retired; it produced no comparative cost, quality or
operator-time result. Those limits prevent this case from becoming a claim about
all work or today's installation.

## Current source status (2026-11-20)

The current owners differ from the old cockpit account:

- **Sprintctl** retains work lifecycle and acceptance authority. The service
  composes its released adapter rather than writing around it.
- **Vuoro workspace** owns reviewed knowledge and versioned artifacts.
  **vuoro-knowledge** resolves Git-authored documentation and binds retrieved
  sources to revisions. The two stores have different authority; retired kctl is
  historical migration input.
- **Sovite** owns configured execution, admission and result access. Its current
  source distinguishes standalone operation from workspace-hosted composition;
  hosted end-to-end acceptance is held, and repository execution remains an
  opt-in source path.
- **AgentOps** holds shared guidance, reporting and cross-repository plans. Its
  former cockpit source was removed. ActionQ's earlier execution plane and
  actionq-dispatch are historical, rather than the recommended worker path.

This review used these immutable public snapshots:

| Repository | Revision                                                                                               | Material inspected                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Vuoro      | [`b0066ec`](https://github.com/bayleafwalker/vuoro/commit/b0066ec139943316c6ccf7d16bb88e5bd9b1f2a6)    | Demo implementation and tests, package pins, service candidate, workspace and knowledge contracts, amended delivery plan |
| AgentOps   | [`891d071`](https://github.com/bayleafwalker/agentops/commit/891d07113323c81589e751bf2e6dad76e4de565c) | Current owner descriptions, cockpit retirement and the MI-1 public evidence record                                       |
| Sovite     | [`2e2bf52`](https://github.com/bayleafwalker/sovite/commit/2e2bf52c945819cd8fd710af58c8e22398239c57)   | Current execution workflows, operating modes and unqualified repository-execution boundaries                             |

The source CLI was invoked directly at that Vuoro revision with Python 3.12.14
and PyYAML 6.0.3:

```sh
PYTHONPATH=packages/vuoro-knowledge/src python -c \
  'from vuoro_knowledge.cli import main; raise SystemExit(main())' \
  search 'work settlement' --root .
```

It returned 38 matches with source revision and blob identities. This checks one
local retrieval path. The settlement demo, private handoff captures and hosted
services were not exercised in this review. The date above records source
inspection and that local check; it does not refresh the older runtime
observations.

## Historical architecture and communication paths

The earlier composition used local, remote and served paths around Sprintctl,
kctl, ActionQ, Auditctl and an AgentOps cockpit. The cockpit projected the
owners' records and submitted operations through their interfaces. It did not
own their databases. The
[earlier account and diagrams](https://github.com/bayleafwalker/kotona.app/blob/f9f9bb336a8ad7f4b2e995d43d3fde806ecac7b7/src/content/projects/vuoro.md)
remain available at their published revision.

### Historical operating snapshot (last verified 2026-09-07)

That account recorded a schema-5 preflight refusal, the later service 0.1.52
work-schema-v12 cutover, and service 0.1.59 observed on 1 September. Its cockpit
screenshot showed the interface then in use. None of those versions, screenshots
or operating statements describe a currently verified deployment. The October 17
source review subsequently recorded the cockpit's removal.

## Open edges

The next useful proof is a current installed workflow serving an actual domain
objective: retain the result through an interruption, reconstruct why it was
accepted, and observe what happened afterwards. Record operator interventions,
time and maintenance alongside the achieved result. A successful settlement
protocol does not by itself establish that the work was useful or cheaper.

Release, installation, current authorization, recovery and domain outcome remain
separate checks. The amended delivery plan lets independent implementation work
continue while preserving the qualification gates for each supported workflow.
