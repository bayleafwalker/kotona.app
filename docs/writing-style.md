# Writing style

Write from the problem outward. The note's frontmatter `role` selects its
register; do not use the same polished thesis-essay form for every kind of
knowledge. `status` says how strongly the note is claimed, while `lifecycle`
says whether it remains current. They are separate from role.

Use a direct, analytical, purpose-led voice. Prefer concrete claims over
ceremonial openings, generic praise, and corporate padding. A concise note is
better than a complete-looking note that says nothing.

## Roles and registers

### Operating

Use for current rules and reference designs. Be terse and procedural: rule,
why it exists, scope, implementation, validation, then failure or rollback.
Avoid a conceptual lead-in when the useful reader action is already known.

### Synthesis

Use to map a question across observations or established material. Be formal
and corrective: question, existing disciplines or evidence, local mapping,
corrections, open edge, and a practical study or implementation path. Do not
claim novelty where the work is established elsewhere.

### Exploration

Use for a useful model that is not yet a settled rule. Show the trigger, mark
the opening **Working model**, explain why the model is useful, name where it
may fail, state evidence that could change it, and end with current confidence
or the next test. A compelling title is a retrieval handle, not proof that the
claim is a law.

### Project history

Use for incidents, decisions that have since changed, and historical project
context. Prefer concrete chronology: what happened, what was expected, what
was observed, the fix or decision, and the lesson or remaining uncertainty.
Keep dates, commands, counts, and inconvenient details when they establish the
record.

## Shared checks

- Ground the first use of a local abstraction in one concrete sentence. For
  example, define the actual records, actions, or people a term refers to.
- Put uncertainty where it does the most work: in the opening, an assumption,
  counterexample, missing evidence, or an unresolved question. Do not add a
  ceremonial caveat after every assertion.
- Let endings fit the role. A test result, rollback, unresolved question, or
  next action is often better than an aphorism.
- Once a paragraph makes a distinction, remove the next sentence if it only
  restates it more elegantly.

## General structure

- Describe systems through responsibilities, boundaries, artifacts, states,
  interfaces, phases, and failure modes.
- Make material assumptions explicit, then proceed. Do not turn minor ambiguity
  into a clarification ritual.
- Present at most four credible options. Recommend one when the evidence is
  sufficient, including its cost and failure case.
- End with a bounded implementation slice, verification, rollback path, or the
  next decision.

## Editorial checks

Before publishing, ask:

- Does the opening state the actual point?
- Does the opening and structure match the declared role?
- For an exploration, is the working model visibly provisional and testable?
- For an operating note, can a reader identify scope, validation, and failure
  handling without extracting an essay thesis?
- For a project-history note, is the contact with implementation visible?
- Does each mechanism earn its complexity?
- Are intentional exclusions and remaining uncertainty visible?
- Is there evidence for current-state claims?
- Have rough dictation, ambiguity, and filler been removed without sanding off
  deliberate bluntness?

For technical notes, be implementation-facing and candid. For project pages,
explain the operating model and what is currently true. Do not make the site
sound like a product launch. It is a record of work and reasoning, not a
conversion funnel.

## Publication process

1. Finish and review the note.
2. Declare the role, then confirm claim posture, lifecycle, and evidence.
3. Derive the transferable `explorePrompt` from the final note (see
   `docs/explore-prompts.md`) -- never before the note is complete.
4. Validate that the prompt produces a sibling rather than a summary or
   clone.
5. Publish.

When reviewing a prompt, ask whether it carries the note's actual
conclusion, names the material constraints that produced it, and asks the
next agent to test where those constraints diverge from their own.
