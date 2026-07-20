---
title: A personal knowledge system that happens to render as a website
status: exploration
lifecycle: current
area: agent workflow
published: 2026-07-20
lastRevised: 2026-07-20
projects: []
relates:
  - why-i-publish-explore-prompts
  - derived-status-is-earned
  - the-application-is-the-assurance-kernel
  - where-the-assurance-questions-are-already-answered
  - the-embarrassment-is-mine
tags:
  - workflow
  - writing
  - software-architecture
  - agents
summary: Chronology is one projection of this site's notes, not the structure underneath them. The corpus is the artifact of record; pages, feeds, and prompts built from it are derived realizations that should stay regenerable rather than independently maintained.
explorePrompt: >-
  Use this note as a worked instantiation, not an answer to repeat. The
  transferable question: once a site's readership includes agents as well as
  people, which of its outputs should stay hand-maintained and which should
  become regenerated projections of a smaller authoritative corpus, and how
  do you tell the difference? This note's instantiation: a single-operator
  site treats each note's body, front matter, and declared relations as the
  artifact of record, and treats its rendered pages, feed, llms.txt, and
  per-note prompts as derived realizations regenerated from that corpus,
  using the same record/derived-realization distinction the site already
  applies to code. Apply the question to your own publishing or
  documentation surface -- team wiki, product docs, changelog, internal
  knowledge base -- and identify which of your currently hand-maintained
  artifacts (summaries, indexes, prompts, metadata) could instead be
  generated on demand, what would have to become more structured in your
  source material first, and where computed weighting would need real
  cross-linking density before it means anything. Distinguish established
  practice from this note's own synthesis and from its still-untested
  proposals before adopting any of it, and finish with which artifact you'd
  convert first and how you'd verify the regenerated version is acceptable.
draft: false
---

This site is not a set of pages I maintain. It's a small corpus of notes, front matter, and declared relations, and the pages are one rendering of that corpus among several -- the home page, RSS, the sitemap, `llms.txt`, and each note's `explorePrompt` are the others. None of them is supposed to hold information the notes and their metadata don't already have.

That's a narrower claim than "AI-native blogging," or any other name for a category of website. It isn't about a genre of site. It's about which object is authoritative and which objects are downstream of it -- and once agents became a real fraction of the readership, the honest answer stopped being obviously "the HTML page."

## Chronology is a rendering choice, not a structural fact

The notes index reads reverse-chronologically because that's what a blog template does, not because publication date is the axis that matters most. The corpus's actual structure is `relates`, `supersededBy`, `lifecycle`, `tags`, `area`, and revision history -- none of which are chronological. A note published a year ago that three later notes build on is structurally more central than one published yesterday that nothing points to yet. Recency and importance are different axes. Conflating them is a limitation of the presentation layer, not of the material underneath it.

## What's already established practice -- and this site already does it

Three things here are table stakes in 2026, not a differentiator, and worth being honest about the evidence for each.

**Markdown content negotiation.** This site's HTML responses negotiate to Markdown when a request prefers `text/markdown`. That mirrors what Cloudflare shipped as [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/), automatically converting HTML to Markdown on request. Measured savings vary a lot by page and methodology -- reports range from a 25% token reduction on plain testing to 80% on markup-heavy pages -- but the direction is consistent: agents that have to parse a page pay less for a Markdown version of it.

**`llms.txt`.** This site publishes one, generated at request time from the notes and projects collections rather than hand-written -- it's already a rendering, not a maintained file. That matters because the honest data on `llms.txt` is mixed: adoption reached [8.7% of the top 1,000 sites by June 2026](https://www.rankability.com/data/llms-txt-adoption/) and roughly [5.6% of the top 10,000](https://www.rankability.com/data/llms-txt-adoption/), an real but modest number, and one broad study found [97% of published files receive zero AI requests](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/) with [no measurable citation lift](https://seranking.com/blog/llms-txt/) across roughly 300,000 domains. Publishing one is still worth doing here because the actual consumers -- coding agents pointed at a URL on demand, not a search engine's crawler -- are close to this site's entire agent audience. It is not worth overselling as a growth lever.

**Content Signals in `robots.txt`.** This site's `robots.txt` already separates `search`, `ai-input`, and `ai-train` as distinct permissions (`ai-train=no, search=yes, ai-input=yes`), which is the emerging [Content Signals](https://contentsignals.org/) convention rather than a bespoke rule -- the same split a growing set of sites use to allow retrieval-time use while declining to be training data.

All three are conventions this site adopted because they're becoming standard, not because they're novel. The more interesting question is what's built the same way -- as a projection, not a maintained artifact -- that isn't yet standard anywhere.

## What's this site's synthesis, not the field's

Two things here don't have an established name elsewhere.

