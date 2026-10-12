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
  - security
summary:
  A maintained assessment of agent-system capabilities, separating what can be
  adopted from what still needs integration, evidence, or an explicit decision.
explorePrompt: >-
  Assess which capabilities a real technical workflow can adopt and which still
  require integration or evidence. The worked example reviews documented agent
  infrastructure: execution, basic protocol exchange, policy, workflows,
  tracing, and evaluation have reusable implementations, while delegated
  authority, untrusted-content containment, and acceptance across replaceable
  runners need separate judgments. It rates a narrow operation under stated
  conditions, not an entire product. Documentation supports adoption choices
  without proving operational reliability; signed evidence binds bytes without
  deciding whether an old approval still applies. Apply that method to a
  materially different workflow, such as document processing or scientific
  computation. State its operators, consequences, hostile inputs, failure modes,
  and acceptance rules. Identify where those conditions differ from repository
  coding and which conclusions therefore change. Challenge the example with
  current primary evidence and counterevidence rather than inheriting its tiers.
  Produce a small capability register with scope, maturity, confidence, evidence
  type, limits, and revisit conditions. Recommend the smallest viable
  composition. Keep unknowns visible and propose at most two bounded
  investigations tied to live decisions. Distinguish supported features from
  tested behavior, and missing evidence from proof of absence; do not reproduce
  the note's prose.
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

The unit here is a narrow operation under stated conditions, rather than an
organization's readiness or a product as a whole. That is a useful editorial
choice, not a claim of uniqueness: [technology radars also assess
techniques][radar-faq].

**Baseline established: 12 October 2026; evidence correction the same day.**
This review uses public primary documentation and the identified research. It
does not report comparative benchmarks or local deployment tests. The maturity
labels and architectural consequences are my assessment of the stated scope;
they are not certifications supplied by the linked projects.

## Current position

For a repository workflow, adopt a harness, existing checks, and reviewable Git
changes before designing another execution layer. Use established policy,
workflow, tracing, and evaluation components for their actual responsibilities.
Use MCP or A2A where their interoperability contract is needed, not merely
because an agent is involved. The records below explain the evidence and limits.

Treat cross-system delegation, portable recovery, and independent acceptance as
integration questions. A protocol can carry a task without deciding whether its
result is acceptable. Digest-bound attestations can identify the artifact a
verifier checked; the consumer must still know which artifact and decision it
currently expects.

Untrusted retrieved content and tool output also belong in the operating model.
Plan for manipulated model behavior and constrain its consequences outside the
model. Command sandboxing alone does not cover a separately authorized
connector, an allowed data destination, or a misleading approval request.

The useful default is to compose existing records first. Build a new component
only around a failure that the composition cannot represent or recover from.

## How to read the assessment

**Commons** means the scoped capability is established enough to start with an
existing implementation rather than a custom one. The evidence should identify
multiple independently maintained implementations, or an established standards
ecosystem with maintained implementations and documented operating constraints.
One feature page establishes availability, not this judgment. Two announcements
are not an automatic pass either: the cited implementations must cover the
stated operation. Commons does not mean universal compatibility, measured market
share, or readiness for an untested workload.

**Edge** means a capable team can pilot the capability, but compatibility,
integration, or operational evidence still needs deliberate work. **Art** means
a demonstrated frontier result, not a generally dependable implementation.
**Unassessed** means the evidence here does not justify one of those judgments.
Missing evidence is not a frontier achievement.

Confidence describes support for the maturity judgment, not how clearly a vendor
writes its documentation. **High** requires convergent implementation and
operational evidence relevant to the scope. **Medium** means documented support
or bounded demonstrations justify the judgment, with important validation still
missing. **Low** means unresolved or conflicting evidence prevents a dependable
assessment. A specification establishes a contract; maintainer documentation
establishes supported behavior; neither is independent deployment validation.

Apply the same evidence threshold to comparable scopes. Do not demand portable
acceptance from one transport while assessing another only on basic calls.
Separate a component's contract from the complete application's guarantees.

