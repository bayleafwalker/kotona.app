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
  `prompt.available` reports that a prompt exists without carrying its words.
  Each entry also declares how to fetch its representations: HTML directly, and
  Markdown today through content negotiation, with the exact `Accept` value a
  client needs, so the catalog is usable without site-specific knowledge.
  `knowledge.json` remains the separate topology and relationship surface.
- `/version.json` ties the deployed Worker to its source commit.
- HTML responses negotiate to Markdown when the request prefers `text/markdown`.
  HTML remains the default when qualities tie.
- `robots.txt` allows search and AI input, while declining AI training:
  `ai-train=no, search=yes, ai-input=yes`.
- Former `/writing/` URLs with observed agent demand permanently redirect to
  their published `/notes/` equivalents. The requested articles are retained as
  archival notes rather than redirected to a generic index.

Every note publishes a role, claim posture, and lifecycle. Role states whether
the document is operating guidance, synthesis, an exploration, or project
history; it is useful evidence about the register, not a ranking of truth. Treat
`superseded`, `archived`, and `disproven` notices as authority boundaries,
follow declared successors, and do not silently restate a non-current note as
present guidance.

Some notes also publish `explorePrompt`: a post-hoc "Explore this note with AI"
prompt for applying and extending the note elsewhere, currently present in both
HTML and negotiated Markdown (see `docs/explore-prompts.md`). It is not the
note's original generating prompt or a reconstruction of how the note was
written, and it is not an independent surface -- lifecycle remains authoritative
over it. A superseded or disproven note's prompt says so and points to the
successor; do not treat a retrievable prompt as evidence that the note is
current.

The accepted architecture changes that contract: default reference Markdown will
exclude the prompt, while a deliberately selected plain-text route will preserve
it with source and lifecycle context.

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
