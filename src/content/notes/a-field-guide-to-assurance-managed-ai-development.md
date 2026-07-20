---
title: A field guide to assurance-managed AI development
status: guiding
lifecycle: current
area: software assurance
published: 2026-07-20
lastRevised: 2026-07-20
projects:
  - sprintctl-and-kctl
relates:
  - where-the-assurance-questions-are-already-answered
  - the-application-is-the-assurance-kernel
  - the-work-between-the-ticket-and-the-agent
  - derived-status-is-earned
tags:
  - assurance
  - agents
  - software-engineering
  - references
summary: A maintained reading map in two tiers -- established sources for intent, assurance arguments, verification, authority, provenance, runtime evidence, and resilience, then a short dated watch list for the composition question that is still open.
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

This is a study guide for the questions behind my recent agent-workflow notes. It is not a claim that those questions form a new field. They already belong to software and systems assurance, requirements engineering, formal methods, tool qualification, secure development, supply-chain security, runtime verification, and resilience engineering.

The list is organized by the question a resource helps answer. It prefers standards, research programmes, primary project documentation, and industrial reports over summaries of them. A resource belongs here when it provides a better vocabulary, method, or worked system than I could produce from first principles.

It has two tiers, and the difference matters more than the entries. Most of the map is settled material with a study path. The last section is not: it is a short, dated watch list of streams where the composition question is currently being worked out in public, and it is thin on purpose.

## The shortest useful route

For a first pass, I would read these in order:

