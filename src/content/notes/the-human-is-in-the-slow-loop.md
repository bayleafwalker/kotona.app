---
title: The human is in the slow loop
role: exploration
status: exploration
lifecycle: current
area: agent workflow
published: 2026-08-19
lastRevised: 2026-08-22
projects:
  - vuoro
relates:
  - a-merged-pr-is-not-an-architectural-decision
  - the-next-prompt-was-only-the-visible-error
  - authority-must-travel-with-the-action
  - the-agent-is-not-the-application
  - the-recommendation-does-not-need-authority
draft: false
terms:
  - term: Vuoro
    definition:
      The public label for this family of small, separately owned agent-workflow
      tools.
tags:
  - agents
  - workflow
  - authority
  - automation
  - oversight
summary:
  A prior "human perpendicular to the loop" claim only describes one interface.
  The fuller model is two coupled loops at different speeds, with a settlement
  boundary -- not an empirical/normative split -- deciding when the slow loop
  must be consulted.
explorePrompt: >-
  Use this note as one worked instantiation, not a rule to copy. The
  transferable question: once routine execution and handoff in a workflow become
  machine-to-machine, what is left for the human, and how do you tell a genuine
  human checkpoint from one that is only compensating for missing orchestration
  or uncompiled policy? This instantiation concludes that the human moves from a
  checkpoint inside a fast execution loop to a slower adaptation loop that
  revises intent, policy, authority, and evaluator design; that "approve"
  bundles four separable functions (evidence acknowledgment, policy
  authorization, outcome commitment, and accountable attestation) that should
  not share one button; that the useful dividing line is a settlement predicate
  (evidence sufficient, policy resolves the fork, authority delegated,
  accountability satisfied, no calibration review due) rather than an
  empirical-versus-normative split; and that removing humans from routine
  execution creates new assurance obligations -- independent sampling, evaluator
  challenge, evidence lineage, recovery practice, fail-obvious behaviour --
  because an evaluator cannot report its own blind spots. Its constraints are a
  single-operator setup (Vuoro) where work can be paused, replayed, and rolled
  back, and where cross-host, cross-session handoffs are already partly
  automated. Apply the question to your own workflow. Name where your
  constraints diverge -- multiple reviewers, irreversible actions, regulatory
  attestation requirements -- and say which conclusions stop holding there.
  Produce a classification of your own recent human interventions against the
  categories this note proposes (orchestration debt, missing policy, new
  commitment, judgment under uncertainty, accountable attestation, calibration
  review, abnormal recovery), and state which category dominates.
---

_What changed when the control plane started working._

I originally thought "human in the loop" had the wrong geometry. The development
loop was becoming machine-to-machine, while the human increasingly acted from
outside it: setting intent, changing priorities, defining acceptable risk and
deciding which externally visible distinctions mattered.

The human was not another worker between build and review. The human was
perpendicular to the loop.

That still describes one useful interface. It does not describe the whole
system.

Humans can leave the high-frequency execution path. They do not leave the
feedback system. They learn what they want by seeing outcomes. They notice when
an evaluator is confidently measuring the wrong thing. They revise policies that
looked sensible before they touched a real implementation. They carry forms of
authority and accountability that are not satisfied merely because a policy
engine returned `allow`.

The better model is not one loop with a human inserted into it, or one loop with
the human standing cleanly outside it. It is two coupled loops operating at
different speeds.

```text
           HUMAN–SYSTEM ADAPTATION LOOP

       inspect outcomes · notice surprises
                     │
                     ▼
      revise intent · policy · evaluators
        authority · risk · accountability
                     │
                     │ changes the envelope
                     ▼

═══════════════════════════════════════════════

              FAST DEVELOPMENT LOOP

   discover → build → challenge → verify → integrate
       ↑                                      │
       └──────────────────────────────────────┘

═══════════════════════════════════════════════

                     │
                     │ evidence · product · failures
                     ▼
           back to the adaptation loop
```

