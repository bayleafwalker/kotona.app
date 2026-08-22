---
title: Measure the diagnosis, not only the transcript
seoTitle: Evaluating bounded-output tooling for coding agents
socialTitle: What an 84% output reduction did not prove
role: project-history
status: archival
lifecycle: disproven
lifecycleChanged: 2026-08-16
lifecycleReason: >-
  The note's headline claim -- that Outctl had earned continuation as a general
  context-management layer -- failed against evidence. Native programmatic tool
  calling now owns the ephemeral orchestration and context-filtering boundary
  that this note treated as an external-tool product opportunity, so the
  recommendation is not merely out of date; the case for it did not hold. The
  direct-call measurements and the four-part evaluation model -- mechanism,
  quality, economics, authority -- remain valid. See A platform capability does
  not exist all at once.
supersededBy:
  - a-platform-capability-does-not-exist-all-at-once
area: model evaluation
published: 2026-08-09
lastRevised: 2026-08-22
projects:
  - vuoro
relates:
  - what-107-isolated-completions-did-not-show
  - judge-agents-by-the-next-prompt
  - the-agent-is-not-the-application
  - authority-must-travel-with-the-action
  - derived-status-is-earned
  - a-platform-capability-does-not-exist-all-at-once
draft: false
tags:
  - agents
  - evaluation
  - verification
  - context-management
  - cli-tooling
summary: >-
  Outctl cut model-visible Kubernetes output by about 84%, while pair-level cost
  and diagnostic quality remained unresolved. The useful result was a four-part
  evaluation model: mechanism, quality, economics, and authority.
explorePrompt: >-
  This note is disproven: its recommendation that Outctl continue as a general
  context-management layer failed against evidence, and native programmatic tool
  calling now owns that boundary. The current guidance is in "A platform
  capability does not exist all at once". What survives is the evaluation
  method, so use this note as a worked instantiation, not a result to repeat.
  The transferable question is how to evaluate a tool that changes what an agent
  can see or retrieve without confusing mechanism success with task efficacy. In
  the worked case, bounded command projections reduced model-visible Kubernetes
  output by about 84%, but the harness could not establish equal diagnostic
  quality or stable session savings because the quality oracle was too coarse,
  cache effects changed sign across pairs, and shell-level guards did not prove
  identical execution identity. Apply the question to a context-reduction,
  retrieval, summarization, tool-routing, or observability feature you
  supervise. Separate four claims: mechanism, task quality, economics, and
  authority. For each, name the denominator or receipt that would let the
  treatment fail visibly. Distinguish protocol validity from outcome quality so
  weak results remain in the dataset. Identify where the worked case's
  assumptions do not transfer, especially where no complete answer key exists.
  Produce a three-layer evaluation design: deterministic mechanism tests, a
  controlled task comparison with predeclared quality measures, and a real-use
  pilot. Include primary outcomes, invalidity conditions, and the strongest
  claim the evidence could honestly support.
---

> **Update, 16 August 2026 -- disproven.** The output-reduction measurements and
> evaluation findings below remain valid for the direct-tool topology tested.
> The note's own recommendation -- that Outctl had earned continuation as a
> general context-management layer -- did not survive native programmatic tool
> calling, which now owns that boundary. See
> [A platform capability does not exist all at once](/notes/a-platform-capability-does-not-exist-all-at-once/).
> This note is retained as the experiment record.

Outctl did what it was built to do. In clean comparisons, it reduced the
Kubernetes command output shown to a coding agent by about 84%. The reduction
was remarkably stable across runs.

That was not the conclusion I had set out to prove.

Outctl captures complete command output outside the agent's ordinary context,
returns a bounded projection, and lets the agent retrieve specific omitted
evidence later. The experiment was meant to test whether this also made a
cluster health-check session cheaper without making the diagnosis worse. The
first full assessment found a strong mechanism result, a promising product
signal, and a wider efficacy claim that the experiment had not measured cleanly
enough to support.

The problem was not a failed tool. It was an evaluation harness that allowed
four different questions to collapse into one result.

## One comparison contained four claims

A context-management tool can succeed at one layer while failing at another. The
four relevant claims were:

| Claim         | Question                                                                    | What would establish it                                                               |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Mechanism** | Did outctl reduce what entered the model-visible transcript?                | The same logical commands, with complete raw output and measured exposed output       |
| **Quality**   | Did the agent preserve the facts needed for an equally good diagnosis?      | A predeclared fact set, critical-findings oracle, or blinded quality assessment       |
| **Economics** | Did the whole session consume less time, context, or money?                 | Paired token, cache, cost, duration, and command measurements under a frozen protocol |
| **Authority** | Did both arms execute the same permitted operation against the same target? | A runner-owned receipt binding executable, arguments, identity, context, and scope    |

Passing the mechanism test does not establish the other three. A smaller
transcript can still produce a worse diagnosis. It can trigger enough retrieval
and compensating work to cost more. It can also be produced by two executions
that only look equivalent at the shell-command level.

