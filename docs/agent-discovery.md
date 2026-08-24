# Agent discovery

kotona.app is a public, read-only publication site. Agent discovery should make
that material easier to find and consume; it should not manufacture an API or
authentication surface that does not exist.

Slice 1 of that direction has landed: the reference catalog below is published
and advertised. The accepted next direction is the static reference protocol in
[`docs/architecture/reference-discovery.md`](architecture/reference-discovery.md).
Its ordered backlog lives in
[`docs/plans/reference-discovery.md`](plans/reference-discovery.md). The list
below describes the currently published behavior until those slices land.

## Published from this repository

- Homepage `Link` headers advertise the skills index, `llms.txt`, the reference
  catalog, and RSS.
- `/.well-known/agent-skills/index.json` points to a small, integrity-pinned
  guide for navigating the site's public material.
- `/llms.txt` provides a compact map of the site's primary content surfaces.
- `/reference-index.json` is the flattened reference catalog: one entry per
  published note or project, with public identity, classification, dates,
  representations, prompt availability, and declared reference scope where the
  document carries it. A note publishes `role`, `claimPosture`, and `lifecycle`;
  a project publishes `projectState` and is bounded by `dates.lastVerified`. The
  two are named separately because a note's status is a claim posture and a
  project's is a working state. The catalog is an allowlisted projection, so raw
  frontmatter, repository paths, and prompt text never appear in it, and
  `prompt.available` reports that a prompt exists without carrying its words. A
  superseded document also publishes its declared successors, because a client
  that retrieved the predecessor needs to know where current reasoning went.
  Each entry also declares how to fetch its representations: HTML and Markdown
  directly, plus negotiation on the canonical URL with the exact `Accept` value
  it needs, so the catalog is usable without site-specific knowledge.
  `knowledge.json` remains the separate topology and relationship surface.
- `/version.json` ties the deployed Worker to its source commit.
- `/notes/<slug>.md` and `/projects/<slug>.md` serve the Markdown reference
  representation of a published document: an allowlisted metadata prelude
  followed by the body. HTML remains canonical, and each Markdown resource says
  so with a `Link: rel="canonical"` header.
- `/notes/<slug>.prompt.txt` serves an exploration template when the published
  note has one. It returns `404` for a draft, unknown, or prompt-less note, and
  those cases are indistinguishable from each other.
- HTML responses negotiate to Markdown when the request prefers `text/markdown`.
  HTML remains the default when qualities tie. For notes and projects the
  negotiated bytes are identical to the `.md` resource: both come from one
  renderer rather than two implementations that agree.
- A note or project page advertises its own representations with `Link` headers:
  the Markdown alternate, the prompt alternate when one exists, and the
  reference catalog.
- `robots.txt` allows search and AI input, while declining AI training:
  `ai-train=no, search=yes, ai-input=yes`.
- Former `/writing/` URLs with observed agent demand permanently redirect to
  their published `/notes/` equivalents. The requested articles are retained as
  archival notes rather than redirected to a generic index.

Explore ranks results with the same deterministic module the retrieval
evaluation uses. Curated `reference.discoverFor` phrases carry the most weight,
current material leads for comparable relevance, a superseded document does not
lead its own successor, and explicit historical intent reverses that. Each
result states why it ranked where it did. The grouped index remains complete
without JavaScript.

Every note publishes a role, claim posture, and lifecycle. Role states whether
the document is operating guidance, synthesis, an exploration, or project
history; it is useful evidence about the register, not a ranking of truth. Treat
`superseded`, `archived`, and `disproven` notices as authority boundaries,
follow declared successors, and do not silently restate a non-current note as
present guidance.

Some notes also publish `explorePrompt`: a post-hoc "Explore this note with AI"
prompt for applying and extending the note elsewhere (see
`docs/explore-prompts.md`). It is not the note's original generating prompt or a
reconstruction of how the note was written, and it is not an independent surface
-- lifecycle remains authoritative over it. A superseded or disproven note's
prompt says so and points to the successor; do not treat a retrievable prompt as
evidence that the note is current.

The prompt is separated from the reference representation. HTML may show it in a
collapsed block, and `/notes/<slug>.prompt.txt` serves it deliberately with its
source, lifecycle, and site revision attached. Markdown reference bytes never
carry it, so an agent that retrieved a document as evidence does not also
receive portable task language mixed into that evidence.

## Intentionally not published

There is no API, protected resource, account system, OAuth/OIDC issuer, agent
registration flow, or MCP server. Therefore this site must not publish an API
catalog, OAuth/OIDC metadata, OAuth Protected Resource Metadata, `auth.md`, or
an MCP server card. Each of those is a service contract, not a discovery badge.

WebMCP is also not useful here. The site exposes documents and ordinary links,
not browser-mediated actions. A navigation tool would duplicate the browser
without adding a reliable capability.

Revisit these decisions only when the site gains a real endpoint or protected
action. Add the discovery document in the same change as that service and test
the advertised URL, authentication flow, and failure response.

## DNS-AID is zone configuration

DNS-AID cannot be delivered by this Worker. It requires records in the
authoritative `kotona.app` DNS zone and DNSSEC at the zone's delegation.

Do not add a DNS-AID record merely to satisfy a scanner. First deploy a real
agent protocol endpoint. Then publish a record for the hostname that serves that
endpoint (for the current public host, likely under `_agents.kotona.app`), using
the protocol's current DNS-AID profile and its required `alpn`, endpoint, and
experimental numeric SvcParamKey fields. Enable DNSSEC in Cloudflare, verify the
DS record at the registrar, then verify with a validating resolver before
announcing the endpoint.