The fast loop can become substantially machine-to-machine. The slow loop cannot
be removed merely by making the fast one more capable.

## The control plane really was technical debt

One part of the original argument has held up unusually well. A lot of what
looked like human judgment in agent workflows was not judgment at all. It was:

```text
state changed
→ notice it
→ choose the next transition
→ move context
→ start another worker
```

A human started a reviewer because the implementation session had finished. The
reviewer found an issue. The human copied the result back to the implementation
session. Another session reran verification. Eventually the human looked at
several green outputs and allowed the work to advance. There might have been a
meaningful decision somewhere in that sequence. Most of it was orchestration.

That gives a useful test for every human checkpoint:

> Is the human supplying information, authority or accountability that cannot
> currently be derived, or are they compensating for missing orchestration?

The second category is not a durable human role. It is control-plane debt.

My own workflows are already further through that transition than the original
argument admitted. Merge review can be arranged through coordinators.
Agent-to-agent handoffs can proceed through structured events without a person
carrying the message. Cross-host execution is becoming ordinary rather than an
exceptional case that needs manual babysitting.

The human still initiates much of the work, defines its envelope, resolves some
escalations and decides when the result is good enough to matter. But moving a
result from one worker to the next is no longer a convincing theory of human
contribution.

## The three planes still hold

It remains useful to split the system into three planes.

```text
                 SEMANTIC PLANE

          intent · meaning · priorities
       risk · authority · product commitments


                  CONTROL PLANE

        scheduling · handoff · invalidation
       escalation · policy · state settlement


                 EXECUTION PLANE

           agents · tools · tests
       build · challenge · verify · deploy
```

The execution plane performs work. The control plane decides which transitions
may occur and keeps the work coherent across time, workers and machines. The
semantic plane contains the meaning of the work: what outcome is intended, which
distinctions matter and what counts as an acceptable result.

The mistake is to turn that architectural decomposition into a permanent
allocation of actors:

```text
execution + control → machine
semantics           → human
```

The boundary is not that clean. A semantic distinction can become encoded
policy. A control transition can require judgment under uncertainty. Execution
evidence can teach the human that the original intent was incoherent. A machine
can discover that a legal or product distinction already resolves what appeared
to be an open preference.

The planes remain different. The allocation of work across them remains dynamic.

## The boundary retreats

I previously drew the human boundary between empirical and normative
information. Questions such as these looked empirical:

```text
What does this code do?
Who calls this interface?
Which candidate satisfies the constraints?
Can this migration be rolled back?
Did the tests pass?
```

Questions such as these looked normative:

```text
Do we care about this distinction?
Which compromise fits the business?
How much risk are we willing to carry?
Is this experience good enough?
```

The first category could increasingly be derived by machines. The second
required a human because no answer existed until somebody chose one. There is
something real here, but it is not a durable boundary.

"How much risk are we willing to carry?" may already be answered by an existing
risk appetite, deployment policy or authority limit. "Does this distinction
matter?" may be answered by a regulation, contract or previously declared
product invariant. A choice that first appears normative may become derivable
once the system retrieves the right evidence and policy.

Meanwhile some genuinely difficult human interventions are not preferences at
all. They are judgments under uncertainty. The available evidence does not
settle the question. Existing policy does not distinguish the candidates.
Somebody has to decide which assumptions to carry, how much uncertainty is
tolerable or whether the decision is reversible enough to make now.

The more useful boundary is therefore not empirical versus normative. It is a
**settlement boundary**.

```text
may_advance =
    evidence_is_sufficient
    and current_policy_resolves_the_fork
    and authority_has_been_delegated
    and accountability_requirements_are_satisfied
    and no_calibration_review_is_due
```

When that predicate is false, a human may be needed for several different
reasons:

- to make a new commitment about the intended outcome;
- to supply a prior or judgment under unresolved uncertainty;
- to extend or restrict authority;
- to provide required accountable attestation;
- to inspect whether the system's evaluators remain legitimate.