The original harness had one broad notion of a valid pair. The assessment made
clear that protocol validity, task quality, session economics, and execution
identity needed separate records.

## The number that survived

Across three clean comparisons using the final implementation, outctl reduced
model-visible command output by **84.0%, 84.5%, and 84.0%**. One comparison had
been used during commissioning and therefore does not belong in a confirmatory
proofset, but it provides a useful sensitivity check: the mechanism result did
not depend on one unusually favourable run.

This supports a narrow and useful claim:

> Under the supplied Kubernetes health-check workload, outctl materially and
> repeatably reduced the command output exposed to the model.

The broader results were not comparably stable. Pair-level cost moved from
materially worse to materially better. Total input changed direction across
runs. The formally valid pairs reached the same top-level health label while
showing weak overlap in the evidence used to get there.

The mechanism had a repeatable measurement. The other claims did not yet have
adequate denominators.

## Completeness needs a denominator

Both formally valid proofset pairs returned the same overall status: `degraded`.
The harness treated that agreement as evidence that diagnostic quality had been
preserved.

The underlying findings did not justify that inference. Evidence overlap was low
in both pairs, with Jaccard scores of **0.286** and **0.350**. In one pair, the
arms disagreed about critical or high-severity findings. Both could say
`degraded` while describing meaningfully different failures.

> Agreement on the label is not agreement on the diagnosis.

A status such as `healthy`, `degraded`, or `failed` is a useful output field. It
is a poor quality oracle. It does not say which nodes, controllers, workloads,
volumes, or reconciliations should have been identified, which evidence should
support them, or which important condition was missed.

A controlled scenario needs an expected record before either arm runs. For
example:

```yaml
expected:
  cluster_api: healthy
  nodes:
    node-3: not_ready
  gitops:
    appservice: reconciliation_failed
  storage:
    pvc/example: pending
  critical_findings:
    - node-not-ready
```

The comparison can then score what matters:

- expected facts found;
- unsupported findings introduced;
- critical findings missed;
- conclusions linked to command evidence;
- remediation consistent with the observed state.

Not every real task has a complete answer key. Where a full oracle is
impractical, the replacement still has to let the result be wrong in a visible
way: blinded adjudication, seeded faults with known expected deltas, or
metamorphic checks that specify what must change when the underlying condition
changes.

The denominator is not the amount of prose produced, nor the final adjective. It
is the set of facts and distinctions the diagnosis was supposed to carry.

## Validity is not an outcome

The harness also used one `pair_valid` decision for questions that should remain
independent.

If a pair is excluded because the diagnoses disagree, a treatment-induced
quality failure disappears from the dataset. If the rule is relaxed until any
shared top-level label counts as agreement, the quality gate stops testing
quality. The experiment can either discard the failure or wave it through, but
cannot learn from it.

A better result model keeps the dimensions separate:

```yaml
validity:
  instrumentation_valid: true
  execution_identity_valid: true
  protocol_valid: true

outcomes:
  treatment_adopted: true
  critical_miss_a: false
  critical_miss_b: true
  quality_noninferior: false

economics:
  eligible_for_analysis: true
```

All protocol-valid pairs remain in the result set. A quality failure counts
against the treatment; it does not make the comparison vanish. Instrumentation
or identity failures can invalidate a causal comparison without pretending that
the observed behaviour never happened.

This is the same distinction that appears elsewhere in agent supervision: a
record can be complete as a record and still describe a bad outcome. Evidence
quality and result quality are related, not interchangeable.

## Authority has to be measured below the prompt

The comparison tried to keep both arms on the same Kubernetes identity by
exporting a shell function and rejecting disallowed command shapes. The
assessment found command forms that bypassed the function and escaped the
textual guard. A simple `command kubectl ...` was enough to step around the
function that injected the expected kubeconfig and context.

There was no evidence that a cluster mutation occurred. The narrower problem was
that the harness could not prove that both arms used the same executable,
credentials, context, and arguments. The authority comparison was therefore
weaker than the output comparison.

A shell parser can reject command forms it knows about. It cannot establish
which process identity the operating system eventually executed after shell
expansion, environment changes, wrappers, or nested interpreters.

The correct boundary is lower:

```text
logical kubectl request
  -> structural read-only validation
  -> runner injects executable, kubeconfig, and context
  -> direct argv execution without a shell
  -> execution-identity receipt
  -> A: bounded projection
     B: complete output
```

Both arms should share the same execution receipt. They should differ only in
what portion of the already completed result is exposed to the model.

This is a concrete instance of two broader rules.
[The agent is not the application](/notes/the-agent-is-not-the-application/):
the model can choose an operation inside its granted scope, but the application
owns permissions, execution records, and recovery.
[Authority must travel with the action](/notes/authority-must-travel-with-the-action/):
a command string is not an authority receipt merely because it looks familiar.

The harness should not keep expanding a denylist of shell conveniences. That is
parser whack-a-mole with a clipboard. The runner has to own the operation being
compared.

## Compression changes retrieval behaviour

The real-context UX pair was not suitable for a formal causal conclusion because
execution identity was not cleanly matched. It was still informative as a
product observation.

