# Public-corpus retrieval evaluation

The site claims to be useful working context for agents. That claim is checked
against the same public surfaces an external reader receives, not against
frontmatter or repository-only shortcuts.

`npm run test:retrieval` starts the built Worker locally, discovers project and
note URLs through `llms.txt`, requests each document through Markdown content
negotiation, and runs a deterministic BM25-style lexical baseline. The cases in
`tests/retrieval-cases.json` currently ask the corpus to:

- identify current project authority and its limitation;
- recover why shared Markdown stopped being sprint authority;
- prefer current GitOps project state over an archived incident note;
- retrieve that archived incident when history is explicitly requested; and
- state what the contract-first Box project cannot yet prove;
- select a useful document from vague intent, including agent handover,
  planning-document binding, workspace versus authority, verified migration
  state, and the evaluation of context-reduction tools;
- keep a current successor ahead of the note it replaced; and
- keep the exploration template out of the neutral reference representation
  while it stays retrievable on its own resource.

Each case checks retrieval rank and the evidence that must be present in the
public response. A failure means either discovery, retrieval language, lifecycle
signalling, or the expected evidence has drifted. Fix the public contract or
change the case with an explicit editorial reason; do not tune against hidden
source text.

This is a baseline, not a claim that lexical retrieval represents an agent. It
is deliberately local and deterministic so it runs behind the development
firewall and in CI. Model-assisted evaluations can be added later as a separate,
recorded strategy without weakening this floor.

That iteration has landed. The evaluation now builds its corpus from
`/reference-index.json` plus the public Markdown body of each document, and
ranks with `src/lib/reference-ranking.js` -- the same module the Explore page
loads, so the harness measures the ranking the site ships rather than a proxy
for it. Cases accept either an exact rank or an acceptable top-k set, because
vague intent has no single correct answer and demanding one would encode a claim
the corpus cannot support. `npm run test:retrieval -- "a question"` prints the
ranked top ten with match reasons, so a new case is written against observed
behaviour. The architecture and the ordered backlog are in
[`docs/architecture/reference-discovery.md`](architecture/reference-discovery.md)
and [`docs/plans/reference-discovery.md`](plans/reference-discovery.md).

This measures internal selection only. Whether an outside system finds this site
at all is a separate question with a separate instrument, in
[`docs/external-retrieval-evaluation.md`](external-retrieval-evaluation.md).