That boundary retreats. Once a distinction has been resolved, the answer should
usually become a scoped policy, invariant, default, risk budget or declared
don't-care. If the system asks the same unchanged question again, the human is
probably compensating for missing memory or policy compilation.

Technical debt can wear a semantic hat.

## Preferences do not always exist before the work

There is another problem with treating humans as the source of non-derivable
information. It imagines the human as an oracle.

The system excavates a technical fork, translates it into a consequence-shaped
question and asks the human for the missing bit:

> Both approaches reproduce previously submitted figures. Only one preserves
> what was known at the original reporting date separately from information
> learned later. Does that distinction matter?

That is a much better question than:

> Should we use bitemporal modelling or reporting-date snapshots?

The system has already removed irrelevant implementation detail and exposed the
actual consequence. But even this assumes that the human already knows the
answer.

Often nobody knows what they want until they see the thing. Intent is formed
through contact with output.

A person may need:

- two working variants;
- a behavioural diff;
- a reversible prototype;
- examples of the awkward edge cases;
- a simulation of likely downstream consequences;
- an explanation of which future options each decision closes.

The interface should therefore provide **consequence-shaped evidence**, not
merely consequence-shaped questions.

```text
candidate A
→ simpler operating model
→ cannot reconstruct original knowledge state

candidate B
→ more complex temporal model
→ preserves original and subsequently learned facts separately
```

Sometimes the human adds one bit. Sometimes the fast loop teaches the slow loop
enough for a preference to be constructed.

That is why "perpendicular" is locally useful but globally wrong. Authority may
enter the fast loop on a different axis, but evidence and experience flow back
in the other direction.

The loops are coupled.

## "Approve" hides four different functions

Human approval still bundles together several unrelated operations.

| Function       | Actual question                                      | Likely mechanism                    |
| -------------- | ---------------------------------------------------- | ----------------------------------- |
| Evidence       | Did the required checks pass?                        | Automated evidence                  |
| Policy         | Is this transition allowed?                          | Encoded authorization               |
| Commitment     | Which externally meaningful outcome are we choosing? | Human or delegated authority        |
| Accountability | Who attests to and stands behind this action?        | Named institutional role or process |

The first should rarely require a person. Much of the second can become
software. The third is where new product, risk and organisational commitments
enter the system. The fourth is different from all three.

A signature is not an additional piece of technical information. It allocates
responsibility. An organisation may require somebody to be answerable for a
deployment, exception, financial interpretation or externally observable change.
That requirement is not removed merely because the underlying checks and
policies can be automated.

Accountability does not necessarily mean a human must click on every transition.
It may be satisfied through prior mandate-setting, control ownership, risk
acceptance, sampled review, periodic attestation or explicit approval of a
particular high-impact action. But it must be represented as its own
requirement.

Otherwise the interface collapses four functions back into one green button and
calls the ambiguity governance.

The buttons should say what the person is doing:

```text
Acknowledge evidence
Authorize exception
Choose behaviour
Accept risk
Attest review
```

Those are not interchangeable actions.

## The oracle problem is the centre, not the footnote

The strongest objection to removing humans from the execution loop is not that
agents will make obvious mistakes. Obvious mistakes are comparatively friendly.
They fail a test, break a build, violate a schema or produce a visible
regression.

The dangerous case is a system that efficiently converges on the wrong
definition of correctness.

```text
generate candidates
→ test against evaluator
→ discard failures
→ integrate survivor
```

This can be an excellent development process. It can also be an extremely
efficient machine for producing the wrong thing.

Passing an evaluator proves success according to that evaluator. It does not
prove that the evaluator protects every distinction that matters.

This is not a new automation problem. Bainbridge's _Ironies of Automation_
described how automating tractable routine work can leave humans responsible for
rarer and more difficult abnormal situations while reducing the exposure through
which they maintain skill and situational understanding.

