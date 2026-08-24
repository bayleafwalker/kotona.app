# Can the machine surfaces be measured?

Date: 2026-08-24  
Scope: a no-code, no-binding assessment of whether existing telemetry can answer
"are agents walking the discovery paths this site publishes?"  
Plan item:
[`docs/plans/reference-discovery.md`](../plans/reference-discovery.md),
post-deployment evaluation B.

## Workers Logs is already enabled

No configuration change or deploy is needed to turn stored Workers Logs on. The
deployed Worker reports:

```json
"observability": {
  "enabled": true,
  "head_sampling_rate": 1,
  "logs": { "enabled": true, "head_sampling_rate": 1, "persist": true, "invocation_logs": true },
  "traces": { "enabled": false }
}
```

`observability.enabled` has been in `wrangler.jsonc` since the first Worker
deployment configuration (2026-04-09) and the Worker has been redeployed under
it many times since, most recently with the reference-discovery release. Logs
are persisted, unsampled, and include invocation logs. `logpush` is `false`.

## Half the machine surfaces never reach the Worker

This is the finding that matters, and it is structural rather than a matter of
plan, price, or sampling rate.

Astro routes declaring `export const prerender = true`, and anything under
`public/`, are built as static assets and served by the Cloudflare assets
binding. Those requests do not invoke the Worker, so Workers Logs cannot observe
them at any sampling rate.

Measured by tailing production while issuing one labelled request per surface:

| Surface                                       | Served by                         | Worker invoked |
| --------------------------------------------- | --------------------------------- | -------------- |
| `/llms.txt`                                   | Worker (SSR route)                | yes            |
| `/notes/<slug>.md`, `/projects/<slug>.md`     | Worker (middleware)               | yes            |
| `/notes/<slug>.prompt.txt`                    | Worker (middleware)               | yes            |
| HTML pages, including `Accept: text/markdown` | Worker (middleware)               | yes            |
| `/reference-index.json`                       | static asset (`prerender = true`) | **no**         |
| `/knowledge.json`                             | static asset (`prerender = true`) | **no**         |
| `/.well-known/agent-skills/*`                 | static asset (`public/`)          | **no**         |

Seven labelled requests produced four Worker invocations. Repeating the three
missing ones with unique cache-busting query strings produced zero invocations,
so this is asset-layer serving rather than an edge cache hit on a previously
warmed path.

The catalog published in the reference-discovery release is on the invisible
side of that line, as is the skills index that `Link` headers advertise.

## The stored logs could not be read from here

`wrangler` has no stored-log query command; it offers real-time `tail` only. The
Observability telemetry API answers `403 Authentication error` for both
`/telemetry/keys` and `/telemetry/query` using the OAuth credential
`wrangler login` produces, while the same credential reads Worker settings
successfully. The data exists and is retained; reading it needs the dashboard
Query Builder or a token with the observability scope.

## What a 90-second tail did show

Two short real-time windows, which is far too small a sample to characterise
crawler behaviour and is reported only as an existence check:

- The tail path works and shows path, status, and user agent per invocation.
- Organic traffic in the windows was one scanner request to `/` identifying
  itself as a Palo Alto Networks scan. Everything else was this assessment's own
  labelled requests.

Real-time logs are not stored, so a tail window cannot answer the question. It
can only confirm the instrument works.

## Zone analytics covers what the Worker cannot

Zone-level GraphQL analytics observes every HTTP request Cloudflare handles,
including the static assets the Worker never sees. It was verified working from
this environment with the same `wrangler login` credential that the
observability API rejects:

- `httpRequestsAdaptiveGroups` supports grouping by `clientRequestPath` and
  `edgeResponseStatus` on this zone's Free plan.
- A query may span at most one day. A longer window is refused outright, so a
  multi-day reading is several queries, not one.
- The zone reports `Free Website`.

This needs no code change, no binding, and no deploy, and it is the only
instrument that can see `/reference-index.json`, `/knowledge.json`, and the
agent-skills index at all.

## First reading, and why it says almost nothing yet

Named machine surfaces over roughly 23.5 hours:

| Requests | Status   | Path                                   |
| -------- | -------- | -------------------------------------- |
| 11       | 200      | `/rss.xml`                             |
| 6 + 1    | 200, 304 | `/sitemap-index.xml`                   |
| 4        | 200      | `/notes/the-ref-nobody-adds.md`        |
| 4        | 200      | `/reference-index.json`                |
| 3        | 200      | `/knowledge.json`                      |
| 3        | 200      | `/llms.txt`                            |
| 2        | 200      | `/.well-known/agent-skills/index.json` |
| 1        | 200      | `/version.json`                        |

Nearly every row except the feed and the sitemap is this assessment's own
traffic: the probe requests issued while establishing which surfaces reach the
Worker. Read honestly, organic machine traffic in this window is RSS and sitemap
fetching, and the reference surfaces show no third-party consumption at all.
That is the expected result hours after publication, not a finding about demand.

Zone traffic overall was 1686 requests in the same window, dominated by ordinary
HTML pages.

## Decisions

**Worker logs are reference-consumption telemetry, not discovery traffic.** The
surfaces the Worker can see are the high-intent ones: `/llms.txt` for
orientation, `.md` for explicit reference consumption, `.prompt.txt` for
deliberate prompt retrieval, and negotiated Markdown for an explicitly
machine-oriented representation. A catalog fetch is interesting; a subsequent
`.md` fetch is much stronger evidence that a discovery chain led somewhere. The
partial view is therefore not a degraded version of the whole -- it is the more
informative half. Label it accordingly and never present it as total machine
traffic.

**Static assets will not be routed through the Worker for telemetry.** Rejected.
Static delivery is the correct serving architecture for a published catalog, and
observability should adapt to the architecture rather than distort it. Revisit
only if one of those resources needs to become dynamic for an independent
functional reason.

**Analytics Engine stays deferred.** It is not needed to answer the current
question, and cost is not the reason: a binding, application instrumentation,
and a deliberately stored dataset are a larger commitment than the question
currently justifies.

## A calibration point

The one organic non-asset hit observed during the tail windows identified itself
as a Palo Alto Networks scanner. It is a useful reminder that a machine request
is not AI consumption. Client family is an observation to record, not a
classification to trust; the surface requested carries most of the signal,
because a scanner sweeping `/` and an agent fetching `/notes/<slug>.prompt.txt`
are asking for very different things.

## Caveat on any window measured now

`.md`, `.prompt.txt`, and `/reference-index.json` became public with the
2026-08-24 release. Any window sampled soon after will show near-zero on them
because they have barely existed, not because nothing walks them. Only
`/llms.txt`, `/knowledge.json`, and the skills index have enough history to
carry a reading today.
