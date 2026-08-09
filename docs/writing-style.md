# Writing style

Write from the problem outward. The note's frontmatter `role` selects its
register; do not use the same polished thesis-essay form for every kind of
knowledge. `status` says how strongly the note is claimed, while `lifecycle`
says whether it remains current. They are separate from role.

## Metadata: area and tags

`area` is the controlled, reader-facing primary kind of work or reasoning a
note demonstrates. It is not the note's editorial domain, a technology label,
or a bag of topics. Choose the single area that best helps a reader understand
the note's primary work; use `tags` for narrower technologies, contexts,
subjects, and secondary concerns. The permitted values live in
`src/data/knowledge-areas.ts`; add one only when it names a stable distinction
that more than one note can use.

The atlas derives spatial domain placement from its reviewed cluster rules.
Do not change an `area` merely to move a note on the map.

Use operationally grounded analytical prose. Write as a practitioner reasoning
from a real system, decision, experiment, or failure. Start with the person,
system, event, decision, or failed check that gives the reader something
concrete to hold. State material assumptions and starting conditions plainly.
When two concepts need separating, show what the distinction changes in a
test, decision, implementation, storage choice, publication choice, or recovery
path.

Prefer named actors and active verbs. Say that CI rejects a release, an owner
accepts an exception, or a database stores a record. Use terms such as
authority, state, evidence, boundary, capability, and artifact when the concept
itself matters, not because they belong to the site's vocabulary. Preserve
details that establish contact with reality: dates, commands, counts, awkward
exceptions, failed assumptions, and recovery behaviour.

Allow variation in cadence and confidence. First person is appropriate when
the evidence comes from personal operation, judgment, or uncertainty. Keep a
personal motive when it materially changed the decision. One strong sentence
may carry a section; the surrounding sentences should explain it rather than
compete with it. Dry humour is welcome when it punctures false grandeur or
clarifies a contradiction.

Extract reusable guidance only after the case supports it. Preserve
counterexamples, inconvenient residuals, and questions the evidence has not
settled. Prefer concrete claims over ceremonial openings, generic praise, and
corporate padding. A concise note is better than a complete-looking note that
says nothing.

## Roles and registers

### Operating

Use for current rules and reference designs. Be terse and procedural: rule,
why it exists, scope, implementation, validation, then failure or rollback.
Avoid a conceptual lead-in when the useful reader action is already known.

### Synthesis

Use to map a question across observations or established material. Be
corrective without becoming impersonal: question, relevant cases or evidence,
useful distinction, corrections, open edge, and practical consequence. Do not
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
- Keep a distinction only when it changes what gets tested, who decides, where
  something is stored, whether publication is appropriate, whether rollback is
  possible, or which option should be chosen.
- Preserve qualifiers such as _probably_, _only if_, and _not yet_ when they
  carry real uncertainty. Do not polish a conditional claim into impersonal
  certainty.
- Prefer an ordinary explanation over an "X is not Y; it is Z" construction
  unless the contrast genuinely corrects the reader's model.

## General structure

- Use responsibilities, boundaries, artifacts, states, interfaces, phases, and
  failure modes as review lenses, not required surface vocabulary. Name the
  owner, database, test, command, or service when that is clearer.
- Make material assumptions explicit, then proceed. Do not turn minor ambiguity
  into a clarification ritual.
- A useful default rhythm is observation, assumption, correction, mechanism,
  consequence, and limit. Use only the moves the note needs, and do not turn
  this sequence into another mandatory outline.
- Present at most four credible options. Recommend one when the evidence is
  sufficient, including its cost and failure case.
- End in the form the role needs: an operating note may need a validation or
  rollback path; a synthesis may end with the implication; an exploration may
  leave an open question; project history may end with the fact that changed the
  decision. Stop when the argument is complete.

## Editorial checks

Before publishing, ask:

- Does the opening state the actual point?
- Does it introduce a concrete object, actor, event, or example before relying
  on a cluster of abstract nouns?
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
- Has a contrast or polished principle earned its place, rather than carrying
  the paragraph by default?
- Does a paragraph contain several conceptual nouns but no concrete referent?
- Has a local observation been promoted into a universal rule without enough
  evidence?
- Is a coined term introduced before the experience or mechanism it names?
- Do several sentences or section endings sound as though they are auditioning
  to be quoted?

## Editing instruction

Edit toward the author's practitioner voice. Treat raw reasoning as the
primary source and published notes as secondary calibration, not as prose to
imitate. Preserve stated assumptions, conditional reasoning, concrete actors
and states, personal motive, counterexamples, useful uncertainty, and dry
deflation. Do not rewrite unaffected passages merely to make the voice
uniform.

