# External retrieval evaluation

This measures a different thing from `npm run test:retrieval`. The internal
evaluation asks whether this site selects the right reference from its own
corpus. This one asks whether an outside system, given only the public web,
finds this site at all and then chooses the right document from it.

```text
Internal retrieval   Does the site itself select the right reference?
External visibility  Given only the public web, does an outside system find
                     this site and choose the right reference from it?
```

Both can fail independently, and the failures have different remedies. A miss
here is usually a source-authority problem, not a retrieval-protocol problem,
and it is not fixed by publishing another machine surface.

## Status

The instrument is frozen; no run has been recorded yet. The questions live in
[`external-retrieval-questions.json`](external-retrieval-questions.json): 18
questions across six categories, each naming the documents that would count as a
correct answer.

## Why this is not a test

It never enters `npm run validate` and it has no exit code. It depends on
external systems, on time, and on the indexing state of the open web. A poor
result is a trend signal, not a defect, and treating it as a gate would
eventually mean tuning public writing to satisfy a scoreboard.

The frozen questions are the instrument. Do not rewrite a question because a run
went badly. If a question turns out to be malformed, retire it with a dated
reason and add a replacement, so the record stays comparable across runs.

## Categories, and what each is for

| Category                          | Asks                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `exact-distinctive-concept`       | Can a system find us when the reader already uses our words? |
| `paraphrased-distinctive-concept` | Does discovery survive the reader not knowing our words?     |
| `vague-domain-intent`             | Does curated reference scope carry an unfocused question?    |
| `current-versus-historical`       | Is lifecycle respected, in both directions?                  |
| `should-not-dominate`             | Do we correctly fail to displace established sources?        |
| `project-current-state`           | Is bounded project evidence reported as bounded?             |

The `should-not-dominate` questions are the ones that keep this honest. Without
them, a visibility evaluation drifts into an SEO benchmark where total recall is
mistaken for virtue. A personal site leading "What is GitOps?" would be a
symptom worth investigating, not a win to celebrate.

## Recording a run

One row per question per provider. Record the observation, not the
interpretation:

```text
question id
date
provider or retrieval system
site surfaced?          yes / no
rank or prominence      where observable
selected URL
correct document?       yes / no  (against `acceptable`)
lifecycle respected?    yes / no / not applicable
citation or link?       yes / no
notes                   verbatim quote where the answer misstates a claim
```

`lifecycle respected?` is judged against the question's `lifecycleExpectation`.
A right URL presented with the wrong authority is a failure: a superseded note
offered as current guidance is worse than not being found, because it
manufactures confidence.

Write each run to `docs/research/<date>-external-retrieval.md` with the
provider, the date, and the raw rows. Keep the rows even when they are
unflattering; a run that is only recorded when it looks good measures nothing.

## Reading the results

Do not optimize against individual misses. Look for the pattern across runs:

- Losing `exact-distinctive-concept` questions suggests an indexing or authority
  problem, not a content problem.
- Losing `paraphrased` while winning `exact` suggests vocabulary that only works
  if the reader already knows it.
- Losing `vague-domain-intent` to larger sources is the expected outcome for
  broad topics and is not by itself actionable.
- Failing `current-versus-historical` is the one worth acting on quickly,
  because it means published lifecycle signals are not surviving into answers.
- Winning a `should-not-dominate` question is a result to examine, not to
  celebrate.

The likely remedy for most misses is external: relevant public repositories
linking to the canonical explanation, other technical writing citing individual
notes, and consistent terminology where this site has something distinctive to
say. More protocol does not manufacture source authority.
