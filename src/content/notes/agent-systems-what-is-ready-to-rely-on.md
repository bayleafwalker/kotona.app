---
title: "Agent systems: what is ready to rely on"
role: synthesis
status: guiding
lifecycle: current
area: agent infrastructure
published: 2026-10-12
lastRevised: 2026-10-12
projects: []
relates:
  - where-agent-tooling-fits
  - a-platform-capability-does-not-exist-all-at-once
  - a-field-guide-to-assurance-managed-ai-development
draft: false
tags:
  - agents
  - readiness
  - governance
  - interoperability
  - evaluation
summary:
  A maintained assessment of agent-system capabilities, separating what can be
  adopted from what still needs integration, evidence, or an explicit decision.
explorePrompt: >-
  Assess which capabilities a real technical workflow can adopt and which still
  require integration or evidence. The worked example is a documentation-based
  assessment of agent infrastructure: repository execution, policy decisions,
  durable workflows, tracing, and evaluation have reusable implementations,
  while cross-service delegation and recovery across replaceable runners need
  separate judgments. Its conclusion is to classify a narrow capability rather
  than an entire product, keep maturity separate from confidence, and revise an
  accepted baseline only when evidence changes a decision. Apply that method to
  a materially different workflow, such as document processing or scientific
  computation. State its consequences, operators, failure modes, and acceptance
  rules. Identify where those conditions differ from repository coding and which
  conclusions therefore change. Challenge the example with current primary
  evidence rather than inheriting its tiers. Produce a small capability register
  with scope, maturity, evidence type, limits, and a revisit condition, then
  recommend the smallest viable composition. Keep unknowns visible and propose
  at most two bounded investigations tied to live decisions. Distinguish
  documented support from behavior actually tested; do not reproduce the note's
  prose or treat its lack of evidence as proof of absence.
reference:
  purpose: design-rationale
  discoverFor:
    - assessing agent-system capability readiness and build-versus-adopt choices
    - distinguishing mature primitives from unproven cross-system guarantees
    - tracking evidence-backed changes in agent infrastructure
  establishes:
    - dated capability-level judgments with evidence and remaining limitations
    - explicit conditions for revisiting an architectural assumption
    - a maintained baseline rather than a weekly product-news archive
  doesNotEstablish:
    - comparative benchmarks or local deployment tests of the listed tools
    - universal product rankings or guarantees beyond each assessed scope
    - that missing evidence proves a capability does not exist
  supplementWith:
    - current primary documentation and release-specific compatibility checks
    - workload-specific acceptance, failure, security, and recovery tests
---

A coding agent can edit a repository and run its tests. Whether another runner
can recover the work, respect the original permission, and explain why the
result was accepted is a different question. This note tracks those questions
separately, so a product release can change one judgment without promoting the
whole system.

The [tooling responsibility map](/notes/where-agent-tooling-fits/) asks which
component owns each job. This note asks how much of that job I would assume is
available before building something. It is a maintained assessment, not a market
survey or a claim that these distinctions are new.

**Baseline established: 12 October 2026.** This first pass reviews public
primary documentation. It does not report comparative benchmarks or local
deployment tests. The maturity labels and architectural consequences are my
assessment of the stated scope; they are not certifications supplied by the
linked projects.

## Current position

For a repository workflow, adopt a harness, existing checks, and reviewable Git
changes before designing another execution layer. Use established policy,
workflow, tracing, and evaluation components for their actual responsibilities.
The records below explain the evidence and limits behind that recommendation.

Treat cross-system delegation, portable recovery, and independent acceptance as
integration questions. A protocol can carry a task without deciding whether its
result is acceptable. A persisted conversation can help a runner continue
without proving which version of an artifact an earlier reviewer approved.

The useful default is to compose existing records first. Build a new component
only around a failure that the composition cannot represent or recover from.

## How to read the assessment

**Commons** means the scoped capability is established enough to start with an
existing implementation rather than a custom one. It does not mean every host,
SDK, operating system, or deployment supports it.

