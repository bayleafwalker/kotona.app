# Agent discovery

kotona.app is a public, read-only publication site. Agent discovery should make
that material easier to find and consume; it should not manufacture an API or
authentication surface that does not exist.

## Published from this repository

- Homepage `Link` headers advertise the skills index, `llms.txt`, and RSS.
- `/.well-known/agent-skills/index.json` points to a small, integrity-pinned
  guide for navigating the site's public material.
- `/llms.txt` provides a compact map of the site's primary content surfaces.
- HTML responses negotiate to Markdown when the request accepts
  `text/markdown`. HTML remains the default.
- `robots.txt` allows search and AI input, while declining AI training:
  `ai-train=no, search=yes, ai-input=yes`.
- Former `/writing/` URLs with observed agent demand permanently redirect to
  their published `/notes/` equivalents. The requested articles are retained as
  archival notes rather than redirected to a generic index.

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
agent protocol endpoint. Then publish a record for the hostname that serves
that endpoint (for the current public host, likely under
`_agents.www.kotona.app`), using the protocol's current DNS-AID profile and
its required `alpn`, endpoint, and experimental numeric SvcParamKey fields.
Enable DNSSEC in Cloudflare, verify the DS record at the registrar, then verify
with a validating resolver before announcing the endpoint.
