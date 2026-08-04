---
title: The wallpaper is a build artifact
role: project-history
status: guiding
lifecycle: current
area: creative tooling
published: 2026-08-03
lastRevised: 2026-08-04
projects: []
relates:
  - derived-status-is-earned
  - a-pipeline-without-a-successor-is-personal-tooling
  - a-personal-knowledge-system-that-happens-to-render-as-a-website
  - nfc-tokens-pointing-at-a-manifest
tags:
  - provenance
  - verification
  - reproducibility
  - creative-tooling
summary: A 48-second generated loop stays out of Git because ~21 MiB of tracked receipts prove ~2.2 GiB of untracked media. The harder lessons were about gates — their scope, how a ratio gets gamed, and an aggregate that hid three subsystems repeating exactly.
explorePrompt: >-
  Use this note as a worked instantiation, not a rule to adopt wholesale. The
  transferable question: when a large generated artifact cannot live in version
  control, what must the tracked files carry so authority over the artifact
  survives the exclusion? This instantiation is a generative video pipeline —
  48.000 s, 1152 frames, 960x412, seed 730021 — where about 21 MiB of source,
  receipts and dispositions stand in for about 2.2 GiB of media. Its
  conclusions: the receipt's per-artifact sha256 is what makes exclusion cost
  nothing verifiable; regeneration from a seed is reconstruction to be
  hash-checked, not an equivalent source; a gate must declare the artifact
  class it applies to, since the continuity limit that qualifies a lossless
  master is meaningless against lossy delivery encodes; a ratio gate can be
  passed by inflating its own denominator, so it needs an absolute quality
  measure beside it; and a whole-frame aggregate hid three subsystems repeating
  exactly. Apply the question to a large derived artifact you own — a trained
  model, a dataset snapshot, a built image. Name where your constraints diverge:
  nondeterministic production, unreplayable inputs, retention rules, consumers
  who need the bytes more than the contract. Say which conclusions survive.
  Produce the receipt schema and gate list you would enforce, including which
  artifact class each gate is valid for.
---

The video is not in Git. The hashes that prove it are. The Wizard Valley
World-Window repository tracks about 21 MiB across ~147 files — renderer source,
scene and mask definitions, layer manifests, receipts, dispositions, provenance
notes — and excludes about 2.2 GiB of video, frame sequences, source plates and
review crops. Every receipt records the sha256 of every artifact it describes, so
the tracked JSON proves the untracked bytes.

This is the concrete case behind an argument I made abstractly in
[Derived status is earned](/notes/derived-status-is-earned/): generation does not
make an artifact disposable, assurance does. The build in question is
`v3b-pipeline-001` — 48.000 seconds, 1152 frames, 960x412 at 24 fps, seed
`730021`, four motion systems, rendered from `scene-v3b-48s.json`. Authoring
coordinates are expressed against 3840x1648; the 960x412 proof is a downscaled
view of those coordinates, not an independent mask space.

Nothing has been promoted to a delivery selection. That fact survives to the end
of this note.

## Why the media is not tracked

Two independent reasons, either sufficient alone.

**LFS is disabled server-side.** The self-hosted Git service never starts its
LFS backend, so the LFS routes are not registered at all. Verified 2026-08-03:
the batch endpoint returns 404 even with a valid token and correct
`application/vnd.git-lfs+json` negotiation, while the REST API returns 200 and
`git ls-remote` succeeds. Both the HTTPS and SSH failures trace to that single
cause.

**Even enabled, this media would not belong there.** The backing volume is
sized for repository data and shared with it, in tens of gigabytes. One build is
~1.9 GiB; projected 3840x1648 masters reach 136-204 GiB.

The first attempt taught the sharper lesson. An LFS filter rule against a server
with LFS disabled **does not fail at commit time — it fails at push**, after the
object has already been written into `.git/lfs`. That is how the aborted import
produced a 1.9 GiB `.git/lfs` directory for a push that could never succeed.
`.gitattributes` now carries an explicit note that it has no LFS rules
deliberately, and the standing instruction is to reintroduce filter rules in the
same commit that starts tracking media, never before.

## Integrity without Git

Excluding media costs nothing verifiable, because the tracked files already
assert the untracked bytes:

- `receipt.json` per build — every encode and review artifact, with sha256;
- `master/frames.sha256` — a per-frame manifest, `sha256sum -c` compatible;
- `render-report.json` — renderer outputs.

Git LFS object IDs are themselves plain sha256, so the two schemes agree exactly.
That was verified rather than assumed: during the aborted import, the layered
master's LFS OID `79ce9b77...` matched the hash already committed in
`render-receipt-v2.json` verbatim. If media is migrated into LFS later, the OIDs
will equal hashes the repository has been asserting all along.

The master itself is an FFV1 level 3 gbrp intra-only file, 782,391,962 bytes,
with a decode round-trip recorded in the receipt: 1152 frames decoded, 32
compared, maximum absolute 8-bit delta 0.

## Regeneration is not equivalence

The tempting claim is that a seed makes the media disposable: delete it, re-run,
get it back. The repository refuses that framing. The render is deterministic in
seed, but the `frames/` sequences are designated **authoritative by the
receipts**, so regeneration is reconstruction to be hash-checked — not an
equivalent source.

