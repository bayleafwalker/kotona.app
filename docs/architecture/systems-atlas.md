# Systems atlas

The systems atlas makes projects, tools, interfaces, execution environments, and
conceptual work navigable through the same public corpus as Explore. The map is
an authored architectural account. It does not discover private hosts, infer
deployment from repository presence, or report live health.

## Ownership and publication

`src/data/systems-atlas.ts` owns the public declarations: regions, system
identities, relationship meanings, conceptual proposals, and reading routes.
Existing notes and project records own their titles, summaries, lifecycle,
status, and evidence dates. `buildSystemsAtlas` resolves those references at
build time, and refuses missing or draft sources.

The HTML map, textual explorer, backlinks, and `/atlas.json` consume this
projection. `/knowledge.json` keeps its existing version and document-oriented
schema. The architecture endpoint has an independent `version: 1` because
services and execution places are different objects from notes and projects. The
endpoint carries public descriptions and links only; it is not a tool or an
instruction channel.

The repository's publication boundary applies to every atlas declaration.
Operational addresses, credentials, private manifests, and deployment
inventories do not belong here. A private source can inform a separately
reviewed public project account; this graph points to that public account.

## Object meanings

Keep a project, a logical service, and its deployment instances separate. The
initial projection names the documented Talos environment and PostgreSQL's
logical role without asserting where each application currently runs.

Nodes record three independent classifications:

- `stewardship`: built, operated, used, or explored. This describes the local
  relationship to a system, not authorship of third-party software.
- `lifecycle`: active, maintained, dormant, or retired. This is an editorial
  classification, never inferred from recent commits or a runtime probe.
- `maturity`: concept, scaffold, prototype, implemented, documented, or
  historical. Implementation refers to the scope described by the linked source;
  it does not establish deployment.

`basis.kind` distinguishes a source-backed account, a proposal, and historical
context. Its sentence states the claim boundary. Project verification dates are
resolved as `sources[].lastVerified`; note editing dates remain `lastRevised`.
Rebuilding or editing the map cannot renew either source date.

The Listening rooms, isolated-workspace, and local-inference records are
explicit concepts. Their presence does not create an installed client or
execution path. Acceptance Lab remains a separate prototype; there is no
fabricated technical integration with Vuoro.

## Relationships and interfaces

Each edge names a relationship rather than merely linking two matching tags.
`kind` separates technical, conceptual, and historical relationships. `state`
distinguishes documented, proposed, and historical scope. A documented
relationship needs a published source. A proposal may have related reading, but
cannot thereby become documented implementation.

Edges with interfaces explain purpose, caller, payload, outcome, and authority.
The Home Assistant bridge, for example, carries state into the household model
and approved actions back to the device runtime. A work result and a work
owner's acceptance remain separate at the Sprintctl boundary.

Conceptual lines can be valuable without any API call. Box's published record
describes its derivation from household-platform work. The game-evaluation and
media-record connections are explicitly authored comparisons, not claims that
those projects use each other's runtimes.

Retired nodes remain in their original region and appear only with history
enabled or through a historical route. Edges touching them must be historical.
Retirement, historical maturity, and historical basis must agree so a partial
metadata edit cannot quietly put the old cockpit back into the current map.

## Routes, backlinks, and layout

Routes are curated reading paths through declared nodes and relationships. They
can compare separate systems; they are not necessarily end-to-end execution
traces. Their summaries state that scope. Each route must contain the endpoints
of its displayed edges, and must opt into history if it names a retired node.

`getAtlasMentions` returns both nodes and edges citing an exact collection/id.
This lets a note link directly to the interface it explains, even when no node
cites that note. It does not infer mentions from similar words or tags.

Regions and node ordering give the UI its stable layout. Presentation can focus
a region or route without changing graph ownership. The narrow-screen explorer
and no-JavaScript links retain the same content and destinations.

## Validation and change procedure

Add a public record or explicitly mark a new proposal before drawing a
connection. Pick the smallest relationship type that conveys its actual meaning.
Add a route only when it answers a useful reader question.

The builder rejects duplicate IDs, missing regions/endpoints, missing or draft
sources, unsupported links, incomplete interfaces, proposals presented as
implementation, historical scope mismatches, and routes with missing context.
Unit tests mutate those declarations to verify the refusals. They also verify
that source dates survive a later editorial revision and that history does not
leak into the default projection.

Run the repository gates after changes:

```sh
npm run validate
npm run test:browser
```

Browser coverage verifies map selection, route and history behavior, deep links,
the mobile explorer, backlinks, and the source projection served by the
endpoint. For rollback, revert the atlas change as a unit: declarations,
projection, renderer, endpoint, and entry links. Existing project and note
records, and the original knowledge graph, keep their identities.