Each record has a stable ID. “Last verified” dates its source review, not a
successful deployment or the entire page. Specifications and papers below use
identified versions where available. Unversioned reference documentation is
mutable and, unless a publication date is stated, treated as undated and
accessed on that record's review date. A dated status tracker is evidence of
process state, not a frozen specification. More than 90 days without review
makes a record stale for a new decision, not automatically false or demoted.

## Capability assessments

<a id="as-01"></a>

### AS-01: Repository execution

**Maturity:** Commons

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Inspect files, propose edits, execute development tools, and leave a
change for review inside a repository workflow.

**Evidence:** Documentation for independently maintained implementations. [Codex
CLI][codex] documents the inspect-edit-run loop, non-interactive execution,
review, and saved-session resumption. [Claude Code][claude-code] separately
documents repository inspection, editing, and command execution. These support
adopting the basic loop; they are not an independent comparison of its results.

**Limit:** Availability of the loop does not establish correctness of generated
changes, completeness of tests, or permission to merge them.

**Consequence:** Start with a supported harness and executable checks. Keep the
accepted change in Git and acceptance in the existing review process.

**Revisit when:** A required execution or recovery behavior fails in the chosen
harness and cannot be addressed through its supported configuration.

<a id="as-02"></a>

### AS-02: Basic tool interoperability

**Maturity:** Commons

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Discover and invoke tools through a compatible MCP host and server.

