---
title: A field guide to assurance-managed AI development
role: synthesis
status: guiding
lifecycle: current
area: software assurance
published: 2026-07-20
lastRevised: 2026-08-08
projects:
  - vuoro
relates:
  - where-the-assurance-questions-are-already-answered
  - the-agent-is-not-the-application
  - the-work-between-the-ticket-and-the-agent
  - derived-status-is-earned
tags:
  - assurance
  - agents
  - software-engineering
  - references
summary: A reading map for building AI systems that can show what they were asked to do, what they did, why a result should be trusted, and how failures are contained. It starts with established assurance practice and ends with a dated watch list of open work.
explorePrompt: >-
  Build or update a field guide for assurance-managed AI development in my
  context: [describe the domain, system, risk, team, and tools]. Use this note
  as one worked map, not as a bibliography to copy. Organize the result by the
  engineering question each source answers: intent, assurance arguments,
  verification, tool qualification, lifecycle integration, provenance,
  authority, runtime evidence, resilience, and AI-specific workflow
  composition. Separate two tiers: established methods with a real study path,
  and a dated watch list for active composition work. Prefer primary sources,
  standards, research programmes, and concrete industrial reports; verify
  every link, date, attribution, and maturity claim. For each entry, state what
  it supports and what it does not solve. Then map the guide onto my own
  terminology and practices, identify where my constraints differ from the
  note's single-operator homelab and small-project baseline, and recommend the
  shortest reading and experimentation path. Do not infer an unsolved problem
  from poor adoption, and do not present an active research stream as a
  settled method.
---

A coding agent receives a task, edits a repository, runs tests, and reports that
the work is complete. To decide whether that result can be used, I need answers
to several older engineering questions:

- What was the system supposed to do?
- Which claim do the tests or reviews support?
- Did the approved inputs and tool produce this exact output?
- Which permissions applied to the action?
- What happens when a check misses a defect?

Those questions do not form a new discipline called agent assurance. They
belong to requirements engineering, assurance cases, formal methods, tool
qualification, secure development, supply-chain security, runtime verification,
and resilience engineering.

This guide is organized by the question each field helps answer. For every
source, it also states what the source does not establish. That second part is
important: provenance can prove where an image came from without proving the
image is correct, and a passing test can verify a requirement without showing
that the requirement was the right one.

## The shortest useful route

For a first pass, read in this order:

