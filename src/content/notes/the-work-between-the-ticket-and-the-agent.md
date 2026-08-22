---
title: The work between the ticket and the agent
role: exploration
status: exploration
lifecycle: current
area: agent workflow
published: 2026-07-19
lastRevised: 2026-07-20
projects:
  - vuoro
relates:
  - the-missing-layer-is-binding-not-intelligence
  - the-coordinator-never-touches-the-repo
  - the-second-operator-is-the-test
  - where-the-assurance-questions-are-already-answered
  - a-field-guide-to-assurance-managed-ai-development
terms:
  - term: Vuoro
    definition:
      The public label for this family of small, separately owned agent-workflow
      tools.
  - term: sprintctl
    definition:
      The CLI and schema that own sprint work, dependencies, claims, and
      handoffs.
  - term: kctl
    definition:
      The read-only pipeline that turns reviewed sprint history into durable
      knowledge.
  - term: agent-cockpit
    definition:
      The operator interface that composes state from the owning tools without
      becoming their database.
tags:
  - agents
  - workflow
  - coordination
summary:
  Work-management systems can delegate and coding agents can execute, but
  authority, attempts, evidence, and acceptance still have no obvious neutral
  owner between them.
explorePrompt: >-
  Use this note as a dated survey with its assumptions tested, not a market map
  to trust. The transferable question: across the systems that delegate work,
  execute it, and observe it, which one owns the record binding who authorized
  an attempt, what it owned, what survived a handoff, what evidence belongs to
  it, and who could declare it complete? The worked survey found edges rather
  than a centre: work management begins at the item, git hosting at the pull
  request, agent-native tools at the dependency graph, workspaces at the pool of
  workers, observability inside the run. It tested two assumptions and kept one.
  The claim that three independent systems had converged on execution authority
  not being completion authority was cut, because the local tool's own
  claim-proof path can close an item; that was projecting a multi-operator
  design onto a single-operator implementation. The split into an externally
  owned work plane, a neutral execution plane, and a pluggable runtime survived,
  as an assessment rather than a standard, and a note that observability
  receives identifiers rather than becoming a fourth authority. The middle is
  weakly occupied, not empty; established supply-chain attestation work covers
  much of it. Apply the question to your own toolchain. Say where your
  constraints diverge -- a single operator, one vendor owning several planes,
  regulated attestation already in place. Produce the record you can reconstruct
  today and the assumption you had to cut.
---

No build intent. The analysis is the product.

