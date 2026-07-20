---
title: Where the assurance questions are already answered
status: exploration
lifecycle: current
area: software assurance
published: 2026-07-20
lastRevised: 2026-07-20
projects:
  - sprintctl-and-kctl
relates:
  - a-field-guide-to-assurance-managed-ai-development
  - the-application-is-the-assurance-kernel
  - the-work-between-the-ticket-and-the-agent
  - derived-status-is-earned
  - the-missing-layer-is-binding-not-intelligence
tags:
  - assurance
  - agents
  - software-engineering
  - study-notes
summary: The assurance questions behind my recent agent-workflow notes are established engineering problems. The useful work is learning their vocabulary and testing their methods at small scale.
explorePrompt: >-
  Use this note as a worked instantiation, not an answer to repeat. Analyze how
  trustworthy AI-assisted software development should be handled in my context:
  [describe the system, domain, team, consequences, and current controls]. Map
  my concerns and local vocabulary to established disciplines before proposing
  new abstractions: requirements engineering, verification and validation,
  assurance cases, tool qualification, reference monitors, provenance, secure
  development lifecycles, runtime verification, and resilience. Apply the
  generator decision rule: when the producer cannot be qualified, verify its
  output or constrain what that output can affect. Separate mature assurance
  primitives from the still-evolving problem of composing them into a
  proportionate AI-integrated workflow. Compare my constraints with this
  note's single-operator, small-project, repository-backed instantiation.
  Identify where they diverge, which conclusions survive, and which controls
  should change. Challenge novelty claims, distinguish weak adoption from
  missing methods, verify factual claims against primary current sources, and
  finish with a risk-calibrated process, verification and recovery paths, and
  the limited claims my implementation can honestly support.
---

I arrived at software assurance backwards. I started with coding agents and asked what would have to be true before their output could be trusted without reading every generated line. The list accumulated: intent that can be checked, bounded authority, durable records of attempts, evidence tied to exact artifacts, independent acceptance, controlled release, runtime observation, and recovery when the checks were insufficient.

Inside the vocabulary of current agent products, that collection looked like a missing layer. Outside it, the collection is a tour through established engineering.

