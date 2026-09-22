---
title: Every stratum has its own null
role: exploration
status: exploration
lifecycle: current
area: data architecture
published: 2026-09-22
lastRevised: 2026-09-22
projects: []
relates:
  - schema-on-split
draft: false
tags:
  - data-modeling
  - interfaces
  - "null"
summary:
  A missing report, an empty field, an unverified value, and an inapplicable
  reading need different actions even if a layered system displays them alike.
explorePrompt: >-
  Use this fictional meter-report pipeline as a worked example of how an empty
  representation acquires meaning at a boundary. Here, no record for an active
  meter means a delivery gap; spaces in a received record mean unanswered input;
  a SQL NULL with unverified state means a retained raw value has not passed
  validation; and a SQL NULL with retired state means no report is due. Those
  conditions require different operator actions. Preserve the distinctions until
  the next decision no longer needs them. An API omission or a shared console
  dash can erase them after storage got them right. In a layered system you
  know, trace one field from source to display. Identify each contract, who
  assigns its meaning, and the first point where two states collapse. Test
  whether that collapse changes an alert, calculation, eligibility check, or
  recovery action. Challenge this model where downstream actions are genuinely
  identical or extra state causes more errors. Produce a compact state-to-action
  table and one fixture test that would catch a harmful collapse.
---

In a toy meter-report game, an operator sends one fixed-width reading per active
meter each day. A parser stores the reports, an API serves them, and a console
shows the result. The game is invented, but the boundary problem is familiar:
each layer has a convenient way to say nothing, and those ways do not
necessarily mean the same thing.

**Working model.** An empty representation only becomes a useful fact when its
layer and contract are known. Before translating it, ask what happened and what
the next person should do.

| What the layer shows                      | What happened in this toy contract                                      | Next action                                     |
| ----------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| No input record for an active meter       | The report never arrived.                                               | Check delivery before asking about the reading. |
| A record with spaces in the reading field | The report arrived, but its sender left the field unanswered.           | Return the report for completion.               |
| A stored `NULL` with `state = unverified` | A raw value arrived, but verification has not accepted it as a reading. | Hold billing and check the retained raw value.  |
| A stored `NULL` with `state = retired`    | The meter is no longer expected to report.                              | Exclude it from the daily chase.                |

The last two rows deliberately share a SQL `NULL`. The accompanying state makes
the reason legible. SQL alone cannot tell the operator whether to investigate or
leave the meter alone. An API that omits the reading property or a console that
prints `—` for every row can lose the distinction again. The consumer then has
to guess from absence, or treat a retired meter as a late one.

This is where the apparently fussy distinction pays rent. A nightly check should
count missing reports for active meters, not all rows without a numeric value. A
bill should wait for verification, not turn an unanswered field into zero. The
boundary can collapse states only after the consuming decision no longer needs
them.

The model may be too elaborate for a system whose only operation is to ignore
non-numeric readings. I have not implemented this toy pipeline. The next test is
four fixture rows, one for each condition, passed through the parser, API, and
console. If each still produces the intended operator action, the distinctions
survived. If the UI shows four identical dashes and offers one action, the loss
has merely moved to the last layer.
