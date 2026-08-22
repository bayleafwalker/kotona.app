---
title: A platform capability does not exist all at once
seoTitle:
  Outctl, programmatic tool calling, and moving agent-platform boundaries
socialTitle: I built the missing layer while the platform was still shipping it
role: synthesis
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-08-16
lastRevised: 2026-08-16
projects:
  - vuoro
relates:
  - measure-the-diagnosis-not-only-the-transcript
  - why-production-access-changes-the-shape-of-agent-tooling
  - the-agent-is-not-the-application
  - the-missing-layer-is-binding-not-intelligence
draft: false
tags:
  - agents
  - harness-engineering
  - tool-use
  - context-management
  - project-history
summary: >-
  Outctl began as an answer to tool results flooding model context. Programmatic
  tool calling now moves that work into the harness, invalidating the original
  product boundary while leaving a narrower durable-evidence question open.
explorePrompt: >-
  Use this note as one worked case of an infrastructure project meeting a
  platform capability that arrived while the project was being built. The
  transferable question is not merely whether a feature exists, but at which
  layer it exists: public architecture, vendor API, active model, current
  harness, enabled tool set, or observable execution trace. Identify one
  limitation around which you are building a wrapper, gateway, context layer,
  scheduler, or policy surface. Construct an availability ladder for the native
  capability that could replace it. Separate the problem that remains real from
  the implementation boundary that may have moved. State which project claims
  are disproven, which are merely superseded, which evidence remains useful, and
  the smallest residual test the project must pass to avoid archival. Do not
  assume that a model can reliably report the capabilities or topology of its
  own harness; require an external trace, API contract, or controlled execution
  result.
---

I spent a mildly unreasonable amount of time trying to answer a question that
now has a vendor term.

Can an agent write a bounded program that calls several tools, processes their
intermediate results outside its ordinary model context, runs independent calls
in parallel, and returns only the evidence it actually needs?

Not ordinary tool calling. The important part was that the intermediate results
would not have to travel through the model after every operation.

Outctl started because the sessions I was running behaved as if the primitive
was always this:

```text
model
  -> one tool call
  -> complete result enters model context
  -> another model inference
  -> next tool call
```

Large command results therefore produced three obvious responses: truncate them,
summarize them, or capture them through an external wrapper and expose bounded
slices later. Outctl implemented the third one.

The missing answer was **programmatic tool calling**. The model writes code in a
bounded runtime, invokes eligible tools from that program, loops, filters,
joins, handles errors and parallelizes work there, then returns selected output
to the model:

```text
model
  -> bounded program
       -> tool
       -> tool
       -> filter, compare, aggregate
       -> perhaps more tools
  -> selected result enters model context
```

That is almost exactly the execution topology I was trying to discover.

**Working model.** A platform capability is not practically present when someone
has published the architecture. It becomes present for a project when the active
model, API, harness, tool permissions and trace surface line up well enough that
the capability can actually be selected and verified. Between roadmap and
dependable substrate there is a grey strip where building an approximation can
be rational and still become obsolete very quickly.

## The question I was actually asking

The output problem was real. Operational commands can produce hundreds of
kilobytes or several megabytes while the useful result may be five lines. A
coding agent that drags the whole result through every later inference pays for
it repeatedly and lets one noisy observation compete with the rest of the
session.

Rerunning the command later is not equivalent. Live system state may have
changed. Immediate summarization is also not neutral: it turns an observation
into an interpretation before the later investigation knows which details
matter.

Outctl's proposed answer was:

```text
execute once
-> retain the complete observation
-> expose a bounded deterministic projection
-> retrieve exact slices later
-> preserve provenance
```

This was not a strange architecture. It independently converged on part of the
same topology vendors were building: intermediate data should be processed
somewhere other than the model's ordinary conversation context.

The important difference is where that processing belongs.

Outctl placed it in an external command-evidence wrapper. PTC places ephemeral
orchestration and filtering inside the model harness itself. Once that native
boundary exists, the external wrapper has to justify itself through something
other than "large intermediate results should not enter context."

## Existence had several dates

The capability did not arrive in one event.

