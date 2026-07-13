# Writing style

Write from the problem outward. State the conclusion, decision, or action first;
then earn any additional detail with evidence, consequences, or a real trade-off.

Use a direct, analytical, purpose-led voice. Prefer concrete claims over
ceremonial openings, generic praise, and corporate padding. A concise note is
better than a complete-looking note that says nothing.

## Structure

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
- Does each mechanism earn its complexity?
- Are intentional exclusions and remaining uncertainty visible?
- Is there evidence for current-state claims?
- Have rough dictation, ambiguity, and filler been removed without sanding off
  deliberate bluntness?

For technical notes, be implementation-facing and candid. For project pages,
explain the operating model and what is currently true. Do not make the site
sound like a product launch. It is a record of work and reasoning, not a
conversion funnel.
