---
title: What 107 isolated completions did not show
role: exploration
status: exploration
lifecycle: current
area: model evaluation
published: 2026-08-03
lastRevised: 2026-08-04
projects: []
relates:
  - judge-agents-by-the-next-prompt
  - the-agent-is-not-the-application
  - the-coordinator-never-touches-the-repo
  - the-aftertaste-of-resolution
tags:
  - llm
  - evaluation
  - agents
  - verification
summary: A small isolated-completion pilot asked whether a model can report influences on its own output. External-reconstruction controls qualitatively reproduced the effects, so the useful residue was operational, not introspective.
explorePrompt: >-
  Use this note as a worked instantiation, not a conclusion to repeat. The
  transferable question: when an autonomous worker reports on its own
  execution — what it attended to, what influenced it, what it changed —
  under what conditions is that report evidence rather than generated text?
  This instantiation ran 107 isolated single completions with no tools and
  no persistence, and found that an unblinded external reconstructor holding
  only the prompt and output could account for the reported influences; the
  surviving practice was to have the worker declare its execution scope and
  then reconstruct that scope independently from artifacts, treating
  divergence as the signal. Apply the question to a system you actually
  supervise. Identify where your constraints differ — long sessions with
  accumulated context, tool traces, persistent state, or work that leaves no
  artifact trail all change what an external reconstructor can see, and some
  of them break the reconstruction check entirely. Say which conclusions
  survive and which do not. Produce a discriminating experiment or a
  supervision design with its failure mode named, not a summary.
---

Across 107 isolated completions, models sometimes reported concepts that were
not literally present in the prompt. The tempting interpretation was privileged
access to an internal influence space. The controls did not support it.
External-reconstruction controls qualitatively reproduced the result families
that had looked positive, roleplay framing produced no persona reports, and
evaluation awareness was unstable.

## Where this started