| Date                 | What became visible                                                                                                                                                                                                                                                                               | What still did not follow                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4 November 2025**  | Anthropic published [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), explicitly arguing that agents should write code to call tools rather than pass every definition and intermediate result through context.                                           | This was an architecture article, not proof that the Claude or coding session in front of me had the capability enabled.                                                            |
| **24 November 2025** | Anthropic introduced [advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use), including a beta feature named **Programmatic Tool Calling**.                                                                                                                                  | Beta API availability did not make it a universal Claude Code or claude.ai execution primitive. Tools still had to be eligible and the hosting application had to support the flow. |
| **11 March 2026**    | Codex 0.114.0 included an experimental `code_mode` feature and exported tools into its code-mode runner.                                                                                                                                                                                          | It was experimental, poorly surfaced and not an obvious capability a normal session could inventory for me.                                                                         |
| **9 July 2026**      | OpenAI documented [Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) with the [GPT-5.6 launch](https://openai.com/index/gpt-5-6/). The Responses API could run in-memory programs that coordinate tools and process intermediate results. | API and model support did not establish which ChatGPT or Codex product paths used it, whether my tools were callable from it, or whether a particular session actually selected it. |
| **August 2026**      | An app-server trace from my own setup finally showed the topology directly: two code programs, three underlying command invocations and one parallel call group.                                                                                                                                  | The ordinary CLI JSONL still carried no structural marker that made the PTC execution obvious from the session transcript alone.                                                    |

From experimental Codex Code Mode to a native capability I could observe in the
frontier setup was about five months. From OpenAI's named GPT-5.6 release to the
test was a little over five weeks.

That is not a long product lifecycle. In practical project time, roughly a year
ago this was architecture direction, half a year ago it was experimental
implementation, and now it is a first-class primitive in the models and
harnesses I am using.

The boundary moved while I was measuring it.

## Why the sessions did not tell me

I asked variants of the right question several times:

- Why should every tool result enter model context?
- Could a bounded program call tools and process the results first?
- Does the harness already have a better implementation of this?
- Am I building a worse version of something OpenAI or Anthropic already owns?

The sessions still tended to reason from the visible interface: direct tool
calls, shell commands, hooks, wrappers and transcript output. They helped design
and evaluate Outctl. They did not reliably route the problem to PTC.

There are several reasons, and none requires a particularly exotic failure.

First, the terminology was fragmented. The same general direction appeared as
"code execution with MCP," "advanced tool use," "Programmatic Tool Calling,"
"Code Mode" and tool calls from a hosted JavaScript or Python runtime. Searching
for "stop kubectl output entering the model context" does not necessarily
produce the right vendor term unless someone already knows the term.

Second, a model is not a dependable inventory of its own harness. It may know
that PTC exists as an API feature while not knowing whether the current product
enabled it, whether the current model supports it, which tools opted in, or
whether the current request was routed through it.

A model can explain PTC accurately and still have no reliable answer to whether
the session containing that explanation is using PTC.

Third, the visible evidence was incomplete. The normal CLI event stream did not
show a structural Code Mode marker. The positive proof came from a separate
app-server trace. From inside the conversation, the mechanism was effectively
hidden behind the same interface it was meant to improve.

Fourth, "exists" was being treated as a binary question when the real question
had at least six layers:

```text
architectural idea
-> public vendor implementation
-> supported model/API
-> integrated product harness
-> enabled tools and account
-> mechanism observed in this run
```

An answer at one layer does not settle the next one.

This changes how I should ask the question in future. "Does this exist?" is too
weak. The useful request is:

> Identify the native capability, its release and product surfaces, whether it
> is enabled in this environment, and the receipt that would prove it was used.

Without the last part, a capability can be generally available and still be
operationally imaginary.

## Outctl was not a category error

The discovery does not make the earlier work nonsensical.

Outctl reduced model-visible Kubernetes command output by about 84% in the clean
direct-call comparisons. A later long-horizon pair reduced it by about 95%. It
retained complete raw observations, provided deterministic retrieval, and forced
the experiments to distinguish mechanism, diagnostic quality, economics and
execution authority.

Those results remain true about the implementation and the tested topology.

The work also exposed several things that a clean architectural sketch would not
have:

- a bounded result without useful omission cues makes retrieval guessy;
- a shared top-level diagnosis is not proof that both arms found the same
  failures;
- shell-level command matching is not an execution-identity receipt;
- stable byte reduction does not imply stable token, cost or duration savings;
- a result can be complete as an experimental record while still failing to
  support the intended product claim.

The earlier note,
[Measure the diagnosis, not only the transcript](/notes/measure-the-diagnosis-not-only-the-transcript/),
remains a useful evaluation record for exactly that reason. The mechanism result
survived more scrutiny than the product conclusion.

Outctl also arrived at the right architectural instinct: do not make the model
read every intermediate byte merely because a tool produced it.

What it did not establish was exclusive product value. It proved the problem and
one workable mechanism. It did not prove that the mechanism belonged in a new
external product once the harness could perform the same hot-path work natively.

## The premise that failed

Two claims had been travelling together.

The first survives:

> Large intermediate tool results should not automatically enter the model's
> ordinary context.

The second does not survive in its universal form:

> An external capture and projection wrapper is structurally required to keep
> those results out of context.

PTC disproves the second claim for harnesses where it is available and enabled.
Loops, conditional execution, parallel fan-out, filtering, aggregation and
selection can happen inside the native tool runtime without another model
inference between each operation.

That is not merely a vendor naming collision. It removes the central necessity
claim behind Outctl as a general context-reduction layer.

A live trace finally made the point concrete. The runtime executed two
`custom_tool_call(exec)` programs, made three underlying command invocations and
used one `Promise.all`. That is the architecture I had been trying to build
around from the outside.

Continuing to compete at that center would mean maintaining a command wrapper,
capture format, projection language, integration path and evaluation burden to
approximate a primitive already being implemented inside the frontier harness.

A small external project is unlikely to win that race through superior
JavaScript bureaucracy.

## What did not move into PTC

PTC solves an execution-topology problem. It does not automatically own every
evidence or governance problem around the execution.

The documented native contract is good at transient work:

| Native PTC should own                           | A separate substrate may still have to earn         |
| ----------------------------------------------- | --------------------------------------------------- |
| loops, branching and parallel calls             | durable addressed observations                      |
| filtering and aggregation before model context  | exact retrieval after the request or session ends   |
| passing results between tools                   | cross-session and cross-harness evidence references |
| avoiding one model round-trip per call          | policy-bound retention and sanitization             |
| keeping irrelevant intermediates out of context | independently inspectable execution provenance      |
| adapting a bounded workflow during one request  | recovery after compaction, `/clear` or handoff      |

A PTC program may process ten megabytes and return one kilobyte. That is the
desired context behaviour. It does not follow that the ten megabytes remain
available under a stable capture ID when a later session needs to inspect line
8,412 without rerunning the command.

The same applies to authority. PTC can choose and compose eligible tools, but
the runner or application still has to own credentials, target scope,
permissions, approvals and execution receipts. Moving the loop into code does
not turn the model into the authorization layer.

[The agent is not the application](/notes/the-agent-is-not-the-application/)
therefore survives intact. So does the main argument in
[Why production access changes the shape of agent tooling](/notes/why-production-access-changes-the-shape-of-agent-tooling/):
production work needs domain context, scoped authority, evidence and completion
rules around the model. PTC changes one interface inside that envelope.

The narrower open question is whether durable command evidence deserves its own
tool, or whether it should be a small capability of the runner, tracing system
or existing work-state layer.

Outctl does not get to assume the answer merely because it already contains
code.

## The project decision

Outctl should not continue as a general context-reduction wrapper or as a
mandatory gateway in front of ordinary command execution.

The original rollout thesis is superseded:

```text
old:
model -> outctl wrapper -> command -> bounded projection

current:
model -> native PTC / Code Mode -> eligible tools
                                 -> selected result

optional edge:
runner or PTC-invoked tool -> durable evidence capture
                           -> addressed later retrieval
```

Three decisions follow.

**Stop building the vendor-owned center.** Do not expand custom orchestration,
parallel execution, generic filtering or default harness routing merely to
recreate native PTC. Compression is a presentation policy, not the product.

**Preserve the evidence and reusable edges.** The capture manifests,
deterministic slices, sanitization policies, authority findings, conformance
cases and A/B harnesses remain useful records. They should not be deleted merely
because the product interpretation changed.

**Require the residual scope to prove itself.** Outctl only earns continued
implementation if it demonstrates something native PTC does not already own. The
strongest candidate is a long-horizon evidence test:

1. a native PTC program invokes several operational tools;
2. complete observations receive stable external references;
3. only bounded results enter the model context;
4. the conversation is compacted or cleared;
5. a later session resumes from work state plus those references;
6. it retrieves exact omitted evidence without rerunning the live operation;
7. the execution identity, policy and provenance remain inspectable.

If that can be implemented more simply as a runner capture adapter, tracing
extension or ordinary artifact store, Outctl should not survive as a separate
product.

A project does not earn a life extension for correctly predicting its
replacement.

For now the honest status is **maintenance and architectural pivot**, not active
rollout and not yet full archival. No more central integration work should
proceed until the residual edge wins a concrete comparison.

## Keep the notes that became wrong

The older notes should not be silently deleted or rewritten until they appear
clairvoyant.

The direct-call measurements happened. The retrieval problems happened. The
authority defect in the first harness happened. The conclusion that the
mechanism deserved further study was reasonable under the execution topology
that was visible at the time.

What changed was the product boundary.

That is what the lifecycle metadata is for:

- **Disproven** when the underlying claim failed against evidence.
- **Superseded** when the claim was reasonable in its original conditions but a
  newer capability or conclusion now owns the current guidance.
- **Current with narrower scope** when the main claim survives but one
  implementation assumption has moved.
- **Archived** when the record remains useful but no successor needs to carry
  its claim.

[Measure the diagnosis, not only the transcript](/notes/measure-the-diagnosis-not-only-the-transcript/)
has been marked disproven: its mechanism and evaluation findings stand, but its
product recommendation -- that Outctl continue as the context-management layer
-- did not survive the evidence.

[Why production access changes the shape of agent tooling](/notes/why-production-access-changes-the-shape-of-agent-tooling/)
should remain current after revision. Its real subject is the binding between a
general harness and a consequential environment. PTC makes that harness
stronger. It does not remove the binding.

The Outctl repository should state the pivot at the top rather than requiring a
visitor to reconstruct it from experiment reports. Historical design and rollout
documents should remain available with dated status notices. Current project
pages should describe the narrowed direction and stop presenting an external
context wrapper as missing infrastructure.

The wrong notes are part of the evidence for the new one. Removing them would
turn a useful correction into ordinary website gardening.

## The more durable lesson

The mildly embarrassing telling is that I built a tool because I did not know
the feature already had a name.

The more useful telling is that the feature did not exist for me in one clean
moment.

The architecture was public. Then a beta existed. Then experimental harness code
existed. Then the model/API capability was documented. Then the capability
appeared in the frontier setup. Finally a separate trace proved that the run had
actually used the topology.

Five months between experimental harness support and practical discovery is not
long. Neither is five weeks between a named OpenAI release and a project
decision. The fact that a vendor had already started shipping the answer does
not make the exploration irrational. It makes the decommissioning decision
time-sensitive.

The rule I would carry forward is:

> Before building infrastructure around a model limitation, establish whether
> the limitation belongs to the model, the API, the current harness, its
> configuration, its tool eligibility, or only its visible trace.

Then repeat the check while building. Frontier-agent infrastructure has a
shorter architectural half-life than most of the systems around it.

Outctl did not lose because the problem was imaginary. It lost the center
because the platform implemented the right architecture.

Current confidence: high that native PTC invalidates Outctl's original hot-path
necessity, moderate that durable addressed evidence remains a separate problem,
and low that Outctl rather than a smaller runner capability should own that
problem.

The next test is no longer another output-reduction pair. It is whether a
cleared or compacted session can resume from explicit work state and externally
addressed evidence produced through the native PTC path. If the answer is yes
without Outctl's heavier architecture, more of Outctl should die.

That would be a successful result.

## Sources and further study

- [Anthropic: Code execution with MCP — building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Anthropic: Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use)
- [OpenAI Codex 0.114.0 release](https://github.com/openai/codex/releases/tag/rust-v0.114.0)
- [OpenAI: GPT-5.6](https://openai.com/index/gpt-5-6/)
- [OpenAI API: Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