Revise passages that accumulate abstract nouns without a concrete referent,
turn a local observation into a law, introduce a term before its case, restate
the preceding sentence more elegantly, or make every paragraph end like a
maxim. Treat words such as _authority_, _artifact_, _capability_, _surface_,
_bounded_, _load-bearing_, _explicit_, _defensible_, and _tractable_ as precise
tools, not house decorations. Prefer actor and verb: "CI blocks the release,"
"the domain owner accepts the exception," or "the old pod remains ready."

Use at most one deliberately aphoristic sentence per section. This is a
ceiling, not a quota.

## Calibration notes

Before drafting or substantially revising a note, read the closest example
below. These are positive examples of the site's intended range, not structures
to copy sentence by sentence.

- **Operating:**
  [`the-coordinator-never-touches-the-repo.md`](../src/content/notes/the-coordinator-never-touches-the-repo.md)
  grounds a strict rule in an actual dispatch workflow.
- **Operating:**
  [`the-target-state-is-not-the-plan.md`](../src/content/notes/the-target-state-is-not-the-plan.md)
  shows how a broad planning rule can alternate between plain explanation,
  examples, tables, and checks.
- **Synthesis:**
  [`a-reference-architecture-is-a-hypothesis-library.md`](../src/content/notes/a-reference-architecture-is-a-hypothesis-library.md)
  introduces an abstract architecture argument through a familiar misuse and
  then earns its vocabulary.
- **Synthesis:**
  [`a-field-guide-to-assurance-managed-ai-development.md`](../src/content/notes/a-field-guide-to-assurance-managed-ai-development.md)
  organizes dense source material around questions a practitioner can ask.
- **Exploration:**
  [`the-recommendation-does-not-need-authority.md`](../src/content/notes/the-recommendation-does-not-need-authority.md)
  starts with recognizable enterprise work before testing a larger automation
  claim.
- **Project history:**
  [`the-candidate-passed-the-upgrade-did-not.md`](../src/content/notes/the-candidate-passed-the-upgrade-did-not.md)
  lets chronology, timings, and the failed transition carry the lesson.
- **Project history:**
  [`moving-a-live-cluster-to-a-new-subnet.md`](../src/content/notes/moving-a-live-cluster-to-a-new-subnet.md)
  keeps the topology, ordering constraint, and awkward exception in view
  without inflating the work.
- **Exploration:**
  [`the-workshop-is-learning-my-accent.md`](../src/content/notes/the-workshop-is-learning-my-accent.md)
  retains first person, motive, ambivalence, and humour without forcing the
  tension into a verdict.
- **Exploration:**
  [`the-aftertaste-of-resolution.md`](../src/content/notes/the-aftertaste-of-resolution.md)
  earns a coined term through a recognizable experience and concrete examples.

[`the-embarrassment-is-mine.md`](../src/content/notes/the-embarrassment-is-mine.md)
contains useful self-critique and strong individual lines, but it is also a
caution against copying the site's most abstract register as a default voice.

Do not revise an older note merely to make it resemble these examples. Apply
the current guide when its claim, evidence, lifecycle, or practical advice is
substantively touched; otherwise preserve the public record.

When adding notes to the knowledge map, review the title, summary, and opening
together. Read the title and summary without local context, as they will appear
in a map node, search result, feed, or agent retrieval result. If they do not
name the subject and useful consequence, correct them as part of that
substantive map pass while keeping the existing slug stable where possible.

For technical notes, be implementation-facing and candid. For project pages,
explain the operating model and what is currently true. Do not make the site
sound like a product launch. It is a record of work and reasoning, not a
conversion funnel.

## Publication process

1. Select the storage tier before committing. Public-repository history is a
   publication surface; `draft: true` changes rendering, not visibility.
2. Finish and review the note.
3. Declare the role, then confirm claim posture, lifecycle, evidence, and
   publishability. Sanitization is not sufficient when the remaining domain,
   mechanism, timing, and attribution are still recognizable.
4. Derive the transferable `explorePrompt` from the final note (see
   `docs/explore-prompts.md`) -- never before the note is complete.
5. Validate that the prompt produces a sibling rather than a summary or
   clone.
6. Publish.

Use the private `kotona-notes-private` repository for non-public editorial work
that is safe for GitHub custody. Use the private Forgejo or Obsidian tier for
information-private material. Promotion is a separately reviewed copy, never an
automatic synchronization from either private tier.

When reviewing a prompt, ask whether it carries the note's actual
conclusion, names the material constraints that produced it, and asks the
next agent to test where those constraints diverge from their own.
