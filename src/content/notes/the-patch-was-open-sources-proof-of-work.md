---
title: The patch was open source's proof of work
status: exploration
lifecycle: current
area: open source
published: 2026-07-19
lastRevised: 2026-07-19
projects:
  - sprintctl-and-kctl
relates:
  - derived-status-is-earned
  - the-junior-ladder-was-a-joint-product
  - a-pipeline-without-a-successor-is-personal-tooling
  - legibility-is-an-operating-property
  - compatibility-reports-should-be-a-little-rude
tags:
  - agents
  - open-source
  - verification
  - maintenance
summary: AI weakens the old correlation between producing a plausible patch and understanding a project, so OSS contribution shifts toward evidence, verification, standing, and durable ownership.
draft: true
---

Open source may stop wanting code from strangers before it stops wanting
contributions.

An external patch used to supply two scarce things. It supplied execution
capacity the maintainers did not have to spend, and producing it usually forced
the contributor to acquire at least some project substrate: architecture,
conventions, failure modes, test behavior, and maintainer intent. The artifact
was useful, and the cost of producing it was an imperfect signal that the author
understood enough to justify review.

That cost was also the contribution channel's accidental rate limit. Writing a
plausible change took long enough that relatively few people submitted one. The
work rationed maintainer attention without anybody designing an admission
system.

AI weakens the correlation. It can make a plausible patch cheap without making
the project's substrate equally cheap to acquire. The artifact no longer
proves that its author can explain the change, respond to review, recognize a
hidden constraint, or maintain the behavior later. Submission cost falls while
review cost remains attached to the maintainer.

The patch was open source's proof of work. It still proves that some work was
performed. It no longer proves who understood it.

## Implementation stops being the scarce contribution

Once maintainers can generate routine implementation themselves, an unsolicited
implementation has awkward economics. It introduces code they must understand
without necessarily supplying information they lacked. Given a trustworthy
reproduction, clear behavioral contract, and bounded compatibility surface, the
maintainer may be able to produce a better-aligned patch with an agent faster
than they can review a stranger's generated version.

Contribution value moves to both sides of implementation.

Upstream, projects need substrate: a real use case, a minimal reproduction,
environment details, historical comparison, constraints the maintainer cannot
observe, a precise behavioral claim, or evidence that an issue matters beyond
one generated suggestion.

Downstream, projects need assurance and ownership: adversarial tests, affected
version analysis, compatibility evidence, independent reproduction, deployment
experience, documentation grounded in actual use, sustained triage, and a
person willing to remain when the first review comment arrives.

Code remains valuable where it embodies difficult discovery or expertise. Its
default value changes. "Here is a patch" becomes weaker than "here is a fact
about your project that you can verify, and I will help carry its consequences."

## The intake surface stratifies

The likely response is neither fully open review nor universal invitation-only
development. Projects divide contribution surfaces according to verification
cost.

| Surface                         | Likely admission rule                                                    |
| ------------------------------- | ------------------------------------------------------------------------ |
| Mechanically decidable changes  | Open submission with automated checks                                    |
| Bug reports and behavior claims | Reproduction and evidence before maintainer review                       |
| Compatibility or domain changes | Demonstrated use case plus an affected stakeholder                       |
| Architecture and concurrency    | Prior discussion, RFC, or maintainer sponsor                             |
| Security claims                 | Structured private channel, rate limits, reputation, and reproducibility |
| Release or authority changes    | Existing project standing and explicit role                              |

Mechanically gated channels can remain open to strangers because a failed
contribution is cheap to reject. Judgment-heavy channels acquire prerequisites
because every plausible submission consumes scarce substrate knowledge.

Standing therefore becomes more important, but it should not become the only
gate. If prior standing is required everywhere, open source creates a circular
admission rule: contribution requires trust, while contribution was how a
stranger earned trust. Proof-carrying entry surfaces—reproduction, bisection,
test maintenance, issue archaeology, documentation verification, and bounded
triage—let an unknown person establish reliability without first demanding an
architectural review.