1. [SEBoK: Requirements Engineering](https://sebokwiki.org/wiki/Requirements_Engineering), followed by [System Verification](https://sebokwiki.org/wiki/System_Verification) and [System Validation](https://sebokwiki.org/wiki/System_Validation).
2. [SEI: Assurance Cases Overview](https://www.sei.cmu.edu/library/assurance-cases-overview/) and its [assurance-case resource collection](https://www.sei.cmu.edu/library/resources-for-assurance-cases/).
3. [SEI: Formal Arguments for Large-Scale Assurance](https://www.sei.cmu.edu/annual-reviews/2023-research-review/formal-arguments-for-large-scale-assurance-falsa/) for evolving systems and re-assurance.
4. [RTCA DO-330](https://www.rtca.org/products/do-330/) and [ISO 26262-8](https://www.iso.org/standard/68390.html) on tool qualification, with [CompCert](https://compcert.org/) as the limit case.
5. [NIST SP 800-218: Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final).
6. [in-toto](https://in-toto.io/docs/getting-started/) and the [SLSA 1.2 specification](https://slsa.dev/spec/v1.2/).
7. [NIST SP 800-160 Volume 2: Developing Cyber-Resilient Systems](https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final).
8. [Microsoft Research: Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/) and [Agentic AI Software Engineers: Programming with Trust](https://arxiv.org/abs/2502.13767).

That sequence moves from intent, through argument and evidence, into tool qualification, lifecycle controls, provenance, operation, and finally the AI-specific application.

## What is the system supposed to do?

| Resource                                                                                                                                 | Use it for                                                                                                                                      | It does not replace                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [SEBoK: Requirements Engineering](https://sebokwiki.org/wiki/Requirements_Engineering)                                                   | The full requirements process: elicitation, analysis, definition, management, and the relationship between stakeholder and system requirements. | Domain judgment or agreement among stakeholders.                                   |
| [SEBoK: System Requirements Definition](https://sebokwiki.org/wiki/System_Requirements_Definition)                                       | Writing requirements that are necessary, traceable, feasible, and verifiable; planning verification while requirements are created.             | Proof that the selected requirements express the right business or social outcome. |
| [SEBoK: System Verification](https://sebokwiki.org/wiki/System_Verification)                                                             | Distinguishing conformance to a specified requirement from general confidence that something looks correct.                                     | Validation of the intended use.                                                    |
| [SEBoK: System Validation](https://sebokwiki.org/wiki/System_Validation)                                                                 | Establishing that the integrated system satisfies stakeholder needs in its intended operational environment.                                    | Verification of every lower-level implementation element.                          |
| [Microsoft Research: Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/) | Current work on turning natural-language intent into specifications, postconditions, tests, and verification-aware interactions.                | Human responsibility for deciding whether a formalized intent is the intended one. |

This is the first correction to an agent-centric view. A prompt is not a requirements process, and a passing test suite is not validation.

## Why should a claim about the system be believed?

| Resource                                                                                                                                                         | Use it for                                                                                                                                                             | It does not replace                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [SEI: Assurance Cases Overview](https://www.sei.cmu.edu/library/assurance-cases-overview/)                                                                       | The core structure of claim, argument, evidence, assumptions, and reviewable confidence.                                                                               | The engineering work that produces credible evidence.                                                                        |
| [SEI: Resources for Assurance Cases](https://www.sei.cmu.edu/library/resources-for-assurance-cases/)                                                             | A starting library covering security cases, confidence, evidence, and practical construction.                                                                          | A domain-specific safety or security standard.                                                                               |
| [GSN Community Standard](https://scsc.uk/gsn)                                                                                                                    | The graphical notation practitioners actually write assurance-case arguments in: goals, strategies, solutions, assumptions, and their support relationships.           | The reasoning itself; a well-drawn diagram of a weak argument is still weak.                                                 |
| [OMG: Structured Assurance Case Metamodel](https://www.omg.org/spec/SACM/2.2/About-SACM)                                                                         | A standard representation for auditable claims, arguments, evidence, terminology, and artifact relationships; the interchange metamodel underneath notations like GSN. | A convincing assurance argument merely because the data is structured.                                                       |
| [SEI: Formal Arguments for Large-Scale Assurance](https://www.sei.cmu.edu/annual-reviews/2023-research-review/formal-arguments-for-large-scale-assurance-falsa/) | Current work on maintaining and evaluating formal assurance arguments for evolving systems, including runtime evidence.                                                | Evidence that lifecycle assurance lacks established solutions; the research target is faster and more scalable re-assurance. |

This is the established home for the intuition behind "derived status is earned." Evidence is not a badge attached to an object. It supports a particular claim, under stated assumptions, about an identified system configuration.

## How can designs and implementations be checked?

| Resource                                                                                                                                                                                | Use it for                                                                                                                                     | It does not replace                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [TLA+](https://lamport.azurewebsites.net/tla/tla.html) and [Specifying Systems](https://lamport.azurewebsites.net/tla/book.html)                                                        | Precise models of stateful, concurrent, and distributed designs; model checking safety and liveness properties before implementation.          | Implementation-level proof or a correct specification.                                 |
| [Dafny](https://dafny.org/)                                                                                                                                                             | Executable programs with specifications, preconditions, postconditions, invariants, and static verification.                                   | Validation that the specification captures the intended behaviour.                     |
| [How Amazon Web Services uses formal methods](https://www.amazon.science/publications/how-amazon-web-services-uses-formal-methods)                                                      | An industrial account of using formal specification to find design defects in distributed systems.                                             | A claim that every system warrants the same verification cost.                         |
| [Cedar](https://docs.cedarpolicy.com/) and its [verification-guided development account](https://aws.amazon.com/about-aws/whats-new/2023/05/cedar-open-source-language-access-control/) | A concrete example of separating authorization policy from application code and validating a production implementation against a formal model. | Complete application assurance; it addresses authorization decisions.                  |
| [Runtime Verification community](https://runtime-verification.github.io/)                                                                                                               | Specification-based monitoring and analysis during testing or operation, including combinations of static and dynamic techniques.              | Proof over executions that were not observed unless the monitor enforces the property. |

Formal methods are not one tool or one level of effort. A small TLA+ model for a dangerous state transition and a fully verified implementation are both formal work, but they buy different claims.

## When can the producer be trusted instead of the output?

Safety-critical engineering answered this before coding agents existed. Either qualify a development tool to a level commensurate with the errors it can inject, or verify its output. There is no third option, which is exactly why it is the direct answer to trusting generated code without reading every line.

| Resource                                                                                         | Use it for                                                                                                                                              | It does not replace                                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [RTCA DO-330: Software Tool Qualification Considerations](https://www.rtca.org/products/do-330/) | The airborne-systems tool-qualification model: qualifying a tool to a level set by the errors it could introduce, otherwise verifying its output.       | Output verification, when a tool cannot be qualified.                                  |
| [ISO 26262-8: Supporting processes](https://www.iso.org/standard/68390.html)                     | The automotive equivalent -- "confidence in the use of software tools" -- for development and verification tools.                                       | Domain-specific safety judgment about a given tool.                                    |
| [CompCert](https://compcert.org/)                                                                | The limit case: a C compiler whose generator is formally verified, so trust rests on a proof about the producer rather than on re-checking each output. | Validation that the specification the compiler is trusted against is the intended one. |

A language model cannot presently be qualified under these regimes: non-deterministic, unbounded in the errors it can inject, and opaque to the analysis qualification requires. That is not a gap in the framework. The framework's own logic selects the other branch and requires the output to be verified.

## How is assurance integrated into ordinary development?

| Resource                                                                                                        | Use it for                                                                                                                                              | It does not replace                                                                       |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [NIST SP 800-218: Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)           | A lifecycle-wide set of secure development practices that can be integrated into existing SDLC models.                                                  | Organization-specific implementation, evidence, and risk decisions.                       |
| [SEBoK: Model-Based Systems Engineering](https://sebokwiki.org/wiki/Model-Based_Systems_Engineering_%28MBSE%29) | Maintaining formalized relationships among requirements, architecture, analysis, verification, validation, and assurance.                               | Useful models automatically; the model still needs a purpose and disciplined maintenance. |
| [AI for the SDLC](https://code.mil/AI4SDLC/)                                                                    | Current guidance for placing AI into governed software workflows, including autonomy levels, trust boundaries, human-AI teaming, and workflow controls. | A universal commercial architecture or proof that a selected agent is safe.               |
| [GitHub Spec Kit](https://github.github.com/spec-kit/)                                                          | A practical, open-source, specification-driven harness that separates specification, planning, tasks, and implementation for coding agents.             | Assurance cases, independent verification, provenance guarantees, or formal correctness.  |

The relevant question is not whether a lifecycle method uses the word "agent." It is whether its controls still hold when the implementation actor is an agent.

## Who produced this artifact, from what, and under whose authority?

| Resource                                            | Use it for                                                                                                                         | It does not replace                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [in-toto](https://in-toto.io/docs/getting-started/) | Defining authorized supply-chain steps and functionaries, then recording signed metadata about materials, products, and execution. | Requirements traceability or semantic correctness of the produced software. |
| [SLSA 1.2](https://slsa.dev/spec/v1.2/)             | Incremental source and build integrity guarantees, attestation formats, and verifiable provenance.                                 | Trust in the source content itself.                                         |
| [Sigstore](https://docs.sigstore.dev/)              | Signing and verifying artifacts and attestations with identity-bound certificates and transparency logs.                           | A policy deciding which identities, workflows, or claims should be trusted. |

These resources are the closest operational neighbours to attempt records, evidence receipts, and artifact lineage. They show why provenance is more than logging, but also why provenance alone does not establish that the result was wanted or correct.

## How should authority be constrained?

The classical term worth learning is the [reference monitor and security-kernel model](https://csrc.nist.gov/glossary/term/security_kernel). The trusted mechanism must mediate relevant access, resist modification, and be small enough to verify. That is a stricter and more useful boundary than calling an entire application an assurance kernel.

[Cedar](https://docs.cedarpolicy.com/) is a practical example for authorization policy: principals, actions, resources, and context are evaluated by a dedicated policy engine rather than scattered through application code. The broader lesson is not that Cedar is required. It is that authority should be explicit, analyzable, and enforced by a component that does not depend on the agent voluntarily respecting prose.

## What happens when prevention is incomplete?

| Resource                                                                                   | Use it for                                                                                                           | It does not replace                                                       |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [NIST SP 800-160 Volume 2](https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final)              | Engineering systems to anticipate, withstand, recover from, and adapt to adverse conditions and compromise.          | Prevention, or a guarantee that recovery procedures work without testing. |
| [Google SRE books](https://sre.google/books/)                                              | Operational confidence through testing, monitoring, gradual rollout, error budgets, incident response, and rollback. | Formal proof or domain-specific safety assurance.                         |
| [Google SRE: Safe configuration change](https://sre.google/workbook/configuration-design/) | Concrete guidance on gradual deployment, automatic stop conditions, hermetic change, and rollback.                   | A safe underlying state transition merely because deployment is gradual.  |

Recovery is not an apology attached after correctness. It is one of the established ways systems remain dependable when the available assurance is necessarily incomplete.

## What is specifically useful for AI-assisted software development?

| Resource                                                                                                                                            | Use it for                                                                                                                          | Boundary                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/)                                | Research connecting LLMs with specifications, programming languages, testing, analysis, and verification.                           | A research programme, not an off-the-shelf assurance platform.                                 |
| [Agentic AI Software Engineers: Programming with Trust](https://arxiv.org/abs/2502.13767)                                                           | A concise argument for combining coding agents with existing analysis and verification tools rather than trusting generation alone. | An agenda and synthesis, not a complete implementation method.                                 |
| [AI for the SDLC: AI workflow design and governance](https://code.mil/AI4SDLC/plays/ai_sdlc_workflows-play/)                                        | Task-level autonomy, workflow governance, personas, synchronous and asynchronous execution, and human oversight.                    | Context-specific guidance that still requires local policy and implementation.                 |
| [GitHub Spec Kit](https://github.github.com/spec-kit/)                                                                                              | A concrete way to make intent, planning, and tasks durable inputs to an agent workflow.                                             | Structured prompts are not independent evidence that the implementation is correct.            |
| [DARPA AI Cyber Challenge results](https://www.darpa.mil/news/2025/aixcc-results)                                                                   | Evidence that autonomous systems can combine AI with program analysis to find and patch vulnerabilities at substantial scale.       | End-to-end software assurance, requirements validation, or general business-logic correctness. |
| [Martin Kleppmann: Prediction: AI will make formal verification go mainstream](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html) | An accessible argument for pairing cheap code generation with machine-checked specifications and proofs.                            | Evidence that formalization itself is cheap or that the specification is right.                |

The AI-specific material is useful after the assurance vocabulary, not before it. Otherwise ordinary requirements, verification, provenance, and operational controls are easily mistaken for new agent concepts.

None of these resources yet answer the composition question: how to assemble these controls into a proportionate, AI-integrated process, with oversight calibrated to risk and human review placed where it earns its cost. That is a recognized, crowded, open problem -- not a gap this map closes by citation. The map's job is to supply the established primitives it is composed from.

## Where the composition is being worked out

Everything above is a study path: mature methods, primary sources, decades of use. This section is not that. It is a watch list, and it is deliberately dated, because the composition question has no textbook, no curriculum, and no settled reference a newcomer can study. What it has is four active streams, all of them under three years old, most of them still being written.

| Stream                                                                                                                                                                                                                                                                               | Why follow it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Boundary                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Exploring Gen AI](https://martinfowler.com/articles/exploring-gen-ai.html) (Thoughtworks, on martinfowler.com)                                                                                                                                                                      | The closest thing to the composition question worked in public by named practitioners. [Humans and Agents in Software Engineering Loops](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html) (March 2026) is directly about where humans intervene and steer; [Assessing internal quality while coding with an agent](https://martinfowler.com/articles/exploring-gen-ai/ccmenu-quality.html) (January 2026) and [Understanding Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) (October 2025) are worked comparisons rather than positions. [Birgitta Böckeler](https://birgitta.info/) maintains the running state-of-play. | A consultancy essay series. Practitioner reports with the sample size that implies, not measurement.                                                          |
| [DORA: State of AI-assisted Software Development](https://dora.dev/research/2025/dora-report/) and the [AI Capabilities Model](https://dora.dev/research/ai/ai-capabilities-model/)                                                                                                  | The only large-N annual measurement of AI-integrated delivery _processes_ rather than tools. Its core finding is process-level: AI amplifies, magnifying the strengths of high-performing organizations and the dysfunctions of struggling ones, and raising throughput at the cost of stability where the foundation is weak.                                                                                                                                                                                                                                                                                                                                                                     | Google-published; discount accordingly. Survey-based, so it measures perception and correlation, not causal process design.                                   |
| [AI for the SDLC](https://code.mil/AI4SDLC/) -- follow [the repository](https://github.com/Code-dot-mil/AI4SDLC), not the site                                                                                                                                                       | The most credible non-vendor process guidance in existence, and the repository is where the still-unwritten plays get drafted before they appear.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Half-written by construction: the governance play and the calibrated-trust material are still placeholders. A defence-context playbook, not a general method. |
| The trusted-AI-software-engineering agenda -- [Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/), [Programming with Trust](https://arxiv.org/abs/2502.13767), and the SEI's AI-augmented software engineering work | The verification-integration side of the same question: which established analysis attaches where in an agent workflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | A research agenda. It proposes couplings; it does not report the operating cost of a composed process.                                                        |

Two single measurements sit alongside these rather than inside them. [METR's developer RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) is the sharpest available measurement of the review bottleneck -- experienced developers were slower with AI assistance while believing they were faster -- and the [DARPA AI Cyber Challenge results](https://www.darpa.mil/news/2025/aixcc-results) are the sharpest available demonstration of what automated analysis plus generation can do unattended.

One piece of vocabulary is worth taking from this tier: [harness engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering-memo.html) (February 2026), the work of building the constraints, context, and checks an agent runs inside, alongside its sibling [context engineering](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html). It names the thing my agent-workflow notes keep circling, and its date is the point: the composition layer did not have a widely used name until a few months ago. That is not evidence of an unclaimed conceptual layer -- the primitives it composes are all in the sections above -- but it does explain why the layer felt unnamed. It was.

The honest summary of the two tiers: **the primitives have a study path; the composition has a watch list.**

## Mapping these resources back to local notes

| Local phrase or note                                                                                    | Established neighbourhood                                                                        | Consequence                                                                                                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| [Derived status is earned](/notes/derived-status-is-earned/)                                            | Assurance cases, confidence arguments, evidence validity, configuration identification           | Keep the evidence intuition; replace local status language with explicit claims and applicability where useful. |
| [The application is the assurance kernel](/notes/the-application-is-the-assurance-kernel/)              | Reference monitors, trusted computing bases, authorization policy, runtime enforcement           | Narrow the trusted component. The application may own an assurance process without being a verifiable kernel.   |
| [The work between the ticket and the agent](/notes/the-work-between-the-ticket-and-the-agent/)          | Requirements traceability, workflow provenance, separation of duties, in-toto-style attestations | Treat a neutral attempt record as a local design option, not an unoccupied industry layer.                      |
| [The missing layer is binding, not intelligence](/notes/the-missing-layer-is-binding-not-intelligence/) | Systems integration, digital thread, assurance cases, MBSE, configuration management             | Test the proposed binding against established lifecycle models before claiming a missing abstraction.           |

## Maintenance rule

New entries should answer four questions:

1. What engineering question does this resource answer?
2. What claim can its method support?
3. What does it explicitly not solve?
4. Is it a primary source, a standard, an industrial report, a research result, or an accessible interpretation?

The note should not promote a problem to "unsolved" because the method is expensive, unfamiliar, or poorly adopted. It should also not promote a tool to "assurance" because it produces more structured output than a chat session.

The purpose is smaller: keep a reliable route back to the fields that already know what these questions are called.