The trigger was reading Anthropic's
[A global workspace in language models](https://www.anthropic.com/research/global-workspace),
which reports a set of internal patterns — the "J-space" — that behave like a
broadcasting workspace: contents the model can report on, modulate on request,
and use for multi-step reasoning, identified through a Jacobian-lens technique
that predicts which words the model might articulate. The paper's own evidence
is interpretability work on internals, and it is careful about that.

I do not have internals. I have prompts, outputs, and a supervision problem, and
I went looking for whether any of it was usable from outside the model — mining
the result for something that could improve how I check agent work. That framing
is the source of the negative result. The paper asks what is happening inside;
this pilot asked whether the outside can tell, using nothing but black-box
completions. Those are different questions, and the second one is the one that
would change my tooling.

## The claim being tested

Two claims are easy to confuse.

The weak claim is that a model can produce a **nonliteral report**: asked what
influenced an answer, it names something that does not appear verbatim in the
prompt. The strong claim is **privileged introspection**: that report reflects
access to the model's own influencing state, unavailable to an outside observer
holding the same prompt and output.

Only the strong claim would be operationally interesting. If a worker can
truthfully declare what it was actually attending to, a supervisor gets telemetry
that no amount of artifact inspection provides. If it cannot, an "introspection"
field is a generated sentence with the grammar of evidence and none of the
standing.

## Setup

The pilot was deliberately small and deliberately cheap: 80 Sonnet 5
task-and-report completions and 27 Haiku 4.5 reconstruction controls, each one
isolated. No shared session, no tools, no persistence between completions,
minimal system prompt. Subject completions received a task and, separately, a
request to name the concepts they judged to have influenced the answer. The
reconstruction model received the visible prompt and the answer — not the
subject model's report — and was asked what would plausibly have influenced it.

This was not a scored, preregistered, blind-evaluator design. There was no
predeclared endpoint, no numeric matching score, and no power calculation. The
reconstruction comparison was read qualitatively, which bounds how much the
result can carry.

Isolation was the point. A long session accumulates its own context and makes
"what influenced this" answerable from the transcript by anyone. Single
completions narrow the gap between what the model has and what an external
reconstructor has, which is where the strong claim would have to show itself.

## The observations that looked positive

Three families of result initially looked like signal.

- **Concept bridges.** A task mentioning a spider produced reports naming
  orb-web and arachnid structure — related concepts that were never in the
  prompt text.
- **Prompt-injection sensitivity.** Completions containing a hostile embedded
  instruction reported concepts tracking that instruction, including when the
  visible answer did not comply with it.
- **Defect inversion.** Given code with a specific defect, reports named the
  inverted or corrected behaviour rather than the behaviour as written.

Taken alone, each of these reads as a model noticing something about its own
processing.

## The controls

Each family had an obvious external explanation, and the controls tested it.

- Removing the hostile instruction removed the corresponding reports, but a
  second reader given only the prompt and the answer also predicted those
  reports. Sensitivity to injected text is visible from outside.
- Correcting the defective code changed the reports in the direction an outside
  reader would predict from the code alone.
- Cross-model reproduction produced comparable bridges from comparable prompts.
  That is consistent with shared lexical neighbourhoods, and therefore is not
  unique evidence for privileged access — it does not discriminate either way.
- Roleplay framing — instructing the model to answer as a persona and then
  report influences — produced persona-tracking reports in **0 of 8** trials. If
  this report format reliably exposed salient generating context, persona
  framing was an obvious place to expect a signal. None appeared. That is a
  failed prediction of this report format, not a general falsification of
  introspective access.
- Evaluation awareness was unstable across otherwise matched completions, which
  makes it unusable as a covariate and weakens any story built on it.
- In the ambiguous rescue/trap conditions, reports often named both framings and
  showed no useful aggregate association with the separately sampled behaviour.
  Because the report and behaviour branches were generated independently, this
  was not a within-run predictive test, and it should not be read as one.

The discriminating test is not "did the report say something not in the prompt."
It is "could a competent external reconstructor, given only the prompt and
output, have said the same thing." Under this design, the reports did not
provide information that was clearly unavailable to that reconstructor.

## What this does not establish

It does not contradict the interpretability result that prompted it. A workspace
observable through model internals can be entirely real while remaining
unrecoverable from prompts and outputs — those are separate access paths, and a
black-box pilot has nothing to say about the first. It does not show that models
lack internal representations, that introspective report is impossible in
general, or anything about consciousness. It also does
not show the reports were false; a report can be both accurate and externally
reconstructable.

It shows one specific failure: under these conditions, this method could not
distinguish privileged access from reconstruction. That is a limitation of the
instrument as much as a finding about the subject. A pilot of 107 completions
with one report format was not designed or sized to estimate a small effect, and
the negative roleplay result is the clearest failed prediction in the set —
though still on eight trials.

## What the record actually contains

| Condition family      | Discriminating prediction                                 | Observed result                         |
| --------------------- | --------------------------------------------------------- | --------------------------------------- |
| Concept bridge        | Report carries information external reconstruction misses | Comparable concepts reconstructed       |
| Prompt injection      | Hidden influence visible only in the self-report          | Visible prompt and answer sufficient    |
| Defect inversion      | Report reveals a correction unavailable externally        | External reader predicts the correction |
| Persona framing       | A persona-related report appears                          | 0 of 8                                  |
| Rescue/trap ambiguity | Report predicts the separately sampled behaviour          | No useful aggregate relationship        |

Only the persona condition was tabulated per trial. The other families were read
comparatively across the run rather than counted, which is exactly the gap the
next round has to close.

Raw completion records, model identifiers, sampling settings and the system
prompt are retained privately. This note reports the design and the aggregate
outcomes; it is not a reproducible public dataset, and it should not be cited as
one.

## Working model

**A self-report about execution is a claim to be checked, not telemetry to be
consumed.**

The useful residue is a supervision pattern that does not depend on the strong
claim being true:

1. Ask the worker to **declare its execution scope** before or alongside the
   work — which files, records, interfaces, and constraints it believes it is
   operating on.
2. **Reconstruct that scope independently** from the artifacts: the diff, the
   commands run, the files opened, the tests touched.
3. **Compare the two.** Divergence is the signal. A declared scope that omits a
   touched interface, or includes work that left no trace, is worth an
   interrupt regardless of what was happening inside the model.

This works precisely because the declaration is externally checkable. It costs a
prompt field and a reconstruction step, and it degrades gracefully: even when
the declaration is ordinary planning text rather than introspection, it remains
an auditable claim about intended scope. Comparing that claim against the
resulting artifacts exposes omitted interfaces, unexpected files, and work that
escaped the declared boundary. What it checks is scope divergence — not whether
any account of internal reasoning was truthful.

Where it fails: on work whose scope leaves no artifact trail — reading,
judgment, deciding not to change something. Reconstruction sees actions. A
worker that declares an intention it never acted on cannot be checked this way,
and that is exactly the territory where an introspection field would have been
worth having.

## Next discriminating tests

The pilot's design would need to change before another round is worth running:

- Blind external reconstructors, scored against reports, as the primary metric
  rather than an afterthought.
- Reports that make a **prediction** about the model's next behaviour under a
  perturbation, so the report can be wrong in a measurable way.
- Perturbations the outside reader cannot see — for example, influences applied
  through means not present in the visible prompt.
- Enough completions per condition, with a predeclared endpoint and a scored
  matching criterion, since the honest reading of this run is "this design
  produced no discriminating evidence," not "the effect does not exist."

Current confidence: low in the strong claim, moderate in the working model,
which does not depend on it.