**`explorePrompt`.** Described in full in [Why I publish explore prompts](/notes/why-i-publish-explore-prompts/): a per-note prompt generated only after the note is editorially finished, validated against a sibling-not-clone standard, and bound to the note's lifecycle. Per-page agent instructions exist elsewhere in scattered forms; the post-hoc generation discipline and the lifecycle binding are local inventions, not an adopted spec.

**The synthesis page, done by hand.** [Where the assurance questions are already answered](/notes/where-the-assurance-questions-are-already-answered/) and [A field guide to assurance-managed AI development](/notes/a-field-guide-to-assurance-managed-ai-development/) already function as pages other notes defer to. [The application is the assurance kernel](/notes/the-application-is-the-assurance-kernel/) and [Derived status is earned](/notes/derived-status-is-earned/) both carry an inline update block that, in effect, tells a reader to treat those two pages as more current than the note they're reading. That's a canonical synthesis page. It's already working. It just doesn't have a name or a generation rule yet -- it's produced the same way the rest of this site's prose is, by noticing and writing it down.

## The connecting principle already published here

This site has already made the general argument for why derived artifacts should stay derived, about code rather than prose, in [Derived status is earned](/notes/derived-status-is-earned/): an artifact earns the right to be non-authoritative only when there's a durable generation process and an independent way to check the result: otherwise it has to remain the thing assurance attaches to. The same split applies directly here.

- **Artifact of record:** a note's body, its front matter, its declared relations, its lifecycle state.
- **Derived realizations:** the rendered page, the RSS entry, the `llms.txt` line, the `explorePrompt`, any future synthesis page or graph view.

Generative closure means enough survives in a note's front matter and body to regenerate any of those views acceptably. Verification closure means a human, or a documented check like the `explorePrompt` sibling test, can tell whether a regenerated view is acceptable without re-deriving it from scratch by eye every time.

The risk this framework exists to catch is the one it names elsewhere: something drifting into being hand-edited instead of regenerated -- an RSS description tuned by hand that stops matching the note, an `llms.txt` line left stale after a lifecycle change. This site avoids both today because they're already generated at request or build time from the notes collection. It hasn't yet had to answer the question for anything more structured than a list.

## Where it's still speculative

Two extensions are worth naming honestly as untested rather than as a roadmap.

**A prescriptive entry point.** An `explorePrompt` says "start here, extend this" for one note. Nothing says it for the corpus as a whole -- a visitor gets chronology. A prescriptive layer would compute or declare which notes matter most and route a reader, human or agent, to those first. There are two ways to weight that: editorial (mark notes canonical by hand) or computed (link degree across `relates` and `supersededBy`). Computed weight is only meaningful if cross-linking is actually dense; several notes on this site currently have short or empty `relates` lists, which would make a degree-based ranking mostly noise today. The honest starting point is checking whether the graph is dense enough for degree to mean anything before writing the ranking algorithm.

**Relational structure beyond a flat list.** The schema already contains one typed edge: `supersededBy`, distinct from the untyped `relates` array. A network diagram, if built, would render that existing structure -- not create new truth, the same argument as everywhere else in this note, applied to a UI. Giving `relates` a light type (extends, contradicts, alongside the schema's already-separate supersedes) is a small, contained schema change. A graph visualization on top of it is a much larger rendering commitment for inputs -- weight and type -- that aren't settled yet.

The concrete risk isn't hypothetical here. [The application is the assurance kernel](/notes/the-application-is-the-assurance-kernel/) carries an update dated the day after it published, walking back its own central term once a later note repositioned it. A prescriptive layer built the same week would have routed a reader to the superseded framing for at least a day. A layer recomputed at build time from current lifecycle and relation data wouldn't have. That's the argument for weight as mostly derived and recomputed, with an editorial canonical flag as a rare override rather than the default mechanism -- and it's the same conclusion the "derived status" framing above predicts before you get there by a separate route.

## What this isn't

This isn't a claim that graph-based discovery is where personal technical publishing is heading -- no adoption evidence supports that the way it supports Markdown negotiation or `llms.txt`. It isn't an industry maturity model either; a progression from chronological to machine-readable to structurally-exposed is a device for organizing this note's own argument, not an observed grading scale other sites are placed on. And it isn't a plan to make the home page the point -- the point stays whatever a note argues; discovery surfaces exist to get a reader or an agent to the right note faster, not to become content themselves.

## The next decision

The sequence that actually follows from the argument above: name and formalize the synthesis-page pattern that's already working informally before building anything new; give `relates` an optional type if a second typed edge turns out to earn its schema change; and leave the network diagram and word cloud until there's enough `relates` density for either computed weight or a graph rendering to say something a flat list doesn't already say. Building the visualization first would mean rendering a graph that doesn't exist yet.
