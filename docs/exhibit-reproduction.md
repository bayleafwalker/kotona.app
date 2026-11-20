# Reproduce an exhibit

Each exhibit note includes a recipe pinned to the source revision of the page.
The first check uses Git and Node 24.16 or later within Node 24, with no package
installation. `scripts/reproduce-exhibit.mjs` calls the same implementation
modules as the page and checks the committed fixture expectations.

| Exhibit             | Normal command suffix | Deliberate mutation       |
| ------------------- | --------------------- | ------------------------- |
| Three clocks        | `three-clocks`        | `--mutation wrong-parser` |
| Decimal Iron replay | `decimal-iron-replay` | `--mutation hide-beacon`  |
| Spa stress week     | `spa-week`            | `--mutation net-the-week` |

For example, from the pinned checkout:

```sh
node scripts/reproduce-exhibit.mjs three-clocks
node scripts/reproduce-exhibit.mjs three-clocks --mutation wrong-parser
```

The first command must exit 0. The second must exit 1 and name the corrected
computation whose expected EUR cents disagree. The mutation changes a copy in
memory; it does not edit the fixture, implementation, or independent expected
results. Exit 1 from a mutation must identify its intended disagreement. An
unknown exhibit or mutation exits 2. An escaped mutation or unexpected execution
error exits 3 and never prints a passing result. The reader can rerun the first
command without a reset or cleanup.

Decimal Iron's site command checks an exported trace and its displayed values.
The note separately provides a Python recipe at the upstream revision carried by
that trace. The upstream runner executes the payment reference and its harmful
mutations. Comparing its regenerated JSON against the published fixture is a
separate check; source digests alone do not establish that it ran.

The optional browser recipe installs the locked site dependencies, provisions
Chromium, builds the site, and checks the exhibit's controls and presentation.
The normal `validate` and browser CI gates continue to apply; the reader recipe
does not replace either gate.

`ReproduceExhibit.astro` renders the exact build revision and a prefilled email
link containing the note, revisions, case, expectation, observed result and
environment. The recipe is rendered as ordinary HTML so the same content is
preserved in the public Markdown representation. Browser checks verify both
representations and their pinned revisions.

Only a committed build's recipe identifies all of its source bytes. A local
preview with uncommitted changes still reports its parent Git revision, just
like the site's existing build metadata; do not publish or present that preview
as a reproducible release. Validate the final committed tree before deployment.