The binding block shows why the weaker claim is the honest one. It records the
scene hash, the seed, per-file renderer source hashes, and `repo_commit`
`90fb35d` — alongside `repo_dirty: true`. And `environment_lock_sha256` is
`e3b0c442...`, which is the sha256 of empty input: the environment lock is a
declared field with nothing in it. Toolchain identity is the weakest link in this
chain today, and the receipt is at least honest enough to make that visible.

## Gates, and what a gate is valid for

The automated gates are real rejection mechanisms:

- **architecture lock**, now measured on every delivered frame — maximum absolute
  8-bit delta against frame 0, outside the permitted masks, limit 0, measured
  0.0. It replaces an earlier gate that checked frame 0 only;
- **keyframe census** — internal IDR frames per candidate;
- **envelope independence** — 0.007 against a limit of 0.8, testing whether two
  systems that both land on 10 cycles per loop had manufactured a shared
  envelope. Measured, they had not;
- **semantic change precision** and a **static holdout flow** check.

Then the interesting one. The legacy loop-continuity metric divided the wrap step
by `max(first_transition, last_transition)`. Those two samples have no privileged
statistical meaning: the same wrap on the same render scores **1.161** against
them, **1.057** against the median, **0.856** against q95, and **0.339** against
the maximum. That is denominator roulette, not measurement.

It was resolved by replacing the metric, not the limit. The replacement divides
the wrap step by the q99 of all 1151 interior transitions, nearest-rank so the
denominator is a value that actually occurs in the data: step ratio **0.782**,
acceleration ratio **0.847**, limit 1.10, pass. The legacy number is still
recorded and explicitly marked non-gating.

The part I would not have anticipated is that the limit needed a declared
**scope**. The FFV1 master and the lossless HEVC review target agree to 0.03
(0.782 against 0.809), so 1.10 is a master/source gate and the lossless target is
a faithful proxy for it. Every lossy delivery encode fails 1.10, because
compression noise at a cold IDR dominates the wrap step. Delivery encodes need
their own calibrated threshold and must not be judged against this one. A gate
with no declared artifact class is a gate that will eventually reject correct
work.

## Two ways the evidence tried to lie

**A ratio can be passed by inflating its denominator.** One encode candidate
applied x265 `q=14` zones over the 24 frames either side of the wrap. It does fix
the wrap — step ratio 1.085 against plain CRF 20's 4.858 — but it degrades the
rest of the loop, costs 115x the bitrate (88 MB against 764 KB), drops SSIM from
0.992 to 0.948, and trips the keyframe census with 1152 internal IDRs. Part of
how it "passed" continuity was making ordinary motion noisier. That is why every
candidate also records SSIM and VMAF: a ratio gate needs an absolute measure
beside it. Continuity ranking and quality ranking disagree in this data, and they
are different questions.

A first attempt at that encode used `crf=14`, which is not a valid x265 zone
option. x265 accepted the parameter string without complaint and did something
else — frames 0-23 came out five times worse than plain CRF 20, and the second
zone was ignored outright. That encode is deliberately retained so the failure
stays visible. An encoder that accepts a typo silently is the same class of
hazard as a mask that composites everywhere without erroring.

**An aggregate can hide a subsystem.** The whole-frame repeating-energy statistic
at T/2 read 0.14 — which parses as "barely repetitive". Measured per system at a
24-second offset: waterfall 3.4e-10, ripples 4.0e-10, orb exactly 0.0, steam
2.0e-3. Every declared cycle count is even, so their gcd is 2, and three of the
four systems return to phase and repeat **exactly** at 24 seconds inside a
48-second loop. Only packetized steam prevents whole-frame duplication — and
steam dominates the frame-wide mean, which is precisely why the aggregate could
not see it. A whole-frame statistic cannot see a single system.

Disposition: acceptable for a pipeline proof, not for final temporal variety, and
explicitly **do not retune this build** — preserving already-approved motion rates
was the point of choosing 48 seconds as exactly twice the reviewed 24-second
proof. A final 120-180 second piece requires either a cycle-count gcd of 1 among
perceptually significant systems, or dominant long-period stochastic systems that
measurably prevent the shorter repetition.

## The gates do not say it is good

An earlier build, `v3a-proof-001`, passed every automated gate and then failed
human motion review. It remains immutable in the tree with that disposition
recorded.

`v3b-pipeline-001` passed its human gate on 2026-08-03 — "complete scene remains
calm, no visible hard wrap, accepted motion behavior is retained" — and still
nothing is promoted. Three of the four remaining pipeline gates are closed;
selected-delivery post-encode review is open, because it requires a human
selection first. Seven encode candidates exist, each derived from the master and
never from another delivery encode, and none of them is a delivery selection.

## The resulting boundary

```text
tracked (~21 MiB):    renderer source, scene and mask definitions,
                      receipts, dispositions, frame manifests, specs
untracked (~2.2 GiB): masters, delivery encodes, frame sequences,
                      plates, review crops
bridge:               per-artifact sha256 in the receipt
authority:            gates reject broken output within a declared
                      artifact class; a human promotes a candidate
```

The rule generalizes past video: an artifact can be excluded from version control
exactly to the extent the tracked files can prove which bytes were meant. Both
halves of the usual reproducibility story are weaker here than they sound —
regeneration is reconstruction until it is hash-checked, and the environment lock
is still empty — but the assertion survives, because a hash of a thing you no
longer have is still a claim someone else can falsify.

Wizard Valley stays a note rather than a project page. One pipeline proof with
nothing promoted is not a continuing operated capability, and a project page is
supposed to describe a bounded effort with current verified state — not an idea
that has acquired a good diagram.
