---
title: Why production access changes the shape of agent tooling
role: synthesis
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-08-16
lastRevised: 2026-08-16
projects:
  - vuoro
relates:
  - the-agent-is-not-the-application
  - authority-must-travel-with-the-action
  - legibility-is-an-operating-property
  - a-field-guide-to-assurance-managed-ai-development
  - a-platform-capability-does-not-exist-all-at-once
draft: false
terms:
  - term: Vuoro
    definition:
      The public label for this family of small, separately owned agent-workflow
      tools.
  - term: Outctl
    definition:
      A tool that captures a command's full output outside the agent's context
      and returns a bounded projection the agent can query later for the omitted
      evidence.
tags:
  - agents
  - harness-engineering
  - cluster-operations
  - authorization
  - evidence
summary:
  Production access exposes the limits of prompt-only agent design. A useful
  operational run binds a general harness to domain context, scoped authority,
  evidence, and completion rules.
explorePrompt: >-
  Use this note as one worked instantiation, not an architecture to repeat. The
  transferable question is how to adapt a general-purpose agent harness for
  consequential, stateful work without giving it an unrestricted interface or
  building a separate agent for every domain. This note concludes that the
  reusable unit is a general execution substrate plus a versioned binding of
  informational, procedural, operational, and authority context for one run. Its
  Kubernetes case is constrained by volatile live state, open-ended diagnosis,
  evidence that must survive the session, operator interruption, and the fact
  that read-only credentials do not define a sufficient investigation. Apply the
  question to one operational domain in your context. Identify which constraints
  differ, which substrate responsibilities can be reused, which knowledge and
  interfaces must remain domain-specific, and whether the work needs an
  execution profile or a genuinely persistent agent with its own responsibility
  or identity. Challenge the conclusion where a fixed workflow is sufficient,
  where the proposed binding cannot be enforced, or where specialization belongs
  at a different boundary. Produce a compact session-binding map, the main
  failure cases, and an evaluation plan that holds task, authority, environment,
  and completion criteria fixed across harnesses.
---

I wanted a coding agent to assess the health of a Kubernetes cluster without
pouring every line of `kubectl` output into its context or asking it to repeat
live commands whenever it needed one omitted detail.

Read-only credentials solved only the most obvious problem. They prevented a
class of mutations, but they did not tell the agent which cluster it was
observing, which systems were managed through GitOps, whether a failed
reconciliation was still progressing, which evidence had already been captured,
or when the investigation had enough support for a conclusion.

A short `kubectl` command can be harmless, misleading, expensive, or destructive
depending on the cluster, namespace, identity, timing, and intent. Its syntax
contributes less risk than the conditions around its use.

That makes production access a useful architecture test. It exposes what a
prompt, a tool schema, or a named “cluster agent” would otherwise leave
implicit. The reusable unit is increasingly a general execution harness plus a
versioned domain binding for one run.

## Production work follows evidence

A failed deployment may begin as a Flux reconciliation problem, turn out to be a
storage attachment issue, and finally trace back to an unhealthy node. The next
deployment with the same visible symptom may have nothing in common with it.

An operator observes something, forms a provisional explanation, asks for more
specific evidence, and changes direction when that explanation fails. The next
action depends on the previous result. A fixed workflow works well when the
valid path can be enumerated; an investigation needs room to follow the system.