The older Fitts or MABA–MABA framing -- assigning functions according to what
humans or machines are better at -- has also been criticised as too static. The
performance of the combined system depends on interdependencies, coordination
and what happens under abnormal conditions, not merely on assigning each
isolated task to the apparently stronger actor.

That is a direct challenge to the perpendicular-human thesis. The human who no
longer watches the work may be the person least equipped to notice that the
evaluator has become blind.

Automating the easy work can leave a harder residual task under worse
conditions:

- less frequent exposure;
- weaker practical calibration;
- a more complex system;
- higher consequence when intervention finally becomes necessary.

Software development is not an aircraft cockpit or a chemical plant. That helps.
Work can often be paused. Changes can be replayed. Candidates can be forked.
Deployments can be rolled back. Evidence can be inspected asynchronously. A
human rarely needs to seize the controls within seconds while the repository
descends toward the North Sea.

But those properties only help if the system is built around them. Moving humans
out of routine execution creates new assurance requirements.

### Independent sampling

Humans should inspect a random or risk-weighted sample of apparently successful
work, not only the cases the system already knows to escalate. An evaluator
cannot reliably report its own blind spots.

### Evaluator challenge

Separate workers should attempt to identify missing dimensions, gameable metrics
and implicit assumptions in the acceptance criteria. The main evaluator should
itself be treated as an artifact that can fail.

### Evidence lineage

Compressed summaries must permit drill-down into decisions, traces and raw
evidence. "Everything was green" is not enough if nobody can later reconstruct
what green meant.

### Recovery practice

Rollback, replay and manual intervention paths need to be exercised
occasionally. A recovery mechanism that exists only in a diagram is closer to
decorative architecture than resilience.

### Fail-obvious behaviour

Ambiguous degradation is worse than a bounded, legible failure. The system
should surface uncertainty, incomplete evidence and disputed evaluator coverage
rather than quietly converting them into confidence.

The conclusion is not that humans should watch every machine action. It is also
not that humans should appear only when the system encounters a problem its own
evaluators can already recognise. Humans need deliberate exposure without
becoming throughput gates.

"Nothing went red" remains useful evidence. It is also a coverage report.

## The constitution is a rate limiter

A machine development loop may execute thousands of actions inside one admitted
work envelope. A human cannot answer thousands of semantic questions one at a
time. Even well-formed questions become a queue. Once that happens, the semantic
plane reproduces the same failure as the old review process: the human becomes a
throughput bottleneck, then a rubber stamp, then an expensive icon attached to a
mostly automated transition.

The answer is not merely better escalation wording. It is a maintained
constitution.

```text
desired outcomes
invariants
authority boundaries
declared don't-cares
risk budgets
reversibility requirements
accountability requirements
evaluation legitimacy
```

The constitution is not a nice description of senior work. It is the mechanism
that makes bounded machine execution viable. It acts as:

- a cache of prior decisions;
- a compiler from intent into enforceable policy;
- a scope system for delegated authority;
- a declaration of distinctions that do not matter;
- an escalation suppressor;
- a rate limiter for scarce human attention.

Every meaningful escalation should produce a reusable consequence:

```text
scoped policy
time-bounded exception
new invariant
declared don't-care
reversible default
mandatory future attestation
```

Otherwise the system has borrowed a human for one transition and learned
nothing. The escalation surface can also be measured.

| Measure                                         | What it reveals                               |
| ----------------------------------------------- | --------------------------------------------- |
| Human interventions per 100 settled transitions | Demand on the slow loop                       |
| Share derivable from already available state    | Context or orchestration debt                 |
| Repeated-question share                         | Failure to compile decisions into policy      |
| Human queue latency                             | Whether the semantic plane is the bottleneck  |
| Sample-review disagreement rate                 | Evaluator blindness                           |
| Downstream false-green discoveries              | Missing oracle coverage                       |
| Later reversals                                 | Quality of commitments made under uncertainty |

