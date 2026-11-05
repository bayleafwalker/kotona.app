# November note prompts: editorial sibling review

Reviewed on 5 November 2026 after the note bodies were complete. No isolated
clean-context model execution was performed. This records the rubric-based
fallback allowed by `docs/explore-prompts.md`, not a model-output experiment.

Each prompt carries its note's actual conclusion, the conditions that produced
it, an explicit divergence check and a usable output. The scenarios below are
review scenarios, not observations of another system.

| Note                                                    | Different review scenario                                                                            | Required transfer and divergence                                                                                                                                                     | Useful output                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| An idempotency key is not a business invariant          | Warehouse reservation retries after a lost response and a later cancellation                         | Separate request identity from the order's obligation; allow a safe same-operation retry when the target contract supports it; do not infer live state from absent evidence.         | Counterexample, enforcing control and replay assumptions.                 |
| A supported workflow includes its operating environment | A small rendering workflow using a private asset store and an intermittently connected laptop        | Include retained candidates, resource access and recovery; permit an ordinary local harness to win when the service costs more than it removes.                                      | Minimal composition and integrated interruption test.                     |
| What the subprocess was doing for free                  | A batch image-conversion tool gains a resident coordinator to amortize startup                       | Separate coordinator and worker lifetimes, enumerate retained state and credentials, and avoid assuming every local exit closes a remote request.                                    | Property/owner/test table and transition recovery.                        |
| The check has to fail first                             | A file validator accepts a valid baseline and must reject a corrupted input                          | Choose a negative control appropriate to the claim; do not require a valid unchanged baseline to fail or treat one rejected mutation as complete coverage.                           | Frozen check record, negative control and failed-discrimination response. |
| The fallback played the games                           | An offline speech recognizer falls back to a second engine during evaluation                         | Preserve the word-error outcome denominator while tracing which engine produced each segment; mixed participation may be the intended product and needs a separate attribution rule. | Producer table, predeclared reading and outage test.                      |
| The context window is not the continuity boundary       | An interrupted telescope-analysis job has private raw images and an unavailable original workstation | Reconstruct only authorized derived work; require retrievable candidate and calibration evidence or stop with the missing prerequisite. Do not demand raw-log release.               | Minimal packet and clean-host continuation test.                          |
| Subprocess, not service                                 | A short-lived export worker serves a persistent scheduling system                                    | State supersession first, use the old case historically and direct current design to the successor. Keep automatic routine authorization distinct from changing policy.              | Lifetime inventory with explicit replacement controls.                    |

The prompts ask for work in these different contexts rather than a summary or
imitation of the original note. Their requested conclusions change when the
destination permits harmless repetition, the baseline is already valid, mixed
fallback is the product, raw evidence cannot be released, or a local workflow
needs no managed composition. Structural coverage, length and uniqueness are
checked separately by the site's prompt validator.

## Corpus probe maintenance

The Worker test initially rejected the unchanged `discovery` query because its
probe expected zero results. The five new published notes increased the public
corpus from 75 to 80 documents; the term still appears in 12 bodies. The
unchanged 15% indexing rule therefore moved its integer inclusion ceiling from
11 to 12. The term is now indexed by the intended rule and returns 12 results.

The query is retained. Its expectation now bounds the result set at 15, matching
the existing nearby `protocol` boundary probe. The `server` and `commit` probes
still require zero results and exercise common-word exclusion. Ranking code and
frequency thresholds are unchanged. This is an explicit corpus-fixture update,
not a claim that the original empty result and the new result are equivalent.
