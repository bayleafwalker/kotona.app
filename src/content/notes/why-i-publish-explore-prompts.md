---
title: Why I publish explore prompts
role: operating
status: guiding
lifecycle: current
area: agent workflow
published: 2026-07-20
lastRevised: 2026-07-20
projects: []
relates:
  - the-aftertaste-of-resolution
  - the-embarrassment-is-mine
  - a-personal-knowledge-system-that-happens-to-render-as-a-website
tags:
  - workflow
  - writing
  - agents
  - llm
summary: A note explains what survived editing. An explorePrompt is a separate, deliberately post-hoc artifact that explains where the investigation should continue -- for a reader, their agent, or a later version of me.
explorePrompt: >-
  Use this note as a worked instantiation, not an answer to repeat. The
  transferable question: when you publish a finished piece of reasoning,
  should you also publish a machine-usable prompt for extending it, and if
  so, what should that prompt contain and when should it be written? This
  note's instantiation: a single-operator technical site generates one such
  prompt per note, only after the note reaches its editorially finished
  state, built from the final text and its declared relations, validated in
  a clean context against the standard of a sibling investigation rather
  than a summary or reproduction, and bound to the note's lifecycle so a
  superseded note's prompt discloses that before anything else. Apply the
  question to your own publishing context -- a team blog, a documentation
  set, product release notes, research writing -- and identify where your
  constraints diverge: multiple authors, readers who haven't read the
  source, content that changes after publication, or no reliable way to test
  sibling versus clone. Decide whether a comparable mechanism is warranted,
  what it should carry in your context, and how you would verify it produces
  extension rather than restatement before you publish it.
draft: false
---

A finished note explains what survived editing. It does not explain what I am least sure of, which adjacent question I set aside, or what would change my mind. That information is real and useful, and publishing only the note throws it away.

Most reader-facing "prompt" content does something close to the opposite. Copy this into your assistant and it will summarize the piece, argue for or against it, or turn it into a thread -- regenerate a shape of the same artifact. That's a reasonable feature for content meant to be consumed faster. It is not what I wanted for notes meant to be extended.

## The prompt is generated after the note, not with it

Every note published here can carry an `explorePrompt`: a short, portable prompt rendered as an "Explore this note with AI" block, present in both the HTML page and the negotiated Markdown version. The rule that makes it useful is when it gets written, not what it says. It is derived only after the note reaches its editorially finished state -- never during drafting, and never as a plan for what the note should argue.

```text
finished note -> prompt candidate -> clean-context sibling check -> published explorePrompt
```

Writing the prompt earlier would let it shape the note instead of report on it. A prompt written from a draft can only encode the draft's uncertainty, which is mostly noise: the paragraph that will get cut, the framing that will get replaced next revision. A prompt written from the finished note encodes something more durable -- the actual conclusion, and the specific constraints that produced it.

## It has to survive leaving the page

The bar I use is a sibling, not a summary or a clone. A working prompt names the transferable question underneath the note's specific case, states the note's real conclusion and what produced it, instructs the reader to apply the question to their own situation and say where it diverges, and describes what a useful output looks like -- a decision, a design, a risk analysis, not a paraphrase of my prose. I test candidates in a clean context against a scenario that shares the problem but not the constraints: it should stay in the same problem class, agree where the constraints match, disagree where they don't, and say why. A prompt that gets tuned until its output resembles my note has failed, even if the resemblance looks like fidelity -- that's a reproduction recipe, not an extension.

## What it isn't

It isn't a summary -- the note already exists for that. It isn't the chain of thought that produced the note -- provenance, drafts, and the conversations behind a piece are not the prompt's job, and copying them in would leak private context and false authority ("as discussed above," referring to a conversation the reader never had). And it isn't the correct interpretation -- it's one useful entry point among several a reader could construct for themselves, published because constructing it myself, after the fact, is cheap and the alternative is that nobody does it.

## The honest limitation

The prompt reflects what I currently think the note's open edges are, which means it inherits every blind spot I have about my own work -- the same limitation the note itself has, one layer up. It can go stale the way any editorial judgment can: a later revision, or a note that repositions this one, can leave an old prompt pointing at settled ground. That's why prompt authority follows note lifecycle rather than existing independently -- a superseded note's prompt says so, before anything else, and points to the successor.

None of that is a reason to withhold it. A prompt that might be locally wrong and says where to check is more useful than silence, and more honest than pretending the note is the only thing worth publishing about itself.

## Where this started

I was reading Marc Brooker's ["My blog and AI"](https://brooker.co.za/blog/2026/06/18/my-blog-and-ai.html) when one line stopped me:

> If I'm going to generate a doc from a prompt, then send it to somebody who summarizes it with an LLM and reads the summary, what have I achieved? I could have sent them the prompt, and let them explore the topic with their agent. A better use of their time!

He means that as a reductio -- a way of showing the generate-then-summarize round trip is absurd, not a proposal to actually publish prompts. I read it the other way: why not, alongside the note rather than instead of it?

It landed differently here than it would on most blogs because this site was already close to that register -- terse, repo-shaped, written with an agent as a plausible reader. A prompt block isn't a stylistic break on a site that already writes like this. On a prose blog it would be.

The distinction that keeps it from collapsing into a gimmick is the one the sections above are already arguing for a different reason: a prompt isn't a compression of the note, it's upstream of it. A summary says "this note concludes X." A prompt says "here's the question, the constraints, and what I believed going in -- go find out whether that holds where you are." That's closer to publishing provenance than publishing a TLDR. It shows what I brought to the note versus what got elaborated afterward, which is the same accounting [The paragraphs are cheap. The embarrassment is mine.](/notes/the-embarrassment-is-mine/) goes after from a different angle.

The obvious failure mode is a second field that quietly drifts from the note it sits above, the way a stale docstring drifts from the function underneath it. What keeps `explorePrompt` from doing that isn't the storage format, it's the two constraints from the sections above: generated after the note, checked against a sibling standard, never hand-tuned back toward the note's own prose. One field in front matter, one source of truth -- the page block and the negotiated Markdown version are both just readings of it, not separate copies to keep in sync.

There's a payoff that has nothing to do with readers, too. The prompt is roughly the context block I'd want to paste into a fresh session to pick a note back up in eight months: the live question, not the polished answer. Calling it a TLDR undersells that -- a TLDR compresses what the note says. This is closer to a stored git blame for the thinking that produced it, and I get to use it as much as anyone else's agent does.

Which is really the question that had to be settled before any of this was worth building: does the prompt exist to reproduce the note, or to extend it? Reproduction is the version that earns Brooker's actual complaint -- why not just read the note. Extension is the only version that justifies publishing it instead of keeping it in a private scratch file. The sibling-not-clone standard, the post-hoc timing, and the non-goals above aren't a separate set of rules from this question. They're that question, worked out in enough detail to hold.