Question rate alone is not a useful target. Zero questions may indicate
excellent policy. It may also indicate that the system has achieved serenity by
becoming blind.

## What the operating system already says

The transition is no longer entirely a forecast. In my own setup:

- merge review is increasingly arranged through coordinator workflows;
- agent handoffs can proceed through structured events;
- work can move across hosts without that movement being the main problem;
- durable state survives the individual sessions performing the work;
- human attention is moving toward admitting work, changing its mandate,
  resolving remaining exceptions and evaluating the overall result.

That is enough to reject the simple sequence:

```text
human → agent → human → agent → human
```

But it is not enough to claim a fully autonomous development organisation. The
system does not originate its own mandate. It does not independently decide
which products should exist, which business risks are justified or which
constitutional rules it may rewrite.

Vuoro in particular does not need to become a self-directed developer to support
this model. Its role is durable operational state and settlement across
independently owned sessions, agents, repositories and machines. Execution
remains external and replaceable. Authority remains explicit.

The useful distinction is:

> The loop can be autonomous inside an admitted work envelope without
> originating its own mandate.

Autonomy has several dimensions.

```text
Create the mandate
→ human or external authority

Admit bounded work
→ explicit authority boundary

Implement, challenge and verify
→ replaceable machine workers

Progress routine handoffs
→ control-plane software

Revise intent or risk posture
→ slow human–system loop

Provide accountable attestation
→ responsible organisational actor
```

That resolves the apparent tension. Automating execution and handoff is not the
same thing as giving the system an independent purpose.

## What remains unmeasured

I can report the direction of the transition. I cannot yet report its rate with
much precision. I do not have a complete classification of which recent human
interventions were:

```text
orchestration debt
missing policy
new product commitment
judgment under uncertainty
accountable attestation
calibration review
abnormal recovery
```

That is the next honest test. For a sample of completed work, each intervention
should be recorded with enough context to ask:

```text
Where did the human intervene?
What triggered the intervention?
Could the answer have been derived from available state?
Was new authority required?
Was accountability the actual requirement?
Had the same distinction been resolved before?
Did the answer become reusable policy?
Did the intervention change the outcome?
Was the decision later reversed?
```

The resulting evidence matters more than another forecast. If most interventions
are derivable, the control plane is still incomplete. If they are repeated, the
system is failing to retain or compile decisions. If they concern evaluator
coverage, the assurance architecture needs work. If they are genuine new
commitments, judgments under uncertainty or accountability events, then the slow
loop is doing the work it exists to do.

That would turn the thesis into an operating report.

## Out of the fast path, not out of development

The useful future is not "human in the loop" as a mandatory checkpoint between
machine actions. It is also not "human out of the loop" as an absence of
oversight.

The fast development loop can become machine-to-machine. The control plane can
become software. Human authority can enter without interrupting every
transition. But evidence and product must return to a slower loop where intent
is revised, preferences are formed, accountability is carried and the definition
of correctness itself is challenged.

```text
                SLOW LOOP

      intent · policy · authority
    accountability · evaluator design
                   │
                   ▼

═══════════════════════════════════════

                FAST LOOP

    discover → build → challenge
        ↑                  ↓
        └── integrate ← verify

═══════════════════════════════════════

                   │
                   ▼
       evidence · product · surprise
```

"Perpendicular" still describes how authority enters the fast execution path. It
does not describe the topology of the whole human–machine system.

The human is not another worker between build and review. The human is not an
oracle holding a complete set of hidden preferences. The human is not usefully
reduced to an Approve button. The human is part of a slower loop: learning from
outcomes, revising the envelope, carrying responsibility and checking whether
the fast loop is still solving the right problem.

The practical challenge is therefore not simply to remove human checkpoints. It
is to build a fast loop that can proceed without ceremonial supervision, a slow
loop that can still change the system, and an evidence surface that prevents the
slow loop from becoming blind.

The human leaves the transaction path.

The human does not leave development.
