---
title: Judge agents by the next prompt
status: guiding
area: agent workflow
lastRevised: 2026-07-13
relates:
  - the-coordinator-never-touches-the-repo
  - the-missing-layer-is-binding-not-intelligence
  - compatibility-reports-should-be-a-little-rude
tags:
  - agents
  - evaluation
  - workflow
summary: New agents carry more work from intent to evidence, but that changes rather than removes the supervision problem. The next prompt reveals whether the result needs repair or is ready to extend.
---

The best evidence that an agent understood the work is the next thing I have to tell it.

If the follow-up is "run an actual scan", "check every port", or "find a specific product", the first answer transferred the unfinished reasoning back to me. If the follow-up is "publish it", "roll it out", or simply "approved", the agent did something more useful: it turned an underspecified intention into work I could extend or authorize.

That distinction has become a better evaluation method than comparing prose, counting tool calls, or asking which model feels smartest. It measures the part that matters in practice: supervision.

I reached it by comparing recent agent sessions across several small tools and infrastructure repositories. The work ranged from creative workflow design to concurrency semantics and live cluster changes. Three current agents looked strong in three different ways. One was best at carrying a product's internal logic through long implementation sessions. One was best at turning an ambiguous cross-repository problem into explicit invariants, worker contracts, and rollout evidence. One moved through bounded integration work with exceptional speed.

In this sample those roles appeared in Claude Fable, GPT-5.6 Sol, and GPT-5.6 Terra respectively. The names matter as provenance, not as a permanent taxonomy. Each result describes the work observed, under the tools and instructions available at the time.

Trying to collapse those results into a single leaderboard made the assessment worse. The agents had not taken the same exam.

The product-oriented agent had spent most of its time inside one evolving system. It understood not only the CLI and tests, but why a writer would tolerate a ratification step, when source material should bypass canon discipline, and which parts of the workflow should remain operator-only. Its strongest result came from dogfooding: it ran a real essay through a fiction-shaped pipeline, found where the abstractions fought the work, and then turned those findings into a native essay mode with dedicated tests. That is not generic coding performance. It is embedded product judgment.

The systems-oriented agent had a different strength. Given a vague concern spanning stateful tools, it found concrete races, separated SQLite behavior from PostgreSQL behavior, derived invariants, wrote bounded protocol models, and turned the result into independently mergeable work. In infrastructure sessions it also kept going past configuration and CI into live write-read checks, restore drills, reconciled revisions, and service health. Its characteristic move was to ask what claim the system was making, then find the evidence that would make the claim true.

The fast executor was strongest once the decision boundary was already visible. It repaired a large test suite, updated several repositories, rebased and merged pending changes, built an image through an alternate publication path, reconciled the deployment, and proved the running endpoint in a short sequence. It also made sensible negative decisions: a static publication site should not advertise OAuth, an MCP server, or an API catalog merely because a scanner rewards those files.

Each strength came with its own failure mode.

The embedded product agent could run for hours, consume most of its allocation, and leave an interrupted handoff untidy. The systems agent could turn one useful convention into three rollout phases, six repositories, and a modest constitutional framework before lunch. The fast executor could miss two draft pull requests, then propagate the rest of a plan quickly enough that the omission mattered. Speed, coherence, and formal depth are all useful. None is self-authenticating.

The comparison itself needed the same discipline. One set of chat logs covered only ChatGPT agents. It supported a strong conclusion that a newer agent required fewer repair turns than earlier ChatGPT sessions. It could not support a conclusion about an Anthropic agent whose logs were absent. Cross-provider evidence had to come from repository sessions, and even those were not controlled: different tasks, different tools, different levels of project maturity, and very different sample sizes.

This sounds like a statistical footnote. It is actually an operating rule. Agent evaluation goes wrong when evidence from one task family is promoted into a general law. A model that is excellent at finding protocol boundaries may still be the wrong choice for living inside a creative domain for four hours. A model that evolves that domain beautifully may be untested as the principal operator of a production migration. "Best" is often just an unlabelled statement about which work was sampled.

There was still a generational change underneath the uneven comparison. It was not prettier prose or a higher ceiling on isolated answers. Earlier agents were often very capable answer generators. They could explain an implementation, suggest a design, or produce a useful first pass. The supervision cost appeared in the next turn: inspect the actual repository, run the scan instead of describing one, check the whole surface, choose a concrete product, carry the recommendation into an artifact.

