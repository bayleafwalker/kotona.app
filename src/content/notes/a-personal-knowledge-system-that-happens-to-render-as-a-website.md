---
title: A personal knowledge system that happens to render as a website
role: synthesis
status: exploration
lifecycle: current
area: agent workflow
published: 2026-07-20
lastRevised: 2026-08-08
projects: []
relates:
  - why-i-publish-explore-prompts
  - derived-status-is-earned
  - the-agent-is-not-the-application
  - where-the-assurance-questions-are-already-answered
  - the-embarrassment-is-mine
tags:
  - workflow
  - writing
  - software-architecture
  - agents
summary:
  Chronology is one projection of this site's notes, not the structure
  underneath them. The corpus is the artifact of record; pages, feeds, and
  prompts built from it are derived realizations that should stay regenerable
  rather than independently maintained.
explorePrompt: >-
  Use this note as a worked instantiation, not an answer to repeat. The
  transferable question: once a site's readership includes agents as well as
  people, which of its outputs should stay hand-maintained and which should
  become regenerated projections of a smaller authoritative corpus, and how do
  you tell the difference? This note's instantiation: a single-operator site
  treats each note's body, front matter, and declared relations as the public
  artifact of record only after private evidence and session history have been
  extracted into candidate knowledge and passed a publishability review;
  rendered pages, feeds, llms.txt, per-note prompts, and a knowledge atlas are
  then regenerated from that corpus. Apply the question to your own publishing
  or documentation surface -- team wiki, product docs, changelog, internal
  knowledge base -- and identify which hand-maintained artifacts (summaries,
  indexes, prompts, metadata) could become generated projections, what would
  have to become more structured in the source first, and what must remain
  private even after sanitization. If you add relational discovery, state what
  its clusters and edges are allowed to claim, how lifecycle changes propagate,
  and how you will detect drift between the source corpus and its projections.
  Distinguish established practice from local synthesis and untested proposals,
  then finish with which artifact you would convert first and how you would
  verify publishability, regeneration, and reader utility.
draft: false
---

This site is not a set of pages I maintain. It's a small corpus of notes, front
matter, and declared relations, and the pages are one rendering of that corpus
among several -- the home page, RSS, the sitemap, `llms.txt`, and each note's
`explorePrompt` are the others. None of them is supposed to hold information the
notes and their metadata don't already have.

That's a narrower claim than "AI-native blogging," or any other name for a
category of website. It isn't about a genre of site. It's about which object is
authoritative and which objects are downstream of it -- and once agents became a
real fraction of the readership, the honest answer stopped being obviously "the
HTML page."

**Update, 2026-08-08.** The site now publishes a [knowledge atlas](/explore/)
and a generated [`knowledge.json`](/knowledge.json) graph endpoint. The atlas
does not use link degree to decide which notes are authoritative, and it does
not infer relationships from shared tags. Six reviewed clusters organise the
corpus; graph lines come only from relations already declared in content. That
implementation answers the concern in the original version of this note by
narrowing what the visualisation claims, not by pretending the original graph
was already mature.

## Chronology is a rendering choice, not a structural fact

The notes index reads reverse-chronologically because that view answers “what
changed recently,” not because publication date is the axis that matters most.
The atlas now supplies a thematic and relational view beside it. The corpus's
actual structure is `relates`, `supersededBy`, project membership, invalidation,
`lifecycle`, `tags`, `area`, and revision history. A note published a year ago
may still be the useful entry point for a current question. Recency, editorial
placement, and relation count remain different axes; the atlas does not collapse
them into one ranking.

## What's already established practice -- and this site already does it

Three things here are table stakes in 2026, not a differentiator, and worth
being honest about the evidence for each.

**Markdown content negotiation.** This site's HTML responses negotiate to
Markdown when a request prefers `text/markdown`. That mirrors what Cloudflare
shipped as
[Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/),
automatically converting HTML to Markdown on request. Measured savings vary a
lot by page and methodology -- reports range from a 25% token reduction on plain
testing to 80% on markup-heavy pages -- but the direction is consistent: agents
that have to parse a page pay less for a Markdown version of it.

