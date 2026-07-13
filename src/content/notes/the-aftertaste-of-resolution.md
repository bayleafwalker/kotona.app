---
title: The aftertaste of resolution
status: guiding
area: agent workflow
published: 2026-06-10
lastRevised: 2026-06-10
projects:
  - sprintctl-and-kctl
tags:
  - workflow
  - agents
  - llm
summary: Conversational refinement produces the feeling of having thought clearly, which is not the same thing as having thought clearly. The fix was not discipline. It was writing the stop rule into the counterpart.
---

Long LLM sessions have a characteristic failure mode. Each turn refines the previous one: the framing tightens, the prose improves, the open questions get folded in. Every step is locally an improvement, and the session ends with the distinct sense of having thought something through. I call it the aftertaste of resolution — the feeling of having thought clearly, minus the contact that would justify it.

The problem is not that the feeling is empty. The problem is that, from inside the session, it is indistinguishable from the real thing. The failure looks exactly like success. Worse, the feeling inoculates against returning to the question: a topic that feels resolved stops attracting attention, whether or not it earned the rest.

There are two regimes, and they invert. For cheap ideas — afternoon ideation, things that were never going to be load-bearing — feeling finished is the correct terminal state. The idea stops circling; that was the product. For load-bearing work, the feeling of resolution is the enemy, because it papers over exactly the gaps that only resistance would find. The rule that survived several attempts at stating it: if the idea matters, the session cannot be the last thing that happens to it. Something with friction has to come next — an implementation, a reviewer who argues back, a decision lived with. Chat is allowed to be the match. It is not allowed to also be the fire.

A rule like that is useless held in working memory, for the obvious structural reason: the moment it is needed is the moment everything feels finished. So I did what I do with agents and put it in the substrate instead. A standing instruction to the counterpart: when a session starts optimizing for feeling-finished over being-useful, name it and stop. No appeal to my judgment in the moment, which is the compromised component.

It fires. A handover-contract session ended not with a final polish but with the observation that the next version worth anything comes from resolving seven verify-items against the live repos, not another pass on the document. A review of this site's copy stopped at two edits, with the note that a third pass would start optimizing for sounding finished rather than being accurate. One deliberately open-ended session concluded that the only move that didn't extend the loop was closing the tab — and it was right.

Whether I would have caught those moments myself is secondary. That is what makes it infrastructure rather than virtue. The same instinct as everywhere else here: don't rely on the operator being sharp at the exact moment the system is rewarding dullness. Make the session slightly harder to misuse.

The honest limitation: a rule I wrote can only catch the failures I anticipated, and the stop signal still arrives through a channel I shaped. This is monitoring, not proof of substance. But the asymmetry beats the alternative. A session that ends with "stop, go test it against the repo" produces a worse feeling and a better week.

This post is, of course, itself a session output. It ships because the rule has receipts.
