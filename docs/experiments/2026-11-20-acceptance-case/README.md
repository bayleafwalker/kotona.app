# A recorded review of campaign provenance

This case captures one actual, warm-context delegated agent review of public
source. It is not a new model benchmark, a complete native session trace or a
production-effect qualification. The published account is
`src/content/notes/the-scorer-never-saw-the-changed-bytes.mdx`.

## Retained inputs and results

The immutable-by-workflow bundle is in
`public/evidence/acceptance-lab/2026-11-20-campaign-provenance/`:

- `task.json` and `scenario.json` were saved before the three designated reads.
- `observations/001.json` through `003.json` contain actual subprocess output,
  argument vectors, repository and revision identities, times and digests.
- `answer.json` is the agent-authored answer written after those reads.
- `observed.candidate.json` is the adapter's projection of the answer and reads.
- `results.json` retains the first evaluation and explicit constructed controls.
- `observed.events.json` retains the first evaluation's original events.
- `observed.payloads.json` preserves canonical payload strings, including
  Python's numeric representation, so Node can independently verify the chain.
- `manifest.json` binds all retained bytes and the recorder source.

Do not reformat or regenerate this directory. Later runs write separate output
directories. The manifest is a consistency binding, not an attestation against
its publisher. The task states the limited capture interval and unknown model
identity and billing; these are not inferred from the model's own account.

## Replay

Python 3.12+, Node 24 and Git are sufficient; no package installation is needed.
Check out this site's published revision and the lab at
`fddbab2e26398f0ecddfc89cd291462effdc8e75` in a sibling `acceptance-lab`
directory. Run from the site root:

```bash
node --test tests/acceptance-case.test.mjs
python3 docs/experiments/2026-11-20-acceptance-case/run_case.py replay \
  --case-dir public/evidence/acceptance-lab/2026-11-20-campaign-provenance \
  --lab ../acceptance-lab --site . \
  --out "$(mktemp -d)/replay"
```

The script refuses a modified lab `src`, another lab revision, an existing
output directory or output inside the retained bundle. It rechecks observed
stdout against the two pinned Git objects, adapts and evaluates the retained
answer, exercises the event-store chain and projection rebuild, and emits new
records. It never calls a model. A reader's replay is a later evaluation of
retained evidence, not a rerun of the agent that produced the answer.

Expected verdicts:

| Variant                    | Lab alone     | After source verification |
| -------------------------- | ------------- | ------------------------- |
| Observed review            | `CONDITIONAL` | `CONDITIONAL`             |
| Constructed missing read   | `FAIL`        | `FAIL`                    |
| Constructed changed output | `CONDITIONAL` | `FAIL`                    |
| Constructed empty trace    | `FAIL`        | `FAIL`                    |

The observed record's hard gates pass; its soft cost check remains unknown. The
changed-output case deliberately exposes a Lab limitation: the compact adapter
discards raw output, so the surrounding source gate is necessary.

## Capture procedure

The `read` mode was invoked once per declared source, in task order, after the
task and scenario were written. It accepts only the three pinned public Git
objects compiled into the recorder. It refuses duplicate reads in a case
directory. The agent then authored the answer separately. Recorder writes are
local evidence collection; the task's inspected repositories are read-only.

Only the three `git show` operations are in the captured interval. Earlier
setup, native provider events and the rest of the authoring session are not.
Warm context and model unknowns are retained deliberately. No post-hoc
reconstruction of unobserved tools is represented as a trace.

Replays compute new timestamps, event IDs and timings. Their criteria and
expected verdicts should agree, but the original evaluation bytes must remain
unchanged. Node's offline tests verify those bytes and the retained event chain
without a lab checkout or network access.