The practical future is tiered participation. The source stays readable and
forkable. The right to place work in a maintainer's judgment queue becomes
conditional.

## Saturation is already changing controls

The curl security channel is a useful early case, not a universal law. In July
2025, Daniel Stenberg reported that obvious AI slop had reached roughly 20% of
curl security submissions, while only about 5% of that year's submissions had
been genuine vulnerabilities at that point. Each report could engage several
security-team members for substantial triage. The project ended monetary bug
bounties in January 2026. Stenberg later reported that the obvious slop had
largely disappeared while report volume remained high and quality improved.
The composition responded to a change in incentives and intake; saturation was
not an irreversible property of contributors. ([July 2025](https://daniel.haxx.se/blog/2025/07/14/death-by-a-thousand-slops/),
[January 2026](https://daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/),
[April 2026](https://daniel.haxx.se/blog/2026/04/22/high-quality-chaos/))

GitHub has started to encode the same pressure. It now lets maintainers cap
concurrent pull requests from users without write access while exempting trusted
contributors. The control is explicitly aimed at repeated low-quality or
drive-by contributions that overwhelm review queues. It is a small feature with
a revealing shape: a quota for unknown contributors, a bypass for standing, and
no claim that generating more reviews will solve the asymmetry.
([GitHub](https://github.blog/changelog/2026-06-17-limit-open-pull-requests-for-users-without-write-access/))

## AI works both sides of the queue

The same models can expand review capacity. They can reproduce reports, compare
claims with project history, detect duplicates, run compatibility suites,
summarize a change, and flag violations of explicit contracts. Better
verification can keep more contribution surfaces open.

But generated review is not automatically independent verification. A model
screening output produced by a similar model can share blind spots, reward the
same plausible style, and create a higher-speed exchange of mutually reassuring
text. The scalable gates are strongest when they terminate in executable
evidence: a reproducer, failing test, invariant, static analysis, trace,
behavioral comparison, or bounded experiment.

The long-term outcome depends less on generation capability than on the cost of
rejecting a wrong contribution. Projects with strong contracts and cheap
verification can accept wide participation. Projects where every contribution
requires a maintainer to reconstruct intent will protect attention through
standing, sponsorship, quotas, or closure.

## The middle of open source takes the damage

Large projects can fund triage teams, security channels, bots, foundations, and
formal contributor ladders. Tiny personal projects can state that patches are
unwelcome and remain honest artifacts maintained by one person.

Projects in the middle have the worst exposure: enough users to attract a flood,
enough consequence that changes need judgment, and too few maintainers to build
an intake institution. Their rational outcomes include ignoring unsolicited
pull requests, requiring prior issues, accepting changes only from known users,
moving implementation in-house with agents, or abandoning collaborative
maintenance while leaving forks available.

This makes open source less uniformly collaborative even if the amount of open
code grows. More software can be generated and published while fewer projects
retain a viable path from unknown user to trusted maintainer.

## The apprenticeship moves to verification

That path matters because open source has been a profession-wide apprenticeship
without an employer making the hiring decision. A novice could acquire real
substrate in public, receive demanding review, and leave with portable evidence
of formation.

If standing precedes all review, that ladder disappears exactly when firms are
also reducing routine junior production. The replacement seat is again
reconciliation: triage, reproduction, bisection, regression maintenance,
release verification, issue history, and bounded review against declared
contracts. This work is now more valuable than another plausible patch, exposes
the learner to project substrate, and can earn trust through evidence rather
than polish.

Projects that formalize a path from verification work to scoped authority can
still form maintainers. Projects that only filter submissions will protect the
current team while emptying the succession pool.

The expected destination is not closed source. It is open artifacts with
metered judgment. Unknown contributors will still enter where they can make
their claims cheap to verify. Everywhere else, the scarce contribution will be
neither code nor model access. It will be evidence that the contributor knows
what should change, plus standing earned by staying long enough to be wrong in
public and repair it.