**Edge** means a capable team can pilot the capability, but compatibility,
integration, or operational evidence still needs deliberate work. **Art** means
a demonstrated frontier result, not a generally dependable implementation.
**Unassessed** means the evidence here does not justify one of those judgments.
Missing evidence is not a frontier achievement.

Confidence is separate: **High** indicates a clear documented contract for the
narrow claim; **Medium** indicates a meaningful integration or evidence gap;
**Low** indicates unresolved or conflicting support. A specification establishes
a contract, not deployment success. Implementation documentation establishes
what its maintainer supports, not independent operational validation.

Each record has a stable ID. “Last verified” dates the source review for that
record, not a successful deployment or the entire page. Undated, mutable
reference pages are identified by their access date; versioned sources retain
their version in the citation. More than 90 days without review makes a record
stale for a new decision, not automatically false or demoted.

## Capability assessments

<a id="as-01"></a>

### AS-01: Repository execution

**Maturity:** Commons

**Confidence:** High

**Last verified:** 2026-10-12

**Scope:** Inspect files, propose edits, execute development tools, and leave a
change for review inside a repository workflow.

**Evidence:** Implementation documentation. [Codex CLI][codex] documents the
inspect-edit-run loop, non-interactive execution, review, and saved-session
resumption. These are existing harness functions, not reasons to create a new
execution product.

**Limit:** Availability of the loop does not establish correctness of generated
changes, completeness of tests, or permission to merge them.

**Consequence:** Start with a supported harness and executable checks. Keep the
accepted change in Git and acceptance in the existing review process.

**Revisit when:** A required execution or recovery behavior fails in the chosen
harness and cannot be addressed through its supported configuration.

<a id="as-02"></a>

### AS-02: Basic tool interoperability

**Maturity:** Commons

**Confidence:** High

**Last verified:** 2026-10-12

**Scope:** Discover and invoke tools through a compatible MCP host and server.

**Evidence:** Specification and implementation documentation.
[MCP 2026-07-28][mcp] defines tools, resources, and the base protocol.
[Codex CLI][codex] documents connecting local and remote MCP servers.

**Limit:** This rating does not cover universal client compatibility. The July
revision defines stateless requests and per-request negotiation; optional
extensions require explicit support. Basic tool support does not prove support
for long-running tasks, apps, skills, or a particular authorization extension.

**Consequence:** Prefer MCP over a private host-specific tool protocol when both
ends support the required contract. Pin and test the actual host-server pair.

**Revisit when:** A protocol or SDK migration changes cancellation, errors,
authorization, or the behavior required by that pair.

<a id="as-03"></a>

### AS-03: Delegated authority across services

**Maturity:** Edge

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Carry a user's limited authority through an agent and into downstream
services without silently widening it.

