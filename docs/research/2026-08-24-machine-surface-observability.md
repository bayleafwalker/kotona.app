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

## Where the decision actually sits

Not on price, and not on enabling Workers Logs, which is already on. The open
questions are:

1. **Coverage.** Counting `/reference-index.json`, `/knowledge.json`, and the
   skills index at the Worker layer requires making them Worker-served rather
   than prerendered. That trades cached static delivery for a Worker invocation
   on every request, and it is a production change made solely to obtain a
   measurement. Zone-level HTTP analytics sees every request including static
   assets and needs no code change; whether it exposes per-path grouping on this
   plan is unverified.
2. **Access.** Reading the retained logs needs the dashboard or a scoped token.

Accepting partial coverage is also a legitimate answer: `.md`, `.prompt.txt`,
`llms.txt`, and negotiated Markdown are the surfaces that indicate an agent is
actually consuming references, as opposed to fetching one catalog once.

## Caveat on any window measured now

`.md`, `.prompt.txt`, and `/reference-index.json` became public with the
2026-08-24 release. Any window sampled soon after will show near-zero on them
because they have barely existed, not because nothing walks them. Only
`/llms.txt`, `/knowledge.json`, and the skills index have enough history to
carry a reading today.
