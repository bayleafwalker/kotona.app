---
title: Where agent tooling fits after “agent” stops helping
seoTitle: "Where agent tooling fits: a 2026 responsibility map"
socialTitle: Where agent tooling fits
role: synthesis
status: guiding
lifecycle: current
area: agent infrastructure
published: 2026-09-01
lastRevised: 2026-09-01
projects:
  - vuoro
relates:
  - why-production-access-changes-the-shape-of-agent-tooling
  - a-platform-capability-does-not-exist-all-at-once
  - a-field-guide-to-assurance-managed-ai-development
  - a-personal-knowledge-system-that-happens-to-render-as-a-website
draft: false
tags:
  - agents
  - harness-engineering
  - workflow
  - tooling
  - references
summary:
  A dated map of agent-system tooling by the responsibility it primarily owns,
  beginning with the Markdown-and-skills setup that is enough until a specific
  failure earns another layer.
explorePrompt: >-
  Use this note as a worked instantiation of a broader tooling decision:
  separate an agent system into the records and responsibilities it must
  actually own before choosing products. The worked conclusion is that many
  repository-scale systems can begin with a capable harness, concise Markdown
  instructions, portable skills, Git, and executable checks. Add task state,
  coordination, durable workflows, observability, isolation, credentials,
  policy, memory, provenance, or cross-run settlement only when an observed
  failure makes that responsibility distinct. Treat standards such as Agent
  Skills, MCP, and A2A as interoperability surfaces rather than product layers,
  and classify each tool by primary role, adjacent overlap, boundary, and
  verification date. Apply this method to a real or proposed agent system.
  Identify its authoritative records, actors, failure modes, permissions,
  evidence, and completion rule. Produce a responsibility map, then recommend
  the smallest viable stack and an escalation sequence tied to observed
  failures. Explicitly compare the new context with the repository-scale worked
  example: state which conclusions survive, which change, and why. Challenge the
  map where primary documentation or operational evidence supports a different
  boundary; do not reproduce vendor categories or the note's prose. End with
  unresolved authority conflicts and the next cheap experiment or check.
reference:
  purpose: design-rationale
  discoverFor:
    - choosing agent tooling without comparing unrelated product categories
    - deciding when Markdown, skills, Git, and executable checks are enough
    - locating task state, runtimes, workflows, evidence, policy, and acceptance
  establishes:
    - a dated responsibility map for representative agent tooling
    - the failure that makes each additional layer worth considering
    - that standards and products answer different architectural questions
  doesNotEstablish:
    - the correct stack for a particular organization or risk level
    - product capabilities or market positions after the verified date
    - that every responsibility deserves a separate product
  supplementWith:
    - current primary documentation for any product under selection
    - local failure evidence, authority rules, and acceptance criteria
---

The agent-tooling market has achieved a small miracle: a terminal, a task list,
a workflow engine, a sandbox, a tracing screen, and a policy engine can all be
sold as “orchestration.” A notary may also be included, although nobody agrees
whether the notary is a database.

Start with a smaller scene. One coding agent opens one repository. It reads the
project instructions, loads a procedure, changes a few files, runs an executable
check, and leaves a diff for review. If the work fits inside that scene, the
system may already be complete. It does not become more production-ready merely
because a second database learns the word _agent_.

This guide maps tools by the responsibility they primarily own and the failure
that makes that responsibility worth adding. It was verified on 1
September 2026. Product boundaries will move; the underlying questions should
age more slowly:

- Who decides what work exists and is ready?
- What executes the next step?
- What survives a crash or a new session?
- What can the actor see and change?
- What record explains the result?
- Who may accept it as complete?

## Begin with the boring system

The smallest useful agent system is a repository the harness can understand and
the operator can still inspect:

```text
AGENTS.md                         project map, rules, and verification commands
CLAUDE.md                        imports AGENTS.md for Claude Code
skills/
  verify-change/SKILL.md         repeatable procedure
.agents/skills -> ../skills      Codex and OpenCode discovery path
.claude/skills -> ../skills      Claude Code discovery path
work/
  014-fix-session-resume.md      intent, state, dependencies, and result
decisions/
  007-store-attempt-ids.md       decision and reason
scripts/check                    executable acceptance check
```

The exact names are less important than keeping the jobs separate.

- The root instruction file is a short map: where things are, which commands
  matter, and which rules apply on every run.
- A skill is a reusable procedure loaded when relevant, not another copy of the
  whole project manual.
