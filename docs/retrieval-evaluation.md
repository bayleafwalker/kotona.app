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
- state what the contract-first Box project cannot yet prove.

Each case checks retrieval rank and the evidence that must be present in the
public response. A failure means either discovery, retrieval language, lifecycle
signalling, or the expected evidence has drifted. Fix the public contract or
change the case with an explicit editorial reason; do not tune against hidden
source text.

This is a baseline, not a claim that lexical retrieval represents an agent. It
is deliberately local and deterministic so it runs behind the development
firewall and in CI. Model-assisted evaluations can be added later as a separate,
recorded strategy without weakening this floor.
