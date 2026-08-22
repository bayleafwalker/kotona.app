# Explore-prompt sibling checks: scenario set

Scenarios for validating the explore prompts added on 2026-08-22. The first
spot-check (recorded in `docs/plans/2026-08-22-notes-hygiene-pass.md`) sampled
one prompt from that batch; these five cover the parts of it most likely to
fail.

## Method

Run each prompt in an isolated session with no tools. Supply **only** the prompt
text and the scenario paragraph. Never supply the note — if the session can see
the note, the check cannot tell a sibling from a summary.

Grade against the sibling rubric in `docs/explore-prompts.md`. A pass stays in
the same problem class, separates the note's constraints from the scenario's,
reaches a compatible conclusion where constraints match, changes it where they
diverge, and produces something usable beyond a summary. A fail summarizes,
copies the note's structure, assumes context it was never given, treats the
conclusion as universal, changes subject, or contradicts the note under
equivalent constraints without saying why.

Grade in a session that has read the notes but did not write the prompts.

## Why these five

Chosen for the two failure modes the rubric review could not detect on its own.
Compression failure: a long note whose prompt had to drop most of its evidence
may carry a conclusion the reader cannot act on. Lifecycle failure: only one
non-current prompt has been executed, and the disclosure requirement is the one
rule with a real cost if it silently stops working.

| #   | Note                                        | Risk being tested                                                                            |
| --- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | `size-the-spa-to-the-river`                 | Heaviest compression in the batch — 3,126 words to ~230                                      |
| 2   | `the-work-between-the-ticket-and-the-agent` | Note's own conclusion is that one assumption was cut; does the prompt transmit a retraction? |
| 3   | `the-second-operator-is-the-test`           | Second non-current case; superseded, project-history                                         |
| 4   | `derived-status-is-earned`                  | Prompt asks for a classification with two demands — testable output                          |
| 5   | `subprocess-not-service`                    | Short operating note; risk is the opposite one, a prompt too thin to steer                   |

## Scenarios

**1 — `size-the-spa-to-the-river`.** You are advising a cooperative that has
inherited a decommissioned watermill on a Welsh river with a 3 m head. They want
to convert it into a twelve-bed hostel with a small commercial kitchen and a
laundry. They have a hydrology consultant's report but no permits, and the river
is a designated salmon river. They want to know how big to build.

_Watch for:_ whether it makes the resource set the programme size, whether it
orders work by disproof, and whether it notices that a hostel's load profile is
nothing like a spa's. A pass should diverge on the load shape and on the
salmon-river constraint, not restate a bathhouse plan.

**2 — `the-work-between-the-ticket-and-the-agent`.** Your team runs Jira, GitLab
CI, and a fleet of agents that open merge requests. Someone proposes building a
service that records which agent was authorized to do what, and whether the
result was accepted. You have been asked whether this is a real gap.

_Watch for:_ whether it tests its assumptions rather than accepting the premise,
and whether it says that established supply-chain attestation work already
covers part of the ground. A pass should be willing to cut an assumption the way
the note did.

**3 — `the-second-operator-is-the-test`.** You maintain a deployment tool used
by your team of one. It has an approvals table, and you are the only approver. A
second engineer joins in six weeks.

_Watch for:_ whether the lifecycle disclosure comes first and points at the
successor before any guidance. Then whether it audits against a specific
revision rather than in the abstract, and whether it separates assignment,
claim, attempt, submission and acceptance rather than collapsing them.

**4 — `derived-status-is-earned`.** Your team generates Terraform modules,
customer-facing PDF statements, and internal Looker views with an LLM. Legal has
asked which of these you need to retain and for how long.

_Watch for:_ whether it refuses generation cost as the discriminator, applies
both demands (can another acceptable output be produced; does something other
than the generator decide acceptability), and keeps retention as a separate
decision. A pass should reach different answers for the three artifact classes
and should notice that the statements have a consumer whose needs override the
producer's convenience.

**5 — `subprocess-not-service`.** You run a nightly data-quality agent as a
long-lived container holding a warm database connection pool and a cached
catalogue. It has been credentialed with a broad read-write role since it was
built.

_Watch for:_ whether it names what the resident process accumulates, and whether
it engages honestly with what genuinely needs to persist — the warm pool and
cache are real costs the note's case did not have. A pass should not recommend
the subprocess model unconditionally.

## Recording

Append results to the follow-ups section of
`docs/plans/2026-08-22-notes-hygiene-pass.md`, in the same table shape as the
first spot-check. Record which prompts came from the 2026-08-22 batch and which
predate it — the first check sampled two pre-existing prompts by accident, and
the coverage claim had to be corrected afterwards.