- The work file records intent and state outside the conversation.
- The decision file records why the implementation took this shape.
- The check turns “looks done” into an executable question.
- Git supplies history, reviewable diffs, branches, and a recovery path.

[Codex](https://developers.openai.com/codex/agent-configuration/agents-md) and
[OpenCode](https://opencode.ai/docs/rules/) read `AGENTS.md`;
[Claude Code](https://code.claude.com/docs/en/memory) reads `CLAUDE.md` and can
import `AGENTS.md`. All three support skills based on the open
[Agent Skills specification](https://agentskills.io/specification), but their
default discovery paths still differ. One canonical skill tree plus small
harness-specific links or generated copies is enough. The open format arrived
before the universal directory name. Civilization will probably continue.

Instruction files and skills are context, not enforcement. Claude's own
documentation states that `CLAUDE.md` guides behaviour but cannot guarantee
compliance. The same architectural limit applies elsewhere. Put build commands,
review rules, routing guidance, and stop conditions there. Put permissions in a
sandbox, credential system, policy engine, or application boundary that can
actually refuse the action.

## Four useful examples before another platform

Several widely shared practices are interesting precisely because they do not
begin with a service fleet.

| Reference                                                                                                                                                                         | What it demonstrates                                                                                                                                                    | Boundary                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Karpathy's January 2026 coding notes](https://x.com/karpathy/status/2015883857489522876) and the [Karpathy-inspired guide](https://github.com/multica-ai/andrej-karpathy-skills) | Standing guidance can target common failures: silent assumptions, unnecessary complexity, unrelated changes, and vague completion.                                      | The popular `CLAUDE.md` is a third-party translation of Karpathy's observations, not a file authored by him. Guidance also remains guidance.              |
| [Karpathy's autoresearch](https://github.com/karpathy/autoresearch)                                                                                                               | A small autonomous loop can be built from `program.md`, one agent-editable file, a fixed five-minute budget, one metric, and a results log.                             | It is a deliberately bounded research experiment, not a general work coordinator. Its clarity comes from the narrow editable surface and objective score. |
| [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)                                                                                          | Raw sources, interlinked Markdown, and one schema or instruction file can form a persistent, inspectable knowledge workflow without a vector platform.                  | The pattern does not by itself solve provenance, contested facts, concurrent editing, or reliable updates across a large and fast-changing corpus.        |
| [Superpowers](https://github.com/obra/superpowers)                                                                                                                                | A substantial development method—brainstorming, specification, planning, TDD, review, and branch completion—can be packaged as composable skills across many harnesses. | It supplies method and defaults. It does not become the task authority, permission boundary, durable workflow engine, or independent acceptance function. |

`autoresearch` is the especially useful correction to platform-first thinking.
Its agent can run for hours because the problem was made small enough to judge:
one file may change, every experiment receives the same time budget, a lower
validation score wins, and the log survives the loop. The important machinery is
not a multi-agent diagram. It is the boundary and the evaluator.

Superpowers shows the opposite end of the same lightweight layer. Skills can
carry a fairly opinionated software-development method before the project needs
a new runtime or database. Whether that method is appropriate is a separate
question; installing more discipline is still cheaper than accidentally founding
an internal platform team.

## Add a layer when its failure appears

Plain files stop being enough in recognizable ways. Route from the observed
failure rather than from the product category printed on a landing page.

| Observed failure                                                                  | Responsibility to add                | Reasonable starting points                                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Work disappears between sessions, or dependencies cannot be calculated reliably   | Task and work state                  | Markdown plus Git first; then [GitHub Issues](https://docs.github.com/issues) or [Beads](https://github.com/gastownhall/beads)                                                             |
| Several workers claim the same task or edit the same workspace                    | Coordination and workspace isolation | Worktrees and explicit claims; then [Gas Town](https://github.com/gastownhall/gastown) or a similar coordinator                                                                            |
| A process must resume correctly after a crash, delay, or deployment               | Durable workflow execution           | [Temporal](https://docs.temporal.io/workflow-execution), [Restate](https://docs.restate.dev/ai), or [Windmill](https://www.windmill.dev/docs/core_concepts/workflows_as_code)              |
| An agent application needs stateful loops, handoffs, and human interruption       | Agent application runtime            | [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/), [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview), or [OpenHands](https://docs.openhands.dev/sdk) |
| The same external capability should work from several hosts                       | Tool and context interoperability    | [MCP](https://modelcontextprotocol.io/specification/2025-06-18)                                                                                                                            |
| Independent remote agents need to exchange messages, tasks, and artifacts         | Agent-to-agent interoperability      | [A2A](https://github.com/a2aproject/A2A/blob/main/docs/specification.md)                                                                                                                   |
| A bad result cannot be reconstructed, compared, or turned into a regression case  | Observability and evaluation         | [LangSmith](https://docs.langchain.com/langsmith/observability), [Langfuse](https://langfuse.com/docs), or [Phoenix](https://arize.com/docs/phoenix)                                       |
| Generated code or commands must not run on the host                               | Execution isolation                  | Containers first; then [E2B](https://e2b.dev/docs) or [Daytona](https://www.daytona.io/docs/en/)                                                                                           |
| An action requires scoped credentials or a policy decision                        | Credentials and authorization        | [OpenBao](https://openbao.org/docs/use-cases/), [OPA](https://openpolicyagent.org/docs), or [Cedar](https://docs.cedarpolicy.com/)                                                         |
| Useful context no longer fits in a navigable maintained corpus                    | Knowledge and memory                 | Markdown and search first; then [Letta](https://docs.letta.com/agent-sdk/) or [Mem0](https://docs.mem0.ai/introduction)                                                                    |
| Ownership, evidence, verification, and acceptance must survive runner replacement | Cross-run work control or settlement | Compose existing authorities first; evaluate [Vuoro](https://vuoro.cloud/) only if the remaining problem is genuinely this one                                                             |

The rows are escalation triggers, not a maturity ladder. A repository with six
files can be the mature answer. A distributed workflow engine can be a very
reliable way to preserve the wrong process.

## The product map

“Primary role” means the state or mechanism a tool is designed to own even when
it also annexes neighbouring features. “Boundary” names the decision that still
belongs elsewhere. Representative tools are examples, not winners.

| Layer and representative tooling                                                                                                                                                                                        | Primary role                                                                                                           | Adjacent overlap                                                               | Boundary                                                                                                                                | Verified   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Coding harnesses: [Claude Code](https://code.claude.com/docs/en/overview), [Codex](https://developers.openai.com/codex/cli), [OpenCode](https://opencode.ai/docs/)                                                      | Reasoning and tool execution inside a coding session, including repository inspection, edits, commands, and review.    | Plans, skills, subagents, permissions, and short-lived session state.          | Does not inherently own the durable backlog, business authority, or acceptance of the produced change.                                  | 2026-09-01 |
| Agent application runtimes: [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/), [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview), [OpenHands SDK](https://docs.openhands.dev/sdk) | The agent loop, tools, handoffs, state, interruption, and application-facing execution model.                          | Persistence, tracing, deployment, guardrails, and multi-agent patterns.        | Application guardrails and checkpoints do not automatically become organizational work authority or a general policy layer.             | 2026-09-01 |
| Multi-agent coordinator: [Gas Town](https://github.com/gastownhall/gastown)                                                                                                                                             | Assigning and coordinating several coding workers, workspaces, identities, mail, handoffs, and merge flow.             | Task state through Beads, worker health, verification, and queues.             | Owns its workspace loop; it is not a general crash-safe business workflow engine or a neutral acceptance authority.                     | 2026-09-01 |
| Task and work state: [GitHub Issues](https://docs.github.com/issues), [Beads](https://github.com/gastownhall/beads)                                                                                                     | Persistent work items, status, dependencies, responsibility, and ready-work selection.                                 | Agent delegation, projects, claims, comments, and links to changes.            | A closed task records a state transition in that system; it does not by itself prove what ran or that the result was correct.           | 2026-09-01 |
| Durable workflow engines: [Temporal](https://docs.temporal.io/workflow-execution), [Restate](https://docs.restate.dev/ai), [Windmill](https://www.windmill.dev/docs/core_concepts/workflows_as_code)                    | Checkpointed or replayable process execution across failures, waits, retries, and long durations.                      | Agent steps, approvals, state, scheduling, workers, and observability.         | Durability preserves process progress. It does not decide whether an agent's evidence is sufficient or the work should exist.           | 2026-09-01 |
| Observability and evaluation: [LangSmith](https://docs.langchain.com/langsmith/observability), [Langfuse](https://langfuse.com/docs/observability/overview), [Phoenix](https://arize.com/docs/phoenix)                  | Traces, datasets, experiments, scores, annotations, cost, latency, and quality investigation.                          | Prompt management, deployment, monitoring, and regression testing.             | A trace explains execution and an evaluator scores a claim; neither normally owns permission, task responsibility, or completion.       | 2026-09-01 |
| Execution sandboxes: [E2B](https://e2b.dev/docs), [Daytona](https://www.daytona.io/docs/en/), [OpenHands Runtime](https://docs.openhands.dev/openhands/usage/architecture/runtime)                                      | Isolated filesystems, processes, networks, resources, and reproducible execution environments.                         | Workspace lifecycle, snapshots, secrets, remote execution, and tools.          | Isolation limits where code runs. It does not decide which domain action is authorized or whether the output is acceptable.             | 2026-09-01 |
| Credential systems: [OpenBao](https://openbao.org/docs/use-cases/)                                                                                                                                                      | Storing, issuing, rotating, leasing, and revoking secrets and credentials.                                             | Identity, PKI, encryption, audit, and authentication methods.                  | Possession of a leased credential does not establish that a particular action satisfies task or business policy.                        | 2026-09-01 |
| Policy engines: [OPA](https://openpolicyagent.org/docs), [Cedar](https://docs.cedarpolicy.com/)                                                                                                                         | Evaluating explicit policy over principals, actions, resources, and context.                                           | Admission control, API authorization, infrastructure policy, and analysis.     | A policy engine returns a decision; the calling application must enforce it and still owns the surrounding lifecycle.                   | 2026-09-01 |
| Knowledge and memory: [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), [Letta](https://docs.letta.com/agent-sdk/), [Mem0](https://docs.mem0.ai/introduction)                   | Keeping useful context available across turns, sessions, agents, or a growing corpus.                                  | Retrieval, synthesis, agent identity, personalization, and context management. | Memory is selected context, not automatically truth, current project state, work ownership, or evidence of completion.                  | 2026-09-01 |
| Evidence and provenance: Git and CI, [in-toto](https://in-toto.io/docs/getting-started/), [SLSA](https://slsa.dev/spec/v1.2/), [Sigstore](https://docs.sigstore.dev/)                                                   | Binding artifacts to source, actors, steps, checks, signatures, and reproducible records.                              | Supply-chain integrity, attestations, audit, and release controls.             | Provenance can show how an artifact came to exist without showing that it satisfies the intended need.                                  | 2026-09-01 |
| Cross-run settlement/control: [Vuoro](https://vuoro.cloud/)                                                                                                                                                             | Current ownership, bounded evidence, configured verification, and authoritative completion across replaceable runners. | Dispatch, task projections, evidence references, compatibility, and recovery.  | A local implementation of a composed responsibility, not a general runner, workflow engine, tracker, policy engine, or market standard. | 2026-09-01 |

The table deliberately gives LangGraph and Restate overlapping territory. Both
can make agent execution durable. They approach it from different centres:
LangGraph begins with a stateful agent graph; Restate begins with durable
execution and stateful services. The useful question is not which one has the
word _agent_ in more headings. It is which execution history should become
authoritative in the application being built.

## Standards are not products

Protocols and formats describe how components communicate or package
information. They do not become a runtime merely because several runtimes
implement them.

| Standard                                                                                                 | Primary role                                                                                           | Adjacent overlap                                                | Boundary                                                                                                                           | Verified   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [Agent Skills](https://agentskills.io/specification)                                                     | A portable directory format for instructions, metadata, scripts, references, and assets.               | Commands, project methods, domain knowledge, and tool recipes.  | Does not define work state, permission enforcement, execution, or identical discovery behaviour in every harness.                  | 2026-09-01 |
| [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18)                       | Standard client-server exposure of tools, resources, prompts, and capability negotiation.              | Authentication, elicitation, sampling, and application context. | Exposing a tool does not decide when it should run, whether its result completes work, or which larger workflow owns the call.     | 2026-09-01 |
| [Agent2Agent Protocol](https://github.com/a2aproject/A2A/blob/main/docs/specification.md)                | Interchange among remote agents through cards, messages, tasks, status, and artifacts.                 | Streaming, long-running collaboration, authentication, and UI.  | Its task lifecycle coordinates protocol interaction; it does not automatically become the receiving organization's work authority. | 2026-09-01 |
| [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai) | Common names and shapes for GenAI spans, metrics, events, tools, MCP calls, and agents.                | Vendor-neutral export and observability interoperability.       | A telemetry schema does not retain data, provide an analysis product, define an evaluator, or accept work.                         | 2026-09-01 |
| [in-toto](https://in-toto.io/) and [SLSA provenance](https://slsa.dev/spec/v1.2/)                        | Describing and verifying authorized supply-chain steps, materials, products, builders, and provenance. | Evidence exchange, signing, release policy, and audit.          | They establish lineage and integrity claims, not semantic correctness or stakeholder acceptance.                                   | 2026-09-01 |

MCP and A2A are the easiest pair to misplot. MCP connects a host to capabilities
and context. A2A connects a client to a remote agent that collaborates through a
task. Neither is a substitute for Temporal, Claude Code, or an issue tracker.
They may connect those systems; connection is their job.

## One piece of work leaves several records

Consider an agent asked to repair a failed deployment. The same attempt may
produce all of these records:

| Record               | Likely owner                           | Question it can answer                                   |
| -------------------- | -------------------------------------- | -------------------------------------------------------- |
| Issue or task        | GitHub Issues, Beads, another tracker  | Why did this work exist, and who was responsible?        |
| Workflow history     | Temporal, Restate, Windmill, LangGraph | Which durable steps, waits, and retries occurred?        |
| Harness session      | Claude Code, Codex, OpenCode           | What did the reasoning-and-tool loop do in this session? |
| Sandbox execution    | E2B, Daytona, a local container        | In which isolated environment did commands run?          |
| Trace and evaluation | LangSmith, Langfuse, Phoenix           | Which calls occurred, and how was behaviour scored?      |
| Artifact provenance  | Git, CI, in-toto, SLSA, Sigstore       | Which inputs and process produced this exact artifact?   |
| Acceptance decision  | The work authority or application      | Does this evidence make the requested work complete?     |

Collapsing the records is tempting. If the trace exists, call it evidence. If
the workflow completed, close the task. If the agent says the tests passed,
accept the change. Each shortcut can be valid in a low-consequence system. None
is valid by vocabulary alone. The application still has to decide which record
is authoritative for which transition.

This is also why feature matrices age badly. Products add tracing, task queues,
memory, approvals, and sandboxes around their centre. The four more durable
fields are:

1. **Primary role:** which state or mechanism is the product built to own?
2. **Adjacent overlap:** which neighbouring jobs can it also perform?
3. **Boundary:** which decision remains outside its contract?
4. **Verified date:** when was that description checked against a primary
   source?

## Where Vuoro lands

[Vuoro's own alternatives page](https://vuoro.cloud/alternatives.html) begins
with the useful instruction: use Vuoro only when settlement is the problem. In
plain terms, settlement is the transition from “a runner claims it did
something” to “this exact result, with this evidence and verification, is the
accepted completion of this work.” It also has to survive the runner going away
or being replaced.

That places Vuoro after the narrower systems, not around them. A task system
should keep owning tasks. A durable workflow engine should keep owning its
execution history. A harness should keep owning its session. Credential and
policy systems should keep deciding what can be issued and allowed. An
observability product should keep recording traces.

Vuoro's proposed responsibility is to compose the relevant ownership, evidence,
verification, compatibility, and recovery state without becoming a second
writable authority for each source. That is a worked local implementation, not
proof that “settlement/control” deserves a separate product category. A system
may compose the same responsibility adequately from its tracker, workflow
engine, CI, and application database. If it can, it should.

This broader map therefore should not be read as a list of Vuoro competitors.
The market does not partition itself around a small project in Finland, however
organized its front matter may be.

## A buying and building rule

For most repository work, begin with a capable harness, concise Markdown
instructions, a few skills, Git, and executable checks. Add ordinary issue
tracking when the work outlives the session. Add explicit claims and isolated
workspaces when several workers collide. Add a durable workflow engine only when
a process must survive failure and resume correctly. Add observability,
sandboxing, credentials, and policy as the consequences of the actions require
them, not as decoration around a demo.

Cross-run settlement comes last. It earns a separate layer only when ownership
can transfer, runners are replaceable, stale success is dangerous, and
completion requires evidence or independent verification that no existing
authority can represent cleanly.

Before adopting a tool, ask four questions:

1. Which exact record becomes authoritative if this tool is added?
2. Which observed failure does it remove?
3. Which decision remains outside it?
4. What is the recovery path if the tool disappears or records the wrong state?

If the first answer is “all of them,” the product boundary is probably still a
sales diagram. If the second answer is hypothetical, keep the Markdown files.

## Maintenance rule

Review an entry when its primary state ownership changes, its boundary moves, or
the linked primary documentation no longer supports the description. A new
feature in an adjacent box is not by itself a reason to reclassify the product.

Keep standards separate from products. Keep observed capabilities separate from
vendor promises. Keep Vuoro secondary. Above all, keep the smallest system that
still leaves intent, action, evidence, and recovery legible.

The point of the map is not to fill every box. It is to know which empty boxes
are still harmless.