The newest agents more often absorb that second turn into the first. They inspect before generalizing, recognize a pattern across projects, preserve design constraints for longer, and continue from analysis into a plan, issue, test packet, pull request, or deployed change. The practical shift is from "here is how you could do it" toward "here is the bounded thing, the evidence I gathered, and the next decision that remains yours." That is why the reduction in repair prompts matters more than any improvement in style. It is a reduction in babysitting.

The technical depth has changed as well. Older sessions were good at implementation guidance. The stronger new sessions reason about protocol semantics: what owns a transition, which invariant a claim depends on, where a check-then-write race enters, what recovery means after an unknown outcome, and whether the proposed test can actually distinguish safety from a lucky final state. That depth is most valuable when it becomes executable evidence rather than a long explanation.

Some of the improvement belongs to the environment. The agents now have repository access, GitHub state, persistent context, stronger project instructions, mature test suites, and explicit coordination tools. Better prompts and better architecture make better runs. But tools explain how an agent opened six repositories and published six changes. They do not fully explain why it found the right shared failure mode, separated two storage semantics, or rejected an authentication document for a site with nothing to authenticate. The reasoning improvement is real even when the comparison is unfair.

The new generation has therefore changed the main review question. With older agents I asked whether the answer was grounded and complete enough to use. With newer agents I more often ask whether a well-grounded conclusion has been allowed to grow too far. A capable agent can turn a useful local convention into a cross-repository standard before the convention has earned that authority. The old failure was stopping at advice. The new failure is arriving with a rollout programme for a premise that still needed one human decision.

I now find three roles more useful than one ranking.

The principal analyst takes ambiguous architecture, inspects the real systems, cuts scope, names the invariants, and defines what evidence would count. This role should be expensive enough to avoid shallow decomposition, but constrained enough not to convert every finding into a programme.

The embedded product builder stays close to one domain. It carries terminology, user friction, tests, and deliberate exclusions across sessions. This is where continuity matters more than raw breadth. The work should end at clean checkpoints because the model's main risk is not misunderstanding the product; it is continuing past a sensible stopping point.

The bounded executor receives a crisp contract and moves quickly through implementation, integration, and rollout. Its contract needs an inventory check and an explicit verification target. Otherwise it can complete the visible work while confidently stepping around the thing nobody enumerated.

This is close to the model routing I already use for plan, build, and review, but with one correction: capability tier is not enough. The assignment should encode the shape of judgment required. Planning a concurrency protocol and planning a writer's workflow are both "planning" only at a distance. Up close, one needs adversarial state reasoning and the other needs sustained product empathy.

The evaluation loop also needs a record better than memory. For each substantial session, the useful questions are small:

- Did the next turn repair the agent's understanding, extend the work, or authorize it?
- Did the agent inspect the real state before forming a conclusion?
- Did it produce a durable artifact, or only advice about one?
- What independent evidence supports the result?
- Where did a human decision remain necessary?

The first question captures supervision cost. The second catches fluent generalization. The third distinguishes analysis from follow-through. The fourth keeps polished formalism from becoming proof by typography. The fifth preserves the product boundary.

That fourth check matters most with capable agents. A TLA+ model can be exhaustively checked while modelling the wrong abstraction. A test packet can encode an invented product law. Six repositories can agree perfectly on a convention that should never have left the first design note. Better agents make premature consistency cheaper.

The authority chain therefore stays deliberately uneven. The agent proposes the law. A model checker can verify the bounded protocol it was given. Deterministic tests verify executable behavior. CI verifies integration. Live probes verify the deployed system. A human decides whether the law was worth adopting in the first place.

For broad prompts I add one more constraint: a scope ceiling. The agent must separate the minimum change required now from worthwhile follow-ons, state the evidence needed for the first, and stop before implementing the second without authorization. This keeps initiative while removing the assumption that every correct observation deserves an immediate platform.

The point is not to find one agent that wins every category. It is to arrange the work so that each agent's likely failure appears where another boundary can catch it. Give ambiguous systems work to the agent that can reduce it. Give domain-rich product work to the agent that can inhabit it. Give bounded integration to the agent that can move. Then judge all three by the next prompt they make necessary.

The best agent is not the one that leaves me with nothing to say. It is the one that makes my next sentence a decision instead of a correction.