In that pair, the treatment arm showed:

- **79.3% less visible kubectl output**;
- **64.6% less total visible command output**;
- **60.0% fewer kubectl attempts**.

The agent understood and adopted outctl. It made fewer cluster calls and kept
substantially less command output in the conversation. It then issued 13
searches against retained captures, only two of which returned a bounded match.

That is not evidence that retrieval is a bad idea. It is evidence that retrieval
without omission cues makes the agent guess what might be missing. The tool
removed noise successfully, then offered a search box where a map was needed.

A bounded projection should explain its boundary:

```yaml
omitted:
  bytes: 193489
  warning_lines: 17
  error_lines: 4
  sections:
    - pod_inventory_rows
    - historical_events
  suggested_queries:
    - CrashLoopBackOff
    - FailedMount
```

Those hints still need to come through the sanitized projection and index path;
they should not become a side channel around redaction. The interface should
also support batched retrieval and require final findings to cite capture IDs or
bounded windows.

The useful rule is narrower than “search anything later”:

> Retrieve when the projection identifies an omitted region relevant to a
> specific unresolved question. Batch related queries and attach the result to
> the finding it supports.

Search should answer a diagnostic question, not become a slot machine for
missing context.

## Pooled totals are not paired evidence

The cost result looked positive when the valid proofset pairs were pooled. The
combined estimate showed an **18.6% reduction**. Pair by pair, however, the
result moved from about **31% worse** to about **48% better**.

The visible-output reduction remained stable while total-input and cost results
changed sign. Uncached input was lower in both valid pairs, while total input
crossed over sharply. That pattern is consistent with cache timing and reusable
prefixes dominating the total, though the supplied runs were not designed to
isolate the cause.

The reporting rule should therefore be:

1. show every matched pair;
2. report paired effects first;
3. record starting order and cache state;
4. treat pooled totals as secondary operational accounting;
5. freeze the protocol before collecting confirmatory runs.

Three pairs can commission a harness. They cannot settle an outcome that changes
sign.

The next controlled study should use replayable or seeded scenarios, randomize
arm order, and separate cold and warm cache conditions where the platform makes
that observable. Uncached-read input is the cleaner session-accounting signal;
total input, package-pinned cost, and duration remain useful secondary outcomes.

## Three tests instead of one

The evaluation becomes cleaner when outctl is asked to pass three different
experiments.

| Experiment                            | Purpose                                                                             | Primary evidence                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Deterministic mechanism benchmark** | Establish what outctl itself does without model variance                            | Complete capture, projection bounds, redaction, retrieval, cancellation, quotas, and partial-capture behaviour          |
| **Controlled agent comparison**       | Test whether bounded exposure preserves task quality and improves session economics | Predeclared expected facts, critical misses, evidence references, visible output, and uncached input                    |
| **Real-use pilot**                    | Observe adoption and compensating behaviour in ordinary work                        | Retrieval utility, reruns avoided, logical command count, cluster calls, latency, and long-session context accumulation |

The first test should use recorded and synthetic command outputs and run often.
It can verify byte-preserving capture, bounded projection, explicit omission,
redaction, signals, cancellation, quota handling, and recovery without paying
for an agent or depending on a cluster's current mood.

The second should use seeded operational scenarios and a runner-owned
direct-argv boundary. Diagnostic quality and critical misses are co-primary
outcomes, not an inclusion rule. Visible command output and uncached input
measure the intended mechanism and session effect. Cost and duration remain
secondary until the variance is understood.

The third should retain genuine opt-in guidance and realistic tasks. It answers
the product questions that a fixed corpus cannot: whether agents adopt the tool,
when they retrieve, whether they rerun commands unnecessarily, and whether the
benefit accumulates over a long session rather than only in one final report.

Trying to answer all three questions with one small A/B proofset made each claim
less legible. Separating them lets the mechanism be strong without forcing the
rest of the story to agree.

## What outctl has earned

The project should continue. Full evidence survives outside ordinary chat;
model-visible output is materially reduced; omitted evidence can be recovered
without rerunning a command; and the real-context run suggests that agents can
adopt the interface and reduce cluster calls.

What the current evidence has not earned is a stable cost-saving claim or a
claim of diagnostic non-inferiority.

The defensible public statement is:

> In clean controlled comparisons, outctl reduced model-visible kubectl output
> by about 84%. Early token and cost results were mixed, and the original
> quality oracle was too coarse to establish equal diagnostic quality.

Detailed reports, harness source snapshots, pair-level metrics, and raw captures
are retained privately. This note reports aggregate outcomes and the evaluation
design defects they exposed; it is not a reproducible public dataset.

The working model is broader than outctl:

> **A tool that changes what an agent sees must be evaluated against the work it
> preserves, not only the text it removes.**

Current confidence: high in the output-reduction mechanism under the supplied
workload, moderate in the product direction, and low in the current evidence for
cost and quality efficacy.

The mechanism already passed its test. The next harness has to give the
diagnosis, the economics, and the authority a fair chance to disagree.
