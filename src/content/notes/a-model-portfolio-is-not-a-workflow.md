---
title: A model portfolio is not a workflow
seoTitle: How I use premium, cheap, decision and local models together
role: synthesis
status: exploration
lifecycle: current
area: agent architecture
published: 2026-10-25
lastRevised: 2026-10-25
projects:
  - vuoro
relates:
  - utilization-is-a-signal-not-a-limit
  - the-router-was-larger-than-the-model
  - intelligence-has-a-lifecycle
  - the-workshop-is-learning-my-accent
  - the-audit-trail-can-suggest-the-next-action
draft: false
tags:
  - agents
  - model-selection
  - local-inference
  - creative-tooling
  - evaluation
summary: >-
  I already have capable premium models and a cheap coding worker. The next
  improvement is to give small, generative and premium models different jobs
  across evidence, creativity, simulation and personal continuity, then judge
  the complete result rather than the supplier list.
explorePrompt: >-
  Read this as a dated operating snapshot and a proposed expansion of model
  roles, not a recommendation to buy the named subscriptions. The existing
  setup combines premium ChatGPT and Claude sessions, low-cost OpenCode coding,
  occasional typed decisions and local inference. The proposed change is to
  allocate capabilities by cognitive work: rules establish facts and apply
  effects; small decision models classify supplied states and legal options;
  cheap generative sessions produce candidate interpretations, creative
  variants and short narratives; premium models settle difficult ambiguity.
  The harness chooses execution providers while the work and evidence owners
  retain their authority. Apply this model to your current stack and find one
  workload beyond coding where inexpensive repeated decisions could help.
  Evaluate it against deterministic processing and direct premium inference.
  Include cache, retry, operator effort, quality failures, and outcome
  acceptance; do not optimize token price alone. Identify what must persist
  when a model, provider or persona changes, and what remains an experiment.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - composing premium subscriptions with cheap APIs and local inference
    - extending agentic workflows beyond coding into narration, assets and games
  establishes:
    - a dated model portfolio and proposed separation of cognitive job types
    - candidate experiments that preserve owner authority and recorded outcomes
  doesNotEstablish:
    - measured superiority or value for GLM, Qwen, Gemini or decision models
    - a running personal operator or an automatic cross-provider model router
  supplementWith:
    - current provider capabilities, cost records and matched workload evaluations
---

On 25 October 2026 my agent setup already has rather more models than
problems that clearly need another model.

For difficult work I use ChatGPT with GPT-6.1 Sol and GPT-6 Luna, and Claude
with Opus 5.5 and Sonnet 5.5. OpenCode supplies cheaper coding execution,
currently often through DeepSeek V4.1 Flash. Jev has been an occasional
experiment with typed, fixed-choice decisions. I also use local inference
when it fits, mostly on an RTX 3090. The costs are a mixture of subscriptions
and metered APIs; the current provider lineup is a snapshot, not an
architectural contract.

It is tempting to compare GLM, Qwen, Gemini, Cloudflare's models and another
gateway, then call the winner the default. I do want to trial those models.
But I have already watched a text-only Jev routing comparison fail to separate
three approaches reliably. More suppliers are useful only if there is a
specific, measured job for them.

## Four different kinds of work

| Job | Likely mechanism | What it should not do |
| --- | --- | --- |
| Establish a fact | Code, tests, source receipts | Ask a model to certify itself |
| Choose among valid options | Rules or a small decision model | Invent new grants or work criteria |
| Produce many candidates | Cheap generative model | Publish its first draft as truth |
| Resolve difficult ambiguity | Sol, Opus or another strong model | Redo every cheap mechanical step |

This is a division of labour, not a permanent model ranking. A capable
generative model may be better than a tiny classifier on an underspecified
question. A deterministic query may beat both when the answer is already
stored. The full cost is elapsed time, tokens, cache behavior, failed
attempts, reconstruction work, and the next correction I have to make.

[Utilization is a signal, not a limit](
/notes/utilization-is-a-signal-not-a-limit/) already covers the distinction
between a work requirement and today's provider availability. That rule
still applies. Native harnesses choose where and how to run; Vuoro records
work identity, evidence and outcomes rather than becoming a compulsory
model-routing service.

## The candidates I actually need to test

My first cheap-coding comparison is DeepSeek against GLM Flash and Qwen Flash
on the same isolated issues, with the same tests and a record of accepted
changes. Gemini belongs in a smaller trial for long-context or multimodal
cases, not in an automatic new subscription.

For typed decisions, Jev is a baseline. Cloudflare Clef, OpenAI Decisions
and locally hosted d1-3B are challengers. A GTX 1060 may be enough to host
the smaller model as a resident, text-only service; memory fit is not yet a
latency result, and the older card needs its own measured build and p95.
The RTX 3090 remains more useful for heavy inference and image work than
as a permanently occupied classifier.

Clairic and similar typed extractors pose another question: can a source
document or operational event produce a reusable, evidence-linked
observation cheaply enough to avoid several later readings? That is
separate from choosing an action and separate from the old Outctl
compression experiment.

## Give the cheap workers different worlds

**Writing and ideation.** Several cheap sessions can propose distinct
angles, mechanisms or counterarguments. A strong editorial pass selects
what survives. The metric is useful diversity and fewer repair turns, not
the number of drafts generated.

**Images and other assets.** A cheap language model can turn an art brief
into constrained variants; the image generator does the rendering; cheap
vision checks identify missing requested elements. Coherent style, rights
and final selection still need stronger judgment. Reproducible asset
manifests matter more than generating twenty attractive orphan files.

**Games and multiplayer.** A small decision model can choose a faction's
intention from the actions the simulator currently permits. A cheap
narrator can explain the consequences. A stronger model gets occasional
strategic turns, such as revising a faction's doctrine after years of
betrayals. The simulation remains the source of resources, movement,
damage and commitments. The earlier [game-AI experiment](
/notes/intelligence-has-a-lifecycle/) asks when a recurring choice should
graduate from an LLM into learned policy or ordinary code.

**Analytics.** In-process inference could classify an event or prioritize
an investigation over a small fixed option set. Out-of-process jobs can
extract, compare and cluster many events before an expensive model
explains what changed. My periodic agent-systems research is a sensible
candidate: use cheaper processing to assemble the evidence, spend premium
reasoning on implications and contradictions.

## An operator with a voice, but no special authority

I also want a longer-running personal dispatch and narrative agent: a
recognizable voice that remembers prior judgments, knows which projects
are progressing, and can explain a week's work without reading the entire
session history again.

I would not run one expensive model continuously or make its conversation
the memory store. A stable persona and an event-linked record can persist
while the narrating model changes. Cheap models can decide which events
are worth surfacing and write ordinary updates. A premium model can
periodically review goals, contradictions and strategy.

The narrative must be a reading of evidence, not evidence about itself.
"The build completed" should mean a source-owned completion record exists,
not that a personable agent sounded pleased with the build. The proposed
[audit-side reconciliation](
/notes/the-audit-trail-can-suggest-the-next-action/) provides a more useful
input than raw transcripts for that purpose.

## The next comparison

I would run one matched coding-worker comparison, one frozen set of bounded
decision questions, and one non-coding pilot using repeated observations.
For the personal operator, the first deliverable would be a read-only
weekly narrative over known work events, checked against those events
for invented completions and missing important changes.

Only after those results would I buy another standing subscription, run
a dedicated local GPU all day, or give a model-backed component permission
to initiate follow-up actions. There is enough intelligence available.
The unfinished work is making its contribution observable.