**Evidence:** Standards and protocol documentation.
[OAuth token exchange, RFC 8693][exchange] defines delegation and impersonation
mechanisms. [MCP's 2026-07-28 authorization specification][mcp-auth] defines HTTP
authorization, resource binding, and scope handling. These are substantial
reusable pieces.

**Limit:** The application still has to map the user, task, downstream identity,
resources, expiry, and revocation behavior. A valid token does not establish
that a particular operation was intended, and delegation must not silently
become impersonation.

**Consequence:** Reuse identity and credential infrastructure. Pilot the
complete authority chain before granting unattended write access.

**Revisit when:** A supported implementation demonstrates constrained
delegation, revocation, and audit attribution across the exact services under
consideration.

<a id="as-04"></a>

### AS-04: External policy decisions

**Maturity:** Commons

**Confidence:** High

**Last verified:** 2026-10-12

**Scope:** Evaluate explicit policy over an action and its context outside the
model's generated instructions.

**Evidence:** Implementation documentation. [OPA integration][opa] separates
policy evaluation from the application and describes returning decisions for the
caller to interpret and enforce.

**Limit:** The decision engine does not make every execution path consult it.
Stale inputs, a permissive error path, or a second unguarded API can still
defeat the intended rule.

**Consequence:** Adopt a policy engine where policy complexity warrants one. Put
the enforcement point in the service that performs the action, with explicit
handling for unavailable or indeterminate decisions.

**Revisit when:** The application cannot prove that every relevant action uses
the enforcement point, or policy freshness changes the decision's validity.

<a id="as-05"></a>

### AS-05: Durable process execution

**Maturity:** Commons

**Confidence:** High

**Last verified:** 2026-10-12

**Scope:** Persist process progress and resume a workflow after a worker fails.

**Evidence:** Implementation documentation.
[Temporal's workflow execution model][temporal] describes durable state and
recovery after failures. [LangGraph persistence][langgraph] documents
checkpointed graph state and thread-based recovery within its application model.

**Limit:** Workflow recovery does not establish that an external effect occurred
only once or that replaying a model step is acceptable. The effect boundary,
retry semantics, and recovery procedure still need workload-specific tests.

**Consequence:** Adopt durable execution when the process requires it. Keep
nondeterministic decisions and externally visible effects behind explicit,
recoverable steps rather than rebuilding a workflow engine around an agent loop.

**Revisit when:** Crash injection around an effect or checkpoint produces a
missing result, duplicate effect, or unrecoverable ambiguity.

<a id="as-06"></a>

### AS-06: Remote agent task exchange

**Maturity:** Edge

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Exchange tasks, status, and artifacts between independently hosted
agents through A2A.

**Evidence:** Protocol specification. [A2A's specification][a2a] defines task
operations, artifacts, security declarations, and in-task authorization states.
Section 7.5 explicitly leaves authorization logic to the implementation.

**Limit:** A shared message contract does not establish compatible business
meaning, safe retries, portable acceptance, or trust in another agent's result.
An authorization-required state is useful without solving the whole authority
chain.

**Consequence:** Pilot A2A at a real interoperability boundary. Keep
authorization and acceptance rules explicit at both ends; do not replace an
adequate local workflow merely to acquire another protocol.

**Revisit when:** Independent implementations demonstrate the required failure,
cancellation, authorization, and recovery behavior together.

<a id="as-07"></a>

### AS-07: Execution telemetry

**Maturity:** Commons

**Confidence:** High

**Last verified:** 2026-10-12

**Scope:** Collect and correlate general traces and metrics through established
OpenTelemetry signals and a supported SDK/exporter combination.

**Evidence:** Specification status and maintainer documentation.
[OpenTelemetry's status summary][otel-status] distinguishes signal and component
maturity. Its [GenAI conventions page][otel-genai] now points to a separate
repository and says the old location is no longer maintained.

**Limit:** General tracing maturity does not establish a stable schema for every
agent event, complete cost attribution, or retention of the evidence needed to
reconstruct an accepted result. The GenAI source move is not itself a promotion
or demotion.

**Consequence:** Reuse telemetry infrastructure. Version agent-specific fields
and pricing assumptions, and link traces to separately retained artifacts.

**Revisit when:** Convention or SDK changes break correlation, change field
meaning, or make previously invisible work and cost measurable.

<a id="as-08"></a>

### AS-08: Evaluation pipelines

**Maturity:** Commons

**Confidence:** High

**Last verified:** 2026-10-12

**Scope:** Maintain datasets, run comparative experiments, attach scores, and
use explicit regression thresholds in a release process.

**Evidence:** Implementation documentation. [Langfuse evaluation][langfuse]
documents offline experiments, online evaluation, human annotation, code checks,
and CI integration. The machinery need not be invented for each project.

**Limit:** The pipeline does not establish that its dataset represents the
workload, that a model judge is calibrated, or that an average score captures a
rare consequential failure.

**Consequence:** Adopt evaluation infrastructure. Keep acceptance criteria,
held-out cases, consequential failure tests, and human review under the
application owner's control.

**Revisit when:** A deployment failure passes the current suite, or a proposed
judge changes decisions without agreement on the relevant labeled cases.

<a id="as-09"></a>

### AS-09: Constraining command execution

**Maturity:** Edge

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Apply filesystem, credential, and network restrictions to commands
executed by a chosen coding harness.

**Evidence:** Implementation documentation. [Claude Code sandboxing][sandbox]
describes OS-enforced filesystem and network controls, credential protections,
and settings that can exclude commands or disable part of the isolation.

**Limit:** The scope is the configured execution path, not every action a host
or remote tool can perform. An excluded interpreter, accessible credential, or
separate connector can invalidate an assumption about what is contained.

**Consequence:** Reuse supported isolation, then test the actual paths and
fallbacks. Keep sensitive credentials out of the workspace and grant only the
network and filesystem access the workload needs.

**Revisit when:** A harness, operating-system, or policy update changes
effective permissions, fallback behavior, or a path around the intended
restrictions.

<a id="as-10"></a>

### AS-10: Evidence continuity across runner replacement

**Maturity:** Unassessed

**Confidence:** Low

**Last verified:** 2026-10-12

**Scope:** Replace a runner and still recover the exact input, output,
authority, verification, and acceptance records for a piece of work.

**Evidence:** Adjacent implementation documentation, not an end-to-end proof.
[LangGraph checkpoints][langgraph], [Temporal workflow history][temporal], and
[Langfuse evaluation records][langfuse] establish useful component capabilities.
This review did not establish their combined guarantee across arbitrary runners.

**Limit:** A checkpoint, memory entry, trace, and approval can each be valid
while referring to different attempts or artifact revisions. Missing evidence
here must not be read as proof that no existing product can meet the
requirement.

**Consequence:** Compose existing authoritative records first. Identify work,
attempt, artifact revision, verifier, and accepting actor before evaluating a
separate continuity service.

**Revisit when:** A concrete implementation passes runner-replacement and
stale-result tests while reconstructing acceptance without relying on the old
chat.

## Unresolved questions

The most useful missing evidence concerns complete paths, not longer feature
lists. Can delegated access be revoked during a running task without leaving a
usable downstream credential? Can a replacement runner identify and reject an
approval for an older artifact? Can a trace remain useful after redaction and
sampling without becoming the only copy of the evidence?

These are questions for candidate implementations, not a standing obligation to
build experiments. An investigation earns time only when its answer can change a
live architectural decision.

## Update policy

Research may run weekly. Publication changes only when evidence changes a
judgment, confidence, limitation, practical consequence, or material citation.
“No material change” is a valid outcome. Do not advance every record's date
because one source was checked.

A revision identifies the affected AS record, previous and proposed positions,
new primary evidence, counterevidence, and the decision it changes. Keep a short
account below of promotions, demotions, reversals, and material corrections; Git
preserves the exact previous text. Corrections to an existing claim are not
silently recast as newly discovered progress.

The existing responsibility map keeps its own verification dates. This note does
not re-verify it by association. Research can propose changes, but a publication
review still decides what enters the public record. Private project constraints
and operational evidence stay outside this repository unless separately reviewed
for publication.

## Judgment history

### 2026-10-12: Initial baseline

Established AS-01 through AS-10 from the linked primary documentation. No tier
movement is claimed because there is no earlier accepted version of this note.
The baseline separates mature execution, policy, workflow, telemetry, and
evaluation components from integration-sensitive authority, remote tasks, and
sandbox configuration. Cross-run evidence continuity remains unassessed.

Recorded the OpenTelemetry GenAI documentation move as a source-location
correction, without inferring that its conventions became more or less mature.

[codex]: https://learn.chatgpt.com/docs/codex/cli
[mcp]: https://modelcontextprotocol.io/specification/2026-07-28
[mcp-auth]: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization
[exchange]: https://www.rfc-editor.org/rfc/rfc8693.html
[opa]: https://www.openpolicyagent.org/docs/integration
[temporal]: https://docs.temporal.io/workflow-execution
[langgraph]: https://docs.langchain.com/oss/python/langgraph/persistence
[a2a]: https://a2a-protocol.org/latest/specification/
[otel-status]: https://opentelemetry.io/docs/specs/status/
[otel-genai]: https://opentelemetry.io/docs/specs/semconv/gen-ai/
[langfuse]: https://langfuse.com/docs/evaluation/overview
[sandbox]: https://code.claude.com/docs/en/sandboxing