These questions are owned by established disciplines. [Requirements engineering](https://sebokwiki.org/wiki/Requirements_Engineering) defines and manages what a system is meant to do. [Verification](https://sebokwiki.org/wiki/System_Verification) checks an implementation or design against its specified requirements; [validation](https://sebokwiki.org/wiki/System_Validation) checks whether the resulting system satisfies its intended use. [Assurance cases](https://www.sei.cmu.edu/library/assurance-cases-overview/) organize claims, arguments, assumptions, and evidence into a reviewable reason for confidence; practitioners write those arguments in [Goal Structuring Notation](https://scsc.uk/gsn), and the [Structured Assurance Case Metamodel](https://www.omg.org/spec/SACM/2.2/About-SACM) gives the records an interoperable representation.

That is already a synthesis. It is not merely a box of separate techniques waiting for somebody to notice that they belong together. Systems assurance, secure development lifecycles, model-based systems engineering, and continuous assurance exist to connect requirements, designs, evidence, configuration, change, operation, and recovery across a system lifecycle. The [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final) integrates security practices into ordinary development processes. [NIST's cyber-resiliency engineering guidance](https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final) connects architecture, operation, response, recovery, and adaptation. [SEBoK's treatment of model-based systems engineering](https://sebokwiki.org/wiki/Model-Based_Systems_Engineering_%28MBSE%29) describes formalized links between requirements, design, verification, validation, and assurance. The SEI's [Formal Arguments for Large-Scale Assurance](https://www.sei.cmu.edu/annual-reviews/2023-research-review/formal-arguments-for-large-scale-assurance-falsa/) work directly addresses re-assurance of evolving systems, including formal assurance arguments and runtime evidence.

Whether a particular team knows these methods, can afford them, or applies them competently is a different question. Poor adoption does not reopen a settled engineering problem: a team that does not know Python has a training problem, not evidence that software still lacks a way to express programs. These are mature methods with decades of use behind them.

The originating question -- what would have to be true before generated output could be trusted without reading every line -- has an established answer of its own, and it predates coding agents by more than a decade. Safety-critical engineering says: either qualify a development tool to a level commensurate with the errors it can inject, or verify its output. [RTCA DO-330](https://www.rtca.org/products/do-330/) frames this as tool qualification; [ISO 26262-8](https://www.iso.org/standard/68390.html) frames the automotive version as confidence in the use of software tools. Compilers are the canonical case study: trust migrated from re-checking the output to trusting the producer, earned through decades of mass use, with [CompCert](https://compcert.org/) as the formal version of that trust -- a generator verified by proof where qualification was impractical. Note what the ubiquity path required: decades of shared exposure, and a deterministic artifact for that exposure to accumulate against. A language model has neither, and cannot presently be qualified under these regimes -- non-deterministic, unbounded in the errors it can inject, opaque to the analysis qualification requires -- which mechanically selects the other branch: its output must be verified. That is the established assurance stance on coding agents, stated decades before coding agents existed.

The same correction applies to several terms I developed locally.

"Derived status is earned" sits naturally inside assurance-case practice. A status is credible only to the extent that a claim is supported by applicable evidence and a defensible argument. The important questions -- which version the evidence concerns, how it was produced, what assumptions it depends on, and what changed since -- are not peculiar to agents.

"The application is the assurance kernel" contains a useful instinct and an inaccurate boundary. The useful instinct is that generated operation must not be allowed to invent authority, canonical state, or its own acceptance criteria. The established concept is the [reference monitor](https://csrc.nist.gov/glossary/term/reference_monitor): a mediator of access to protected resources that is non-bypassable, tamper-resistant, and small enough to verify. A [security kernel](https://csrc.nist.gov/glossary/term/security_kernel) is the mechanism that implements it. The design goal is not naming which component is the kernel; it is making the mediating part small enough to trust regardless of who wrote the code around it. Calling the whole application the kernel makes the trusted part larger rather than smaller. The note should be read as a search for that boundary, not as a new definition of a kernel.

"The work between the ticket and the agent" overlaps requirements traceability, workflow provenance, separation of duties, assurance evidence, and software-supply-chain attestations. [in-toto](https://in-toto.io/docs/getting-started/) records authorized steps, functionaries, materials, products, and signed execution metadata. [SLSA provenance](https://slsa.dev/spec/v1.2/) binds software artifacts to the process and inputs that produced them. A tracker-independent attempt record may still be useful in my own tooling, but usefulness is not evidence of an unclaimed conceptual layer.

AI changes the implementation actor and the economics of generation. It can increase throughput, vary its reasoning between attempts, and produce convincing output without possessing authority over the result. Those characteristics make machine-readable intent, constrained permissions, independent verification, provenance, and automated acceptance more valuable. They do not require software assurance to be reinvented. [Microsoft Research's Trusted AI-assisted Programming](https://www.microsoft.com/en-us/research/project/trusted-ai-assisted-programming/) applies programming-language and verification techniques directly to AI-assisted development. The research agenda described as [programming with trust](https://arxiv.org/abs/2502.13767) explicitly combines coding agents with testing, analysis, and verification tools. The [AI for the SDLC guidance](https://code.mil/AI4SDLC/) treats AI as an actor to govern inside an existing lifecycle rather than a replacement for the lifecycle.

There is a second question underneath all of this, and it is genuinely open. The primitives are settled; how to compose them into an AI-integrated development process is not. Which steps stay human-directed, where review is mandatory rather than wasteful, how to calibrate oversight to risk so the throughput gain is not eaten by verification -- no authoritative source answers this yet. That same DoD AI for the SDLC is the most credible non-vendor process guidance in existence, and as of writing its governance play is still listed as upcoming and its calibrated-trust and human-oversight material still a `[Read more -> TBD]` placeholder. The [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) and [ISO/IEC 42001](https://www.iso.org/standard/81230.html) tell an organization to have calibrated oversight without saying what it is. The empirical base contradicts itself, partly because the tools change faster than studies replicate.

"No authoritative source" should not be read as "nobody is working on it," and I owe the difference some names. Four streams are working this in public: Thoughtworks' [Exploring Gen AI](https://martinfowler.com/articles/exploring-gen-ai.html) series, which is practitioner reports on exactly this composition -- [where humans intervene in agent loops](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html), [how internal quality holds up when an agent writes the code](https://martinfowler.com/articles/exploring-gen-ai/ccmenu-quality.html); [DORA's annual measurement](https://dora.dev/research/2025/dora-report/) of AI-integrated delivery, whose headline result is process-level rather than tool-level, that AI amplifies existing organizational strengths and dysfunctions alike; [the AI4SDLC repository](https://github.com/Code-dot-mil/AI4SDLC), where the plays that are still `TBD` on the site get drafted; and the trusted-AI-software-engineering research agenda on the verification side. That is one essay series, one survey program, one half-written playbook, and one research agenda. It is a watch list, not a literature. The accurate statement is that the primitives have a study path and the composition has a watch list.

The field also acquired a name for this in the meantime. [Harness engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering-memo.html) -- the work of building the constraints, context, and checks an agent operates inside -- was written up as a first-thoughts memo in February 2026, and its sibling term is [context engineering](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html). Adopting that vocabulary costs me nothing and buys a word other people already recognize. Its recency is also the fairest thing I can say about my original framing: the layer was not unclaimed, but it was unnamed until a few months ago, which is why it felt like one from inside.

This still does not rescue the missing-layer framing; it is the opposite kind of thing. An unclaimed conceptual layer and a recognized open problem are opposites, and this problem is recognized and crowded -- the SEI, defence working groups, large engineering organizations, and the human-factors literature on calibrated trust are all working it in the open. Process-integration questions also tend not to resolve into a single answer. Which SDLC methodology is correct converged instead on contingency frameworks and empirical patterns, because the answer depends on risk, domain, team, and tool generation. The AI version should be expected to converge the same way, which means its settled form is assembled from exactly the kind of artifact I can produce: a specific composition of established methods, in a specific context, reported with its costs and failures.

What remains personal is narrower, and now has a clearer target. I can run lightweight experiments with these ideas in a homelab and in small software projects, and report what the composition actually costs to operate. Those are data points in the open problem, not a theory of it -- records of local application, not claims of original primitives, a missing discipline, or a newly discovered synthesis.

That reframes the disclaimer I would otherwise have written. "I do not know anyone who has solved this, but here is a homelab" is self-deprecation aimed at the wrong target, because it measures a small system against a settled reference that does not exist. The honest version: here are the four streams where this is being worked out in public, and here is mine -- same genre, smaller system, full repositories. When the reference material for a question is currently being assembled out of exactly such reports, a small one is not a consolation entry. It is what the entries look like.

That changes the next step. It is not to name assurance-managed AI development as an empty category and then build toward it. It is to learn the fields that already own the questions, revise the notes where their boundaries are wrong, and test which established methods are proportionate to the systems I actually operate.

Finding that most of the map already exists is not a disappointing result. It is cheaper than surveying the continent again, and it shows exactly which edge is still blank.