**Evidence:** Specification and multiple host implementations. [MCP
2026-07-28][mcp] defines tools, resources, and the base protocol. [Codex
CLI][codex] and [Claude Code's MCP integration][claude-mcp] document host
support. This establishes reusable basic tool connections, not identical support
for every feature of the cited revision.

**Counterevidence:** Thoughtworks Radar Vol. 34 places [“MCP by
default”][mcp-caution] in Caution. Its April 2026 assessment favors a good CLI
where that meets the need, reserving MCP for requirements such as protocol
interoperability and governed authorization boundaries. This challenges an
adoption default, not the existence of the protocol capability.

**Limit:** This rating does not cover universal client compatibility. The July
revision defines stateless requests and per-request negotiation; optional
extensions require explicit support. Basic tool support does not prove support
for long-running tasks, apps, skills, or a particular authorization extension.

**Consequence:** Use an adequate CLI for local execution. Prefer MCP over a
private host-specific tool protocol when protocol interoperability or its
supported governance features are required. Pin and test the actual host-server
pair rather than assuming that both implement every current extension.

**Revisit when:** A protocol or SDK migration changes cancellation, errors,
authorization, or the behavior required by that pair.

<a id="as-03"></a>

### AS-03: Delegated authority across services

**Maturity:** Edge

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Carry a user's limited authority through an agent and into downstream
services without silently widening it.

**Evidence:** Standards, process records, and work in progress. [OAuth token
exchange, RFC 8693][exchange] and [MCP authorization 2026-07-28][mcp-auth]
supply reusable mechanisms. The [OAuth charter, revision 06][oauth-charter],
approved in June 2026, explicitly includes complex delegation and automated
agents across domains. The [3 June WIMSE interim minutes][wimse-minutes] record
agent-authorization work, not an adopted solution.

[Identity chaining draft-17][identity-chaining] describes preserving identity
and authorization across domains; its [tracker][identity-status] reports the RFC
Editor queue at this review, rather than a published RFC. [Credential Delegation
for AI Agents, draft-sweeney-wimse-credential-delegation-00][agent-delegation],
is a separate individual proposal. Its publication is not IETF consensus or
proof that a supported implementation meets the proposed guarantees.

**Limit:** Standards progress does not yet remove the application's work of
mapping the user, task, downstream identity, resources, expiry, and revocation.
A valid token does not establish that a particular operation was intended, and
delegation must not silently become impersonation.

**Consequence:** Reuse identity and credential infrastructure. Pilot the
complete authority chain before granting unattended write access; do not invent
a delegation format without checking the OAuth and WIMSE tracks.

**Revisit when:** These tracks change the supported delegation contract, or an
implementation demonstrates attenuation, downstream revocation, and attribution
across the exact services under consideration. A charter change or draft release
alone does not promote the capability.

<a id="as-04"></a>

### AS-04: External policy decisions

**Maturity:** Commons

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Evaluate explicit policy over an action and its context outside the
model's generated instructions.

**Evidence:** Documentation for independently maintained policy implementations.
[OPA integration][opa] separates policy evaluation from the caller that enforces
a decision. [Cedar][cedar] separately evaluates authorization over principals,
actions, resources, and context. Neither depends on the model interpreting the
policy correctly.

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

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Persist process progress and resume a workflow after a worker fails.

**Evidence:** Implementation documentation. [Temporal's workflow execution
model][temporal] describes durable state and recovery after failures. [LangGraph
persistence][langgraph] documents checkpointed graph state and thread-based
recovery within its application model.

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

**Maturity:** Commons

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Exchange tasks, status, and artifacts between independently hosted
agents through a compatible A2A client-server pair. This is basic protocol
exchange, not portable acceptance or interchangeable failure recovery.

**Evidence:** [A2A v1.0.0][a2a] is a stable specification for task operations,
artifacts, and security declarations. The Linux Foundation's [9 April 2026
report][a2a-adoption] describes more than 150 supporting organizations, multiple
SDKs, Google, Microsoft, and AWS integration, and production use. Those are
first-party adoption reports, not 150 independently verified implementations.
[AWS's AgentCore deployment guide][a2a-aws] supplies a concrete implementation
path. [AAIF's 17 August announcement][a2a-aaif] establishes its hosting and
governance position, not additional runtime guarantees.

**Counterevidence:** Stable v1.0 establishes the protocol contract, not uniform
support across SDK and cloud releases. The April report itself includes expanded
interoperability testing in the roadmap. This review does not establish the
behavior of an arbitrary pair through cancellation, retries, or reconnects.

**Limit:** Reusable task exchange does not establish compatible business
meaning, safe repeated effects, portable acceptance, or trust in another agent's
result. Section 7.5 leaves authorization logic to the implementation. These
limits belong to the composition; they do not make the basic protocol
unavailable. Exact version, transport, and extension support still need checking
at both ends.

**Consequence:** Adopt A2A rather than inventing a private task-exchange
protocol when remote agent interoperability is required. Pilot the selected
pair's failure paths before unattended use. Keep delegation in AS-03 and
acceptance in AS-10; do not demand those guarantees from this narrower record,
or replace an adequate local workflow just to add a protocol.

**Revisit when:** A version or implementation change breaks the required task
lifecycle, or cross-implementation tests justify a stronger reliability claim.
This Commons judgment does not promote those stronger guarantees by association.

<a id="as-07"></a>

### AS-07: Execution telemetry

**Maturity:** Commons

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Collect and correlate general traces and metrics through established
OpenTelemetry signals and a supported SDK/exporter combination.

**Evidence:** Specification status and a maintained implementation ecosystem.
[OpenTelemetry's status summary][otel-status] distinguishes maturity across
signals and language implementations. Its [GenAI conventions page][otel-genai]
now points to a separate repository and says the old location is no longer
maintained. The Commons judgment concerns general telemetry, not those moving
agent-specific conventions.

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

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Maintain datasets, run comparative experiments, attach scores, and
use explicit regression thresholds in a release process.

**Evidence:** Documentation for independently maintained implementations.
[Langfuse evaluation][langfuse] documents experiments, human annotation, and
scoring. [Promptfoo assertions][promptfoo-assertions] and its [CI
integration][promptfoo-ci] provide a separate test-case, scoring, and regression
pipeline. These are alternatives for the machinery, not independent validation
that a particular dataset or model judge is adequate.

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

**Evidence:** Adjacent standards and implementations, not an end-to-end proof.
[LangGraph checkpoints][langgraph], [Temporal history][temporal], and [Langfuse
evaluation records][langfuse] supply useful component records. The [in-toto
Statement v1][in-toto] binds a predicate to artifact digests; signing its
envelope can authenticate that statement. [SLSA v1.2 build
provenance][slsa-provenance] and [GitHub Artifact
Attestations][github-attestations] provide existing formats and tooling for
build evidence.

[SLSA's Verification Summary Attestation, predicate v1][slsa-vsa], is a closer
adjacent model for a decision: it records the subject, verifier, policy, and
verification result, with fields for policy and evidence digests. That supplies
a reusable verification record, not a standard definition of agent acceptance.
This review has not established a complete composition across replacement
runners.

**Limit:** A signature does not make a claim true or its signer authorized to
accept this work. A digest mismatch can reject an approval for different bytes,
but an old artifact and its old valid attestation still match each other. The
consumer needs a trusted expected artifact and current acceptance context.
Identical bytes can also belong to a different task, attempt, or policy version.
Build provenance alone does not establish approval, freshness, or revocation.

**Consequence:** Reuse attestation formats and verification tools before
creating another evidence format. Verify the envelope, allowed signer and
verifier, predicate type, expected artifact digest, policy, and decision
context. Where acceptance depends on task or attempt identity, bind that context
in a signed predicate or digest-bound manifest and compare it with authoritative
current state. Retain the referenced evidence; a digest is not a backup.

**Revisit when:** A concrete composition passes runner-replacement,
wrong-digest, old-artifact replay, changed-policy, and revoked-acceptance tests
without the old chat. Digest binding is already available; complete acceptance
continuity is the unassessed claim. This is not evidence that no existing
product can provide it.

<a id="as-11"></a>

### AS-11: Untrusted-content containment

**Maturity:** Edge

**Confidence:** Medium

**Last verified:** 2026-10-12

**Scope:** Constrain the unauthorized actions and data disclosure that retrieved
content, repository text, or tool output can induce, under an explicit threat
model. This assesses consequence containment, not a guarantee that the model
never interprets external content as instructions.

**Evidence:** Bounded research, first-party operational description, and
security guidance. [CaMeL, paper revision 2][camel], demonstrates separation of
control and data flow with tool-access policies in an evaluated agent setting.
[OpenAI's 11 March 2026 defense account][injection-defense] describes
constraining actions and sensitive-data transmission even when manipulation
succeeds. [OWASP LLM01:2025][owasp-injection] recommends least privilege,
approval for high-risk actions, and adversarial testing while identifying limits
to prevention. These support pilotable controls, not a generally demonstrated
isolation guarantee.

**Limit:** Input classifiers, delimiters, and model instructions do not by
themselves establish an enforcement boundary. A permitted connector or egress
route can still carry an unauthorized disclosure. Benchmark results cover their
attack model, and a model-generated approval summary can itself be manipulated.
Command containment in AS-09 does not cover every application-level action.

**Consequence:** Treat retrieved content and model output as untrusted at the
action boundary. Enforce permissions, destinations, and data-access rules
outside the exposed model; show the actual proposed operation and recipient
through a trusted approval path. Test malicious tool output, repository
instructions, and allowed-channel exfiltration. A second model reviewing the
same injected context is not an independent security boundary.

**Revisit when:** A supported control demonstrates adaptive-attack resistance
and acceptable task utility for the actual tools, sensitive data, and permitted
destinations, or an attack bypasses that boundary. Assess the stronger guarantee
of instruction isolation separately rather than inferring it from containment.

## Unresolved questions

The most useful missing evidence concerns complete paths, not longer feature
lists. Can delegated access be revoked during a running task without leaving a
usable downstream credential? Where does a replacement runner obtain the trusted
expected artifact and current acceptance state, so an old artifact and a valid
old attestation cannot be replayed together? Can the workflow constrain harmful
actions through its allowed connectors even after malicious content persuades
the model? Can a trace remain useful after redaction and sampling without
becoming the only copy of the evidence?

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
silently recast as newly discovered progress. If the scope changes, name that
change instead of moving the goalposts to preserve a tier.

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

### 2026-10-12: Evidence and scope correction

Corrected confidence from High to Medium for AS-01, AS-02, AS-04, AS-05, AS-07,
and AS-08: the baseline mistook clear documentation for strong support of a
maturity judgment. Added alternative implementations where the evidence was a
single feature page. These are corrections to this register, not regressions in
the underlying capabilities.

Changed AS-06 from Edge to Commons, with Medium confidence, for its basic
exchange scope. The stable specification, implementation path, and reported
adoption support reuse; the original judgment demanded acceptance and recovery
guarantees outside that scope while not demanding them from MCP. Version and
failure-path compatibility remain explicit limits. Pinned A2A v1.0.0 and
recorded reported adoption and AAIF hosting without treating either as
independent conformance testing.

Kept AS-03 Edge while adding the OAuth and WIMSE process evidence. Added the
Thoughtworks counterposition to AS-02. Kept AS-10 Unassessed for complete
continuity, adding in-toto, SLSA, GitHub attestations, and the distinction
between digest mismatch and replay. AS-09 was already Edge and remains
unchanged. Added AS-11 as Edge/Medium for containment, explicitly excluding
guaranteed instruction isolation. No new deployment or comparative test is
claimed.

[codex]: https://learn.chatgpt.com/docs/codex/cli
[claude-code]: https://code.claude.com/docs/en/overview
[claude-mcp]: https://code.claude.com/docs/en/mcp
[radar-faq]: https://www.thoughtworks.com/radar/faq
[mcp]: https://modelcontextprotocol.io/specification/2026-07-28
[mcp-auth]:
  https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization
[mcp-caution]: https://www.thoughtworks.com/radar/techniques/mcp-by-default
[exchange]: https://www.rfc-editor.org/rfc/rfc8693.html
[oauth-charter]: https://datatracker.ietf.org/doc/charter-ietf-oauth/06/
[wimse-minutes]:
  https://datatracker.ietf.org/doc/minutes-interim-2026-wimse-01-202606031500/00/
[identity-chaining]:
  https://www.ietf.org/archive/id/draft-ietf-oauth-identity-chaining-17.html
[identity-status]:
  https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/
[agent-delegation]:
  https://www.ietf.org/archive/id/draft-sweeney-wimse-credential-delegation-00.html
[opa]: https://www.openpolicyagent.org/docs/integration
[cedar]: https://docs.cedarpolicy.com/
[temporal]: https://docs.temporal.io/workflow-execution
[langgraph]: https://docs.langchain.com/oss/python/langgraph/persistence
[a2a]: https://a2a-protocol.org/v1.0.0/specification/
[a2a-adoption]:
  https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year
[a2a-aws]:
  https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-a2a.html
[a2a-aaif]: https://aaif.io/blog/a2a-joins-aaif
[otel-status]: https://opentelemetry.io/docs/specs/status/
[otel-genai]: https://opentelemetry.io/docs/specs/semconv/gen-ai/
[langfuse]: https://langfuse.com/docs/evaluation/overview
[promptfoo-assertions]:
  https://www.promptfoo.dev/docs/configuration/expected-outputs/
[promptfoo-ci]: https://www.promptfoo.dev/docs/integrations/ci-cd/
[sandbox]: https://code.claude.com/docs/en/sandboxing
[in-toto]: https://in-toto.io/Statement/v1
[slsa-provenance]: https://slsa.dev/spec/v1.2/build-provenance
[slsa-vsa]: https://slsa.dev/spec/v1.2/verification_summary
[github-attestations]:
  https://docs.github.com/en/actions/concepts/security/artifact-attestations
[camel]: https://arxiv.org/abs/2503.18813v2
[injection-defense]:
  https://openai.com/index/designing-agents-to-resist-prompt-injection/
[owasp-injection]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