This is the useful distinction in Anthropic's account of
[workflows and agents](https://www.anthropic.com/engineering/building-effective-agents):
workflows follow predefined code paths, while agents choose their process and
tools from environmental feedback. Production diagnosis often needs the second
behaviour. It does not follow that the agent should receive an unrestricted
terminal.

A general coding harness already has much of the required interaction loop. It
can inspect repositories, run commands, retain working state, revise a plan,
request approval, and return intermediate findings. The missing part is a
stronger binding between that loop and the operational environment.

That interaction loop is also getting stronger on its own. Current harnesses can
increasingly write a bounded program that calls several eligible tools, loops
and branches, filters and aggregates their intermediate results, and runs
independent calls in parallel — without putting every raw result in front of the
model between operations. Anthropic's programmatic tool calling and OpenAI's
Responses API equivalent both do this inside the platform now, not as something
a surrounding wrapper has to build. That does not remove the need for a binding;
it moves the "general harness" baseline forward and narrows what a
domain-specific wrapper still has to contribute.
[A platform capability does not exist all at once](/notes/a-platform-capability-does-not-exist-all-at-once/)
works through one case where that shift arrived late enough to invalidate a
wrapper's original reason for existing.

The binding should help the operator too. The agent ought to retrieve a slice of
an earlier observation instead of silently rerunning a volatile command. A
finding should point to the evidence that produced it. The operator should be
able to interrupt the run, inspect the same evidence, change its mode, or grant
one narrow capability without replacing the whole session.

The harness is then part of the reasoning and safety model, not a thin wrapper
around the model.

## Context includes the environment

“Give the agent more context” usually suggests another instruction file. Text
helps, but an operational run receives at least four different kinds of context.

**Informational context** describes what is true: architecture, cluster
topology, deployed services, ownership, prior incidents, and live state. Some
belongs in a repository or maintained knowledge system. Some must be observed
from the target during the run.

**Procedural context** describes how the work should proceed: inspect GitOps
state before workloads, use an evidence gateway for large outputs, preserve
references, and stop gathering once the completion test has been met. Project
guidance, skills, and workflow contracts carry this material.

**Operational context** determines what the actor can see and do, and in which
representation. A raw shell, a typed cluster capability, and a command wrapper
that preserves complete output while returning a bounded projection are
different operating environments even when they eventually invoke the same
binary.

**Authority context** determines what this attempt may decide. A read-only
health assessment and a remediation run can use the same model and domain
knowledge while remaining materially different actors. Identity, permitted
targets, approvals, escalation, and completion conditions belong here.

Important authority and lifecycle rules should not depend on the model
remembering a sentence.
[Authority must travel with the action](/notes/authority-must-travel-with-the-action/)
describes the action envelope around consequential work;
[The agent is not the application](/notes/the-agent-is-not-the-application/)
places durable records, permissions, verification, and recovery outside the
model.

This broader meaning of context also explains why interface work changes agent
performance. The [SWE-agent study](https://arxiv.org/abs/2405.15793) found that
a purpose-built agent-computer interface materially improved how a
language-model agent navigated repositories, edited files, and ran tests. The
result was not a larger prompt. The environment had become easier for the agent
to operate.

## The project has to become agent-legible

The adaptation is bidirectional. The harness becomes project-aware, and the
project has to expose a form the harness can inspect and test.

That means machine-discoverable architecture, explicit invariants, executable
validation, useful error messages, accessible logs and metrics, versioned
decisions, and small entry points into deeper material. A directory full of
documents is not yet a navigable knowledge system.

OpenAI's account of
[harness engineering with Codex](https://openai.com/index/harness-engineering/)
describes an early failure caused by an underspecified environment rather than
an incapable model. The team replaced one large instruction file with a short
map into structured repository knowledge, exposed the application's UI and
observability to the agent, and enforced architectural rules with linters and
structural tests.
[Codex's customization surfaces](https://learn.chatgpt.com/docs/customization/overview)
make the same division visible: project guidance carries durable repository
rules, skills package repeatable procedures, external tools provide
capabilities, and
[sandbox and approval settings](https://learn.chatgpt.com/docs/sandboxing)
constrain execution.

The point is not to reproduce that repository. It is to notice where the work
moved. Reliability came from changing what the agent could discover, observe,
execute, and verify.

## Specialize the run

A cluster-operations agent does not always need to be a separate agent
implementation. It can be one instantiation of a general harness:

```text
general harness
+ cluster-operations profile
+ project and live context
+ current task state
+ scoped authority
+ completion contract
= running cluster operator
```

The same harness can be bound differently for release validation, repository
maintenance, or architecture review. Its model loop and basic execution
machinery remain similar. The binding changes.

That binding should be resolved before the model begins foundational decisions
and recorded for the life of the attempt. It should identify the task and
workspace revision, the active instructions and skills, available tools,
authority, evidence policy, operating limits, and terminal conditions. The model
may discover optional material later; it should not discover for itself whether
the session happens to be read-only.

There are still good reasons to create a named, persistent agent. It may own an
ongoing inbox, hold a separate security identity, retain private state, carry an
operational service level, or perform an independent approval role. Without one
of those durable responsibilities, a named agent is often an execution profile
wearing a staff badge.

## General substrate, domain binding

The boundary is not “generic” on one side and “Kubernetes” on the other. The
useful split follows what can safely be reused.

| Layer          | Reusable responsibility                                         | Cluster-specific responsibility                                            |
| -------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Tool interface | Capture, provenance, bounded projection, retrieval              | Useful Kubernetes and Flux observations; read versus disguised mutation    |
| Session        | Interruption, budgets, terminal states, evidence retention      | What a cluster-health assessment must inspect and establish                |
| Project        | Revisioned guidance, discovery, executable checks               | Topology, GitOps entry points, ownership, and definitions of healthy state |
| Control plane  | Claims, isolation, authority binding, audit, provider selection | Which profile and capability set apply to this operational task            |

Making the right-hand column completely generic reduces every environment to a
bag of shell commands and prose. Building a new agent for every row duplicates
session management, permission handling, evidence capture, and completion logic.

Keep the execution substrate general, and specialize the run through an explicit
domain binding.

## What this changes in Vuoro

This shifts how I describe [Vuoro](/projects/vuoro/). Its durable role is not to
replace Codex, Claude Code, OpenCode, or whatever capable harness comes next. It
is the control plane that decides what a particular run means.

For one attempt it can bind the claimed work, workspace, current knowledge,
capabilities, authority, evidence rules, and completion contract, then launch a
selected harness. The resulting session binding is the important artifact. It
makes provider comparisons possible without silently changing the task or
permission model, and it gives a failed run more reconstructable state than its
final answer.

The surrounding components already have narrower jobs. Work and dispatch systems
own claims and lifecycle. A knowledge system supplies maintained decisions. An
evidence system records observations and findings. The cockpit shows their
composed state without becoming a second owner of it. General harnesses remain
replaceable execution engines.

This is a governed execution substrate, not a promise of universal autonomy.

## PTC owns the hot path; evidence may still survive outside it

`outctl` began with the output problem that triggered this note. Operational
commands can produce far more text than an agent should place in working
context. Passing everything through is expensive and distracting. Truncating the
result may remove the relevant line. Summarizing it immediately adds an
interpretation before the investigation has begun. Running the command again
later observes a different moment.

Its proposed contract was deliberately smaller:

```text
execute once
-> capture the complete result
-> return a bounded initial view
-> retrieve deterministic slices later
-> preserve provenance
```

Native programmatic tool calling has since become the preferred boundary for
that hot-path work. A bounded program in the harness can loop, branch, call
tools in parallel, filter and aggregate intermediate results, and suppress
irrelevant output before anything reaches the model — without another wrapper
sitting in front of the command.
[A platform capability does not exist all at once](/notes/a-platform-capability-does-not-exist-all-at-once/)
traces how that capability arrived and why an external wrapper stops being the
only way to keep large intermediate results out of context once it is available
and enabled.

That does not settle the surrounding questions this note is actually about. The
runner or application still owns credentials, target scope, permissions,
approvals, and execution receipts; moving the loop into code does not turn the
model into the authorization layer. A separate capability may still be useful
for durable addressed observations — evidence that survives past the request
that produced it, can be retrieved deterministically after a session is
compacted or cleared, and remains inspectable for policy and provenance. PTC
does not own that by itself, and `outctl` has not yet earned ownership of it
either; the residual case has to be won against a simpler runner or tracing
capability, not assumed.

This note's main conclusion is unaffected: the reusable unit is a general
execution substrate plus a versioned binding of informational, procedural,
operational, and authority context for one run. PTC makes the substrate stronger
at one interface. It does not remove the binding.

## The next test is a complete run

Production access forces several questions into the open:

- Which identity is acting?
- What can it observe and change?
- Which project and operational context applies?
- Can the operator inspect, interrupt, or narrow the work?
- Which evidence survives the session?
- What counts as a conclusion, a blocker, or an escalation?

Answering them does not make production access safe by declaration. It makes a
run bounded enough to evaluate.

The first useful evaluation is therefore not an output-token contest. A
cluster-health profile should be run across more than one general harness and
scored for routing, conclusion quality, evidence reuse, context exposure,
termination behaviour, cost, and audit completeness. The comparison is valid
only if the task, authority, workspace, and completion contract remain fixed —
and execution topology now has to be an explicit, recorded variable rather than
an assumed constant:

```text
same task
same domain binding
same authority
same completion contract

but record:
- native PTC available?
- PTC actually selected for this run?
- which tools were eligible for it?
- how much intermediate evidence reached the model versus stayed in the
  bounded program?
- what happens to that evidence once the request or session ends?
```

A direct-tool-call harness and a PTC-capable harness are not the same execution
topology, and treating them as interchangeable would silently confound the
result.

The working conclusion is narrower than “build agents differently.” Production
work needs a stochastic reasoner inside an auditable operating envelope. The
portable architectural object is the binding that assembles that envelope for
one run. Whether the same binding survives contact with several harnesses is the
next result that has to be earned.

## Sources and further study

- [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [OpenAI: Harness engineering—leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [Codex customization](https://learn.chatgpt.com/docs/customization/overview)
- [Codex sandboxing and approvals](https://learn.chatgpt.com/docs/sandboxing)