**`llms.txt`.** This site publishes one, generated at request time from the
notes and projects collections rather than hand-written -- it's already a
rendering, not a maintained file. That matters because the honest data on
`llms.txt` is mixed: adoption reached
[8.7% of the top 1,000 sites by June 2026](https://www.rankability.com/data/llms-txt-adoption/)
and roughly
[5.6% of the top 10,000](https://www.rankability.com/data/llms-txt-adoption/), a
real but modest number, and one broad study found
[97% of published files receive zero AI requests](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/)
with [no measurable citation lift](https://seranking.com/blog/llms-txt/) across
roughly 300,000 domains. Publishing one is still worth doing here because the
actual consumers -- coding agents pointed at a URL on demand, not a search
engine's crawler -- are close to this site's entire agent audience. It is not
worth overselling as a growth lever.

**Content Signals in `robots.txt`.** This site's `robots.txt` already separates
`search`, `ai-input`, and `ai-train` as distinct permissions
(`ai-train=no, search=yes, ai-input=yes`), which is the emerging
[Content Signals](https://contentsignals.org/) convention rather than a bespoke
rule -- the same split a growing set of sites use to allow retrieval-time use
while declining to be training data.

All three are conventions this site adopted because they're becoming standard,
not because they're novel. The more interesting question is what's built the
same way -- as a projection, not a maintained artifact -- that isn't yet
standard anywhere.

## What's this site's synthesis, not the field's

Two things here don't have an established name elsewhere.

**`explorePrompt`.** Described in full in
[Why I publish explore prompts](/notes/why-i-publish-explore-prompts/): a
per-note prompt generated only after the note is editorially finished, validated
against a sibling-not-clone standard, and bound to the note's lifecycle.
Per-page agent instructions exist elsewhere in scattered forms; the post-hoc
generation discipline and the lifecycle binding are local inventions, not an
adopted spec.

**The synthesis page, done by hand.**
[Where the assurance questions are already answered](/notes/where-the-assurance-questions-are-already-answered/)
and
[A field guide to assurance-managed AI development](/notes/a-field-guide-to-assurance-managed-ai-development/)
already function as pages other notes defer to.
[The agent is not the application](/notes/the-agent-is-not-the-application/) and
[Derive status only from reproducible evidence](/notes/derived-status-is-earned/)
now carry the corrected application-level framing. That's a canonical synthesis
page. It's already working. It just doesn't have a name or a generation rule yet
-- it's produced the same way the rest of this site's prose is, by noticing and
writing it down.

## The connecting principle already published here

This site has already made the general argument for why derived artifacts should
stay derived, about code rather than prose, in
[Derive status only from reproducible evidence](/notes/derived-status-is-earned/):
an artifact earns the right to be non-authoritative only when there's a durable
generation process and an independent way to check the result: otherwise it has
to remain the thing assurance attaches to. The same split applies directly here.

- **Artifact of record:** a note's body, its front matter, its declared
  relations, its lifecycle state.
- **Derived realizations:** the rendered page, the RSS entry, the `llms.txt`
  line, the `explorePrompt`, the atlas, and the `knowledge.json` graph.

Generative closure means enough survives in a note's front matter and body to
regenerate any of those views acceptably. Verification closure means a human, or
a documented check like the `explorePrompt` sibling test, can tell whether a
regenerated view is acceptable without re-deriving it from scratch by eye every
time.

## Authority begins after the publication boundary

The artifact of record is authoritative for this public site, not for every
piece of knowledge that might inform it. Private evidence and session history
need a separate path into the corpus:

```text
private evidence and session history
        ↓ extraction
candidate knowledge
        ↓ publishability review
public authoritative corpus
        ↓ generation
pages, feeds, prompts, indexes
```

Sanitization is not the same as publishability. Names and numbers can be removed
while the combination of domain, mechanism, timing, and personal attribution
remains recognizable. Extraction asks whether the material contains a durable
claim. Publishability review asks a different question: whether that claim can
safely become part of the public authoritative corpus without exposing the
context that made it legible.

That distinction can require cutting a candidate rather than repeatedly sanding
it down. The mapping-document draft was the correct thing to leave out: removing
more identifiers would not have changed the recognizability of its combined
professional context, and removing that context would have removed the evidence
that made the note worth publishing.

The risk this framework exists to catch is the one it names elsewhere: something
drifting into being hand-edited instead of regenerated -- an RSS description
tuned by hand that stops matching the note, an `llms.txt` line left stale after
a lifecycle change, or a graph that retains a draft entry or stale lifecycle
state. The site now builds all of those from the collections. Tests require the
graph and the public corpus discovered through `llms.txt` to contain the same
documents, and lifecycle state is carried into the graph rather than maintained
in a second list.

## What the atlas changed

The first version of this note treated prescriptive entry points and graph
rendering as future choices. The implementation took a narrower path than either
proposal implied.

The home page keeps four reviewed starting points. The atlas groups every
published note and project into six reviewed editorial clusters. Neither surface
treats link degree as authority. That preserves the earlier objection: sparse
cross-linking cannot quietly turn a count into an editorial judgment.

The graph renders only existing relations: `relates`, project membership,
succession, and project invalidation. Shared tags can place an entry in a
reviewed cluster, but they cannot create a line between two entries. Historical
notes are hidden by default and remain available as an explicit layer. The
grouped textual index carries the same corpus when the visual map is unavailable
or unhelpful.

The former assurance-kernel framing remains the useful failure case. It needed
correction the day after publication once the trusted boundary was narrowed.
Because the atlas is rebuilt from current lifecycle and relation data, the old
framing can move out of the default view without a separate map edit. That is
the practical reason the graph belongs downstream of the corpus.

## What remains untested

The atlas is published, but that does not prove it helps readers. I do not yet
know whether people use it to find material they would miss in the chronological
index, whether the six clusters remain stable as the corpus grows, or whether a
new relation type will eventually justify its schema and visual cost. Those are
usage and maintenance questions, not reasons to infer more structure now.

## What this isn't

This isn't a claim that graph-based discovery is where personal technical
publishing is heading -- no adoption evidence supports that the way it supports
Markdown negotiation or `llms.txt`. It isn't an industry maturity model either;
a progression from chronological to machine-readable to structurally-exposed is
a device for organizing this note's own argument, not an observed grading scale
other sites are placed on. And it isn't a plan to make the home page the point
-- the point stays whatever a note argues; discovery surfaces exist to get a
reader or an agent to the right note faster, not to become content themselves.

## The next check

The next check is whether the clusters keep making editorial sense as notes are
added and whether readers use the atlas in practice. Any additional relation
type should name a distinction that changes navigation or lifecycle handling and
should earn the cost of a schema change, renderer rule, legend entry, and test.
Until then, the graph should continue to say only what the corpus already
declares.