1. [SEBoK: Requirements Engineering](https://sebokwiki.org/wiki/Requirements_Engineering),
   [System Verification](https://sebokwiki.org/wiki/System_Verification), and
   [System Validation](https://sebokwiki.org/wiki/System_Validation).
2. The SEI introductions to [assurance
   cases](https://www.sei.cmu.edu/library/assurance-cases-overview/) and
   [assurance-case resources](https://www.sei.cmu.edu/library/resources-for-assurance-cases/).
3. [Formal Arguments for Large-Scale
   Assurance](https://www.sei.cmu.edu/annual-reviews/2023-research-review/formal-arguments-for-large-scale-assurance-falsa/)
   for systems that keep changing.
4. [RTCA DO-330](https://www.rtca.org/products/do-330/) and
   [ISO 26262-8](https://www.iso.org/standard/68390.html) for the choice between
   trusting a tool and checking its output.
5. [NIST SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final) for secure
   development across the lifecycle.
6. [in-toto](https://in-toto.io/docs/getting-started/) and
   [SLSA 1.2](https://slsa.dev/spec/v1.2/) for recording how an artifact was
   produced.
7. [NIST SP 800-160 Volume
   2](https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final) for recovery when
   prevention is incomplete.
8. [Trusted AI-assisted
   Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/)
   and [Programming with Trust](https://arxiv.org/abs/2502.13767) for current
   work that connects those methods to coding agents.

The sequence starts with intent and ends with agents. Starting with agent tools
makes familiar engineering controls look newer and stranger than they are.

## What should the system do?

Requirements engineering separates what stakeholders need from the properties
the system must satisfy. It also distinguishes verification—did we build the
specified thing?—from validation—does the integrated system serve its intended
use in its real environment?

| Source                                                                                                                               | Use it for                                                                                                   | It does not decide                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [SEBoK: Requirements Engineering](https://sebokwiki.org/wiki/Requirements_Engineering)                                               | Eliciting, analysing, defining, and maintaining requirements.                                                | Which stakeholder objective should win.                             |
| [SEBoK: System Requirements Definition](https://sebokwiki.org/wiki/System_Requirements_Definition)                                   | Writing necessary, feasible, traceable, and verifiable requirements.                                         | Whether the selected outcome is socially or commercially right.     |
| [SEBoK: Verification](https://sebokwiki.org/wiki/System_Verification) and [Validation](https://sebokwiki.org/wiki/System_Validation) | Separating conformance from fitness for intended use.                                                        | The other half of that distinction.                                 |
| [Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/)                 | Research on turning natural-language intent into specifications, tests, and verification-aware interactions. | Whether the formalized intent is the intent people actually wanted. |

A prompt is not a requirements process. A passing test suite is not, by itself,
validation.

## Why should a claim be believed?

An assurance case connects a specific claim to an argument and supporting
evidence. It also exposes assumptions and context. This is a better model than
attaching a generic confidence badge to a build.

| Source                                                                                                                                                           | Use it for                                                           | It does not provide                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| [SEI: Assurance Cases Overview](https://www.sei.cmu.edu/library/assurance-cases-overview/)                                                                       | The basic claim–argument–evidence structure.                         | The engineering work that produces good evidence.            |
| [GSN Community Standard](https://scsc.uk/gsn)                                                                                                                    | A notation for goals, strategies, evidence, and assumptions.         | Sound reasoning merely because the diagram is neat.          |
| [OMG SACM](https://www.omg.org/spec/SACM/2.2/About-SACM)                                                                                                         | A structured interchange model for claims, arguments, and artifacts. | A convincing argument merely because it is machine-readable. |
| [SEI: Formal Arguments for Large-Scale Assurance](https://www.sei.cmu.edu/annual-reviews/2023-research-review/formal-arguments-for-large-scale-assurance-falsa/) | Maintaining assurance arguments as systems and evidence change.      | Proof that reassessment is already cheap or automatic.       |

This is where the local phrase “derive status only from reproducible evidence”
belongs. The evidence supports a named claim about an identified configuration;
it is not a permanent property of the file that happened to pass.

## How can the design or implementation be checked?

Different methods support different claims:

| Source                                                                                                                           | Useful claim                                                                                   | Limit                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [TLA+](https://lamport.azurewebsites.net/tla/tla.html) and [Specifying Systems](https://lamport.azurewebsites.net/tla/book.html) | A model of a concurrent or distributed design satisfies checked safety or liveness properties. | The implementation may differ, and the specification may be wrong. |
| [Dafny](https://dafny.org/)                                                                                                      | Code satisfies stated preconditions, postconditions, and invariants.                           | The stated properties may omit the real requirement.               |
| [AWS use of formal methods](https://www.amazon.science/publications/how-amazon-web-services-uses-formal-methods)                 | Formal specification can find design defects in production-scale distributed systems.          | Every system needs the same level of formal work.                  |
| [Cedar](https://docs.cedarpolicy.com/)                                                                                           | Authorization policy can be separated, analysed, and checked against a formal model.           | Assurance of the whole application.                                |
| [Runtime Verification](https://runtime-verification.github.io/)                                                                  | A running system can be monitored against a specification.                                     | Claims about unobserved paths unless the monitor enforces them.    |

A small TLA+ model of a dangerous state transition and a verified program are
both formal work. They answer different questions and cost different amounts.

## Can the producer be trusted instead of every output?

Safety-critical engineering already has a direct answer. A development tool is
qualified to a level appropriate to the errors it can introduce, or its output
is verified.

| Source                                                 | Use it for                                                                     | Limit                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [RTCA DO-330](https://www.rtca.org/products/do-330/)   | Tool qualification in airborne systems.                                        | It does not remove output checking when the tool cannot be qualified. |
| [ISO 26262-8](https://www.iso.org/standard/68390.html) | Confidence in software tools used for automotive development and verification. | Domain-specific judgment is still required.                           |
| [CompCert](https://compcert.org/)                      | The limit case: a compiler backed by a formal correctness proof.               | The source program and specification can still be wrong.              |

A general language model is non-deterministic, can inject many classes of error,
and is opaque to the analysis these regimes expect. Under this framework, that
selects output verification. It does not justify trusting generated code because
the model is widely used or because the output looks conventional.

## How does this fit ordinary development?

| Source                                                                                                          | Use it for                                                                                          | It does not provide                                            |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)                       | Secure practices integrated through an existing development lifecycle.                              | Local implementation or risk decisions.                        |
| [SEBoK: Model-Based Systems Engineering](https://sebokwiki.org/wiki/Model-Based_Systems_Engineering_%28MBSE%29) | Maintaining relationships among requirements, architecture, analysis, verification, and validation. | Useful models without a maintenance discipline.                |
| [AI for the SDLC](https://code.mil/AI4SDLC/)                                                                    | Current guidance on autonomy levels, workflow controls, and human–AI teaming.                       | A universal architecture or proof that a chosen agent is safe. |
| [GitHub Spec Kit](https://github.github.com/spec-kit/)                                                          | A concrete separation of specification, planning, tasks, and implementation.                        | Independent evidence that the implementation is correct.       |

The test is simple: do the lifecycle controls still work when an agent performs
the implementation step? Renaming the lifecycle “agentic” does not strengthen
it.

## Who produced this result?

| Source                                              | Use it for                                                                                 | It does not establish                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [in-toto](https://in-toto.io/docs/getting-started/) | Authorized supply-chain steps, actors, materials, products, and signed execution metadata. | That the requested software was semantically correct.            |
| [SLSA 1.2](https://slsa.dev/spec/v1.2/)             | Incremental source and build integrity guarantees and verifiable provenance.               | That the source itself should be trusted.                        |
| [Sigstore](https://docs.sigstore.dev/)              | Identity-bound signing and transparent verification of artifacts and attestations.         | A policy deciding which identities and workflows are acceptable. |

These methods make attempt records and artifact lineage stronger than ordinary
logs. They still cannot prove that the result was wanted.

## Who may act, and what happens after failure?

The [reference monitor and security-kernel
model](https://csrc.nist.gov/glossary/term/security_kernel) says the trusted
mechanism should mediate relevant access, resist modification, and be small
enough to inspect. [Cedar](https://docs.cedarpolicy.com/) provides one practical
example: principals, actions, resources, and context are evaluated by a policy
engine rather than left to an agent to interpret from prose.

Prevention will remain incomplete. Recovery therefore belongs in the design:

| Source                                                                                     | Use it for                                                                                 | It does not replace                                                   |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [NIST SP 800-160 Volume 2](https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final)              | Designing systems to anticipate, withstand, recover from, and adapt to adverse conditions. | Prevention or tested recovery procedures.                             |
| [Google SRE books](https://sre.google/books/)                                              | Monitoring, gradual rollout, incident response, error budgets, and rollback.               | Formal proof or domain-specific safety assurance.                     |
| [Google SRE: Safe configuration change](https://sre.google/workbook/configuration-design/) | Gradual deployment, stop conditions, hermetic change, and rollback.                        | A safe underlying state transition merely because rollout is gradual. |

An agent should not be able to grant itself a permission, redefine a failed
check, or hide the information needed to undo its action.

## AI-specific work worth following

The established material above supplies the vocabulary and methods. Current AI
work asks how to combine them without making every change prohibitively
expensive.

Useful starting points include:

- [Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/)
  and [Programming with Trust](https://arxiv.org/abs/2502.13767), which connect
  agents with specification, testing, analysis, and verification;
- [AI for the SDLC workflow
  guidance](https://code.mil/AI4SDLC/plays/ai_sdlc_workflows-play/), which works
  through task autonomy and oversight;
- [DARPA AI Cyber Challenge
  results](https://www.darpa.mil/news/2025/aixcc-results), which demonstrate
  automated analysis and patching at substantial scale;
- [METR's developer
  RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/),
  which found experienced developers slower with AI assistance while they
  believed they were faster;
- [DORA's State of AI-assisted Software
  Development](https://dora.dev/research/2025/dora-report/) and
  [AI Capabilities Model](https://dora.dev/research/ai/ai-capabilities-model/),
  which examine AI in delivery processes rather than as an isolated tool; and
- the public [Exploring Gen
  AI](https://martinfowler.com/articles/exploring-gen-ai.html) series, including
  work on human intervention, internal quality, spec-driven development,
  [harness
  engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering-memo.html),
  and [context
  engineering](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html).

This section is a dated watch list, not a curriculum. Research programmes,
practitioner reports, government guidance, and vendor-sponsored surveys carry
different kinds of evidence. None yet supplies a settled, proportionate method
for composing all the controls above.

## How this changes the local vocabulary

| Local note                                                                                              | Established neighbourhood                                                | Correction to keep                                                            |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [Derive status only from reproducible evidence](/notes/derived-status-is-earned/)                       | Assurance cases and configuration identification                         | Attach evidence to a claim and configuration, not a generic status.           |
| [The agent is not the application](/notes/the-agent-is-not-the-application/)                            | Reference monitors and trusted computing bases                           | Keep the trusted mechanism smaller than the whole application.                |
| [The work between the ticket and the agent](/notes/the-work-between-the-ticket-and-the-agent/)          | Requirements traceability, provenance, and separation of duties          | Treat a neutral attempt record as one implementation choice, not a new field. |
| [The missing layer is binding, not intelligence](/notes/the-missing-layer-is-binding-not-intelligence/) | Systems integration, assurance cases, MBSE, and configuration management | Test the proposed bindings against established lifecycle methods.             |

## Maintenance rule

Add a resource only when the entry can answer four questions:

1. Which engineering question does it help answer?
2. Which claim can its method support?
3. What does it leave unsolved?
4. What kind of source is it: standard, primary documentation, research result,
   industrial report, or interpretation?

Do not call a problem unsolved merely because the established method is
expensive or poorly adopted. Do not call a structured agent workflow assurance
merely because it produces more files than a chat session.

The purpose of this guide is modest: provide a reliable route from an agent
workflow problem to the engineering fields that already know how to name and
test it.
