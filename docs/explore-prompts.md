# Explore prompts

A note may publish an optional `explorePrompt`: a portable prompt that helps
a reader, their agent, or future me apply and extend the note in a different
context. It renders as the "Explore this note with AI" block and is present
in both HTML and negotiated Markdown -- see `docs/agent-discovery.md`.

An `explorePrompt` is not the prompt that produced the note, a reconstruction
of the editorial history, a compressed summary, or an instruction to
reproduce the note's prose. It is the shortest useful route to a **sibling
instantiation**, written after the note is finished.

## Post-hoc generation

The note must be editorially complete before prompt derivation begins.
Starting with the prompt would constrain what the note is allowed to
discover.

```text
finished note -> prompt candidate -> clean-context sibling check -> published explorePrompt
```

## Required inputs

- the final note body, front matter, and lifecycle;
- directly related notes and projects.

Originating conversations, drafts, and review comments may be consulted to
identify load-bearing constraints, but must not be copied into the prompt as
provenance.

## What the prompt must carry

1. **Transferable question** -- the general problem, broader than the note's
   title but narrower than its whole subject area.
2. **Worked instantiation** -- the note's material conclusion and the
   constraints that actually affected it. Omit incidental biography, dead
   ends, and private context.
3. **Extension move** -- an instruction to apply the question to the
   reader's context, identify where it differs from the worked
   instantiation, determine which conclusions survive, and challenge rather
   than restate the note. This is load-bearing; without it the default
   output is another summary.
4. **Expected output** -- the useful shape: a mapping, decision, design,
   reading path, implementation slice, risk analysis, or experiment.

A published prompt should be self-contained when copied away from the page,
carry the note's conclusion (not just its question), include an explicit
divergence check, invite evidence-based disagreement, avoid unresolved
references ("my system," "as discussed above"), avoid imitating the note's
voice, avoid claiming to reconstruct how the note was written, and normally
run 120-220 words.

Store it as one folded YAML string in front matter:

```yaml
explorePrompt: >-
  Use this note as a worked instantiation...
```

Do not split it into question, context, and instruction fields -- those are
generation concepts, not independent editorial records.

## Sibling validation

Run the candidate in a clean context with a materially different but
relevant scenario.

A prompt passes when the result stays in the same problem class, separates
the note's constraints from the reader's, reaches a compatible conclusion
where constraints match, changes it where they diverge, and produces
something usable beyond a summary.

A prompt fails when the result merely summarizes the note, copies its prose
or structure, assumes unavailable private context, treats the conclusion as
universal, changes subject, or contradicts the note under equivalent
constraints without saying why.

The target is a sibling, not a clone. Do not tune a prompt until its output
resembles the original note -- that turns it into a reproduction recipe. If
isolated clean-context execution isn't available, run a rubric-based review
against the criteria above and say so.

## Lifecycle

Prompt authority follows note authority. For a non-current note, the prompt
must state that the note is superseded, archived, or disproven and point to
the declared successor or historical use -- never hand an agent old guidance
without disclosing that first. That is also why the page always places the
lifecycle notice before the "Explore with AI" block.

## Maintenance after revision

A semantic revision to the note requires prompt review. Cosmetic edits do
not. Do not bump `lastRevised` merely because `explorePrompt` metadata
changed -- only when the note itself receives a semantic revision.
