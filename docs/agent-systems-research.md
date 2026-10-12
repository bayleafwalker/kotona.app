# Maintaining the agent-systems assessment

The accepted baseline is
`src/content/notes/agent-systems-what-is-ready-to-rely-on.md` on `main`. Its
public reference is `/notes/agent-systems-what-is-ready-to-rely-on.md`. Read the
baseline and record its Git revision before researching a proposed change. An
unmerged branch, earlier chat, or generated report is not an accepted revision.

The companion `src/content/notes/where-agent-tooling-fits.md` owns the
responsibility map. Keep its product roles and verification dates separate from
the capability-readiness assessment. A readiness change does not automatically
change ownership, and a new adjacent feature does not reclassify a product.

## Research and publication

Friday discovery selects worthwhile new primary evidence. Sunday assessment
compares that evidence with the accepted note and proposes changes. Quarterly
maintenance rechecks the responsibility map and flags assessment records that
have gone more than 90 days without source review. These are research roles, not
three independent market reports.

The existing scheduled chats own delivery. This document defines their shared
editorial contract; it does not install a scheduler or permit repository writes.
Research runs propose edits only. Publication requires a separate review and an
explicit implementation request, followed by the repository's normal CI and
merge path. Do not auto-commit, auto-merge, or deploy from a research run.

Use the connected GitHub reader for the accepted source and revision. When that
is unavailable, use the public Markdown representation and report its available
revision metadata. If neither can be read, report the missing baseline and
return source findings only. Do not infer the current note from memory.

## Evidence discipline

Search primary sources directly even when a digest supplies useful leads.
[Agentic Engineering Weekly](https://agentic-engineering-weekly.jovaneyck.be/),
[Thoughtworks Technology Radar](https://www.thoughtworks.com/radar), and
[Latent Space](https://www.latent.space/) are discovery and comparison inputs,
not substitutes for checking a material claim at its original source.

Record publication or update dates when the source supplies them; otherwise
record the access date and mark the source undated. Prefer release tags,
versioned specifications, commit links, and reproducible reports over mutable
landing pages. Do not cite `/latest/` for a normative specification when an
appropriate versioned source exists. Mutable implementation documentation and
status trackers remain usable when their review date and purpose are explicit.

Distinguish specifications, maintainer documentation, vendor benchmarks,
independent operational evidence, and local experiments. A charter, meeting,
individual draft, adopted working-group draft, approval for publication, and
published RFC are different process states. Supporting organizations are not
necessarily deployed implementations; foundation hosting is not conformance
testing. Never turn a documented feature into an invented test result.

Classify the smallest useful capability, not a whole product. Keep maturity
(Commons, Edge, Art, Unassessed), confidence, and evidence type separate. A
missing implementation or failed lookup does not establish frontier status or
prove that no solution exists. Record conflicting evidence and limits.

For Commons, identify multiple independently maintained implementations that
cover the scoped operation, or explain the established standards ecosystem and
its maintained implementations and operating constraints. A single feature page
proves availability, not maturity; two announcements do not automatically prove
it either. Multiple implementations are not independent operational validation.
State the remaining validation gap rather than counting citations as votes.

Confidence measures support for the maturity judgment, not documentation
clarity. High needs convergent implementation and operational evidence relevant
to the claim. Documentation-led judgments with important validation gaps are
Medium; unresolved or conflicting support is Low. A confidence correction is not
a technology regression. Reuse the note's current definitions rather than
quietly applying a different rubric in a research run.

Compare like scopes. Do not require one transport to solve authorization,
acceptance, and recovery while assessing another on basic calls. Reuse can be
Commons while a stronger composed guarantee remains Edge or Unassessed. Name a
scope change explicitly instead of moving its boundaries to preserve a tier.
Keep containment of harmful actions separate from guaranteed instruction
isolation, and digest binding separate from freshness, authority, and replay
protection.

Check counterpositions that change the adoption decision, including cases where
an ordinary CLI or existing workflow is sufficient. Include agent authorization
standards, implemented protocol versions, untrusted-content defenses, and
supply-chain attestation mechanisms when they affect an existing record. This is
coverage guidance, not a quota for new records or investigations.

The note is the baseline to challenge, not evidence for its own claims. Trace a
changed factual claim to a primary source. Secondary repetition and the note's
previous wording cannot strengthen confidence by themselves. Do not publish
claims of uniqueness, market leadership, or industry-wide absence based on an
incomplete search.

## Edit proposal

For each material change, return this information in Markdown:

```text
Baseline: repository revision, note path, and read date
Record: AS-XX and stable anchor
Change: promotion | demotion | reversal | confidence | limitation | source | scope
Previous: exact current judgment or passage
Proposed: replacement passage and revised judgment, when applicable
Evidence: primary source, version/date, evidence type, and supported claim
Counterevidence: unresolved limits, contradictory results, or missing tests
Consequence: the build-versus-adopt or operating decision affected
Verification: which record was rechecked and on what date
History: proposed dated judgment-history entry for a material change
```

Return a minimal diff or exact replacement passages, not a rewritten article. No
material change means no publication change. A source-only correction must not
pretend to be a tier movement. Update only the verification dates actually
supported by the review. Do not refresh `lastRevised` for a routine no-change
check; advance it when the note's meaning changes.

A proposed investigation is optional: zero to two for the whole assessment, not
one per source. Each needs a live decision, an existing implementation as
baseline, a bounded time or cost budget, a pass/fail condition, and a stop rule.
Do not manufacture work to fill a weekly quota. Existing project retirements
remain binding; a similar new platform feature is not permission to reopen them.

## Publication checks and recovery

Keep private operational records, employer context, credentials, and private
research disposition registers out of this public repository, including draft
branches and pull requests. Publish only separately reviewed transferable
claims. Do not commit scheduler IDs, account state, or private task transcripts.

Use stable AS IDs and explicit anchors. Keep a concise visible judgment history
and preserve earlier wording through Git. Do not recycle an ID for another
capability. Replaced reasoning uses the site's existing lifecycle conventions.
The current Markdown schema and reference metadata are sufficient; no separate
readiness database, new service, or external-source ingestion pipeline is
needed.

After a semantic revision, review the note's `explorePrompt` against the final
body. Run `npm run validate`; ordinary CI also runs the browser gate. Check the
HTML note, Markdown reference, reference index, related-note discovery, and
anchor links after publication. A green CI run is not proof of a successful
production deployment. Structural source-link tests do not validate the truth of
the linked claims or the independence of their evidence.

For an incorrect published change, revert the content commit through the normal
review and CI path, then verify the public revision. Reverting content does not
revert scheduled-chat prompts; restore those separately if their contract
changed. Never rewrite public Git history to hide an earlier judgment.