> **Update, 2026-07-20.** "Weakly occupied middle" should not be read as an
> unclaimed conceptual layer. It overlaps requirements traceability, workflow
> provenance, separation of duties, assurance evidence, and
> software-supply-chain attestations — see
> [in-toto](https://in-toto.io/docs/getting-started/) and
> [SLSA](https://slsa.dev/spec/v1.2/) for established, operational versions of
> the same binding. A tracker-independent attempt record may still be useful
> local tooling; usefulness is not evidence the industry lacks the concept. See
> [Where the assurance questions are already answered](/notes/where-the-assurance-questions-are-already-answered/)
> and
> [A field guide to assurance-managed AI development](/notes/a-field-guide-to-assurance-managed-ai-development/).

Work-management systems are admitting agents. Coding-agent systems are taking
over the branch-to-pull-request loop. Agent-native tools are growing their own
task graphs, worker identities, handoffs, and merge machinery. Observability
products can explain a run in detail. The weakly occupied part is the binding
between those systems: who authorized an attempt, what it owned, what survived a
handoff, what evidence belongs to it, and who could declare the work complete.

This survey starts from the implemented scope in [Vuoro](/projects/vuoro/): one
operator, several workers, schema-owned sprint state, proof-bearing claims,
resumable handoffs, a separate execution queue, and a cockpit that composes read
surfaces without becoming their write authority. The question is what that
system would meet if its operator boundary were removed.

It tests two working assumptions. First: Linear's assignee/delegate split,
GitHub's agent-to-pull-request loop, and sprintctl's claim model independently
converged on the same rule — permission to execute work is not permission to
declare it complete. Second: the landscape separates cleanly into an externally
owned work plane, a neutral execution plane, and a pluggable runtime plane, with
observability beside them rather than inside any one plane. These are hypotheses
to test, not facts supplied by the sources.

## The market has edges, not a centre

**Assessment:** the products are not converging into one category. They are
extending from different sources of authority.

| Edge                       | Verified mechanism                                                                                                                                                                                                                                                             | Boundary visible from the source                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Work management            | [Linear](https://linear.app/docs/assigning-issues) keeps one human assignee responsible while an agent is a separate delegate.                                                                                                                                                 | **Assessment:** Linear owns accountability and delegation, not the agent's internal execution protocol.               |
| Extensible work management | [Plane](https://developers.plane.so/) exposes work items and projects through a REST API, real-time webhooks, OAuth apps, MCP, and an agent extension path using signals, webhooks, and the API.                                                                               | **Assessment:** Plane is already the place to integrate with work management, not a reason to recreate it.            |
| Git-hosted agent work      | [GitHub](https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents) can give an issue or prompt to supported third-party agents; the agent works asynchronously, creates a pull request, requests review, and can iterate from pull-request comments. | The documented outer loop ends in review. The agent's internal attempt state remains outside this page's contract.    |
| Agent-native task graph    | [Beads](https://github.com/gastownhall/beads) stores a dependency-aware issue graph, derives ready work, atomically claims an item by setting its assignee and status, and closes it when done.                                                                                | Its public unit is the graph item. Claim and completion remain operations on that item.                               |
| Agent workspace            | [Gas Town](https://github.com/gastownhall/gastown) assigns Beads work to several supported runtimes, tracks worker health and handoffs, and passes completed branches through verification and a merge queue.                                                                  | It owns a multi-agent workspace and execution loop rather than acting as a neutral overlay on somebody else's loop.   |
| Runtime observability      | [AgentOps.ai](https://docs.agentops.ai/v2/concepts/core-concepts) builds traces from sessions, agents, tools, and operations on OpenTelemetry; its dashboard exposes the resulting execution record.                                                                           | **Assessment:** a trace can explain what ran without deciding whether the underlying work was authorized or accepted. |

**Assessment:** the table is uneven because the market is uneven. Linear and
Plane begin with the work item. GitHub begins with the repository and pull
request. Beads begins with persistent agent memory and a dependency graph. Gas
Town begins with a workspace full of workers. AgentOps.ai begins inside the run.

**Assessment:** coding-agent vendors increasingly own execution between prompt
and pull request, while work-management vendors increasingly own the delegation
that starts it. The primary sources establish the mechanisms above; they do not
establish market share, maturity, inevitability, or a settled category.

## The unclaimed record

A ticket can say who is responsible. An agent session can say what the model and
tools did. A pull request can carry the proposed change and review. None of
those records necessarily owns the whole attempt.

**Assessment:** the weakly occupied middle is not another board and not another
agent launcher. It is a durable record of execution authority:

- the work item and revision that justified the run
- the principal or policy that authorized it
- the temporary claim and concrete attempt
- the branch, pull request, tests, traces, and handoff attached to that attempt
- the submission and the separate acceptance decision

“Weakly occupied” is deliberately narrower than “empty.” Beads binds claims to
its own graph. Gas Town binds assignment, worker state, monitoring, and merge
inside its own workspace. GitHub binds supported agents to issues and pull
requests. **Assessment:** what remains weak is a neutral contract that can
survive replacing both the tracker and the runtime while preserving the causal
record between them.

## What survives removing the product

The product being removed here is the hypothetical neutral execution layer
described above: the system that would bind authorization, attempts, evidence,
and acceptance without owning either the backlog or the worker. The point of
removing it is to keep only conclusions that remain useful without a build.

The first assumption does not survive intact.

Linear explicitly separates the accountable assignee from the executing
delegate. GitHub has an agent produce a pull request and request review rather
than treating generated code as accepted work. Those are two independent
instances of execution authority not being completion authority.

Sprintctl was supposed to be the third instance. It is not one. The current
[sprintctl workflow](https://github.com/bayleafwalker/sprintctl) includes
`item done-from-claim`: valid claim proof can move the item to done and release
the claim. Its accepted/rejected authority decisions govern whether proposed
commands take effect; they are not a second person's acceptance of completed
work. The three-way convergence claim came from projecting a possible
multi-operator design onto an implemented single-operator system. It is cut.

> **Update, 2026-07-19.** Sprintctl subsequently added retained PostgreSQL claim
> history and a lineage `lease_epoch`. The
> [retention note](https://github.com/bayleafwalker/sprintctl/blob/80aaa9782cb51fde6d645b6225c2b4be1b285b5c/docs/verification/claim-history-retention.md)
> records expired remote claims instead of deleting them; the
> [epoch note](https://github.com/bayleafwalker/sprintctl/blob/80aaa9782cb51fde6d645b6225c2b4be1b285b5c/docs/verification/lease-epoch-schema.md)
> says explicitly that no fencing enforcement exists yet. Both improve the
> execution record. Neither changes `done-from-claim`, so the rejected
> completion-authority assumption remains rejected.

The second assumption survives, but as an assessment rather than a discovered
standard:

1. The **work plane** is externally owned. Linear, Plane, GitHub, or another
   tracker holds requirements, priority, discussion, and accountable ownership.
2. The **execution plane** binds authorization, claims, attempts, handoffs,
   evidence, submission, and acceptance without becoming the backlog.
3. The **runtime plane** is pluggable. A coding agent, local process, or queued
   worker performs the attempt.

Observability sits alongside these planes. It receives stable identifiers from
them and explains a run; it does not become a fourth authority that decides why
the work existed or whether it counts as complete. **Assessment:** this split is
useful because each plane can change vendors without forcing the others to
reinterpret their own state.

> **Update, 2026-07-19.** The naming collision was resolved after this survey.
> [Vuoro](https://github.com/bayleafwalker/kctl/blob/c831aa016bdf117310fc66c12e8c2e63d2162155/docs/decisions/2026-07-19-ecosystem-public-label.md)
> is now the public ecosystem label. `agentops` remains an implementation
> repository and `agent-cockpit` remains the UI name; AgentOps.ai remains the
> unrelated observability product in the landscape above.

## What generalization would require

**Assessment:** generalizing the implemented single-operator scope would require
authenticated human and service principals, project-scoped authorization,
retained claims plus auditable attempts, and an acceptance operation distinct
from a worker's claim; tracker, Git, runtime, and trace adapters would carry
stable IDs without taking over their source systems. That sentence describes the
pressure, not a plan. There is no intent to build it.

## Sources and model boundary

The external anchors are deliberately few and primary:

- [Linear: Assign and delegate issues](https://linear.app/docs/assigning-issues)
  for the assignee/delegate distinction
- [GitHub: About third-party coding agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents)
  for the issue-or-prompt to pull-request and review loop
- [Plane developer documentation](https://developers.plane.so/) for its API,
  webhook, OAuth, MCP, self-hosting, and agent-extension surfaces
- the [Beads](https://github.com/gastownhall/beads) and
  [Gas Town](https://github.com/gastownhall/gastown) repositories, read
  directly, for their declared task-graph and workspace mechanisms
- the [sprintctl repository](https://github.com/bayleafwalker/sprintctl) and the
  [local project page](/projects/vuoro/) for the implemented single-operator
  comparison
- [AgentOps.ai core concepts](https://docs.agentops.ai/v2/concepts/core-concepts)
  only to establish the observability category and disambiguate the name

This note began as two model-generated working memos. They supplied search terms
and the two assumptions stated near the beginning; they are process artifacts,
not evidence, and a reader does not need them to evaluate the note. Product
comparisons, category boundaries, the “weakly occupied middle,” the three-plane
split, vendor-independence claims, and implications for a neutral protocol are
assessments. No claim about market leadership, adoption, pricing, enterprise
readiness, or an unverified vendor feature was retained. Sources were checked on
2026-07-19. All links omit tracking parameters.

Remove the proposed product and one useful question remains: which system can
prove that a run was allowed to begin, and which different system can say that
its result was enough?
