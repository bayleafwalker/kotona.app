# Reference discovery baseline (week one)

Date: 2026-09-01  
Scope: edge traffic for the declared production hosts `kotona.app` and
`www.kotona.app`  
Window: 2026-08-25T00:00:00Z through 2026-09-01T00:00:00Z  
Plan: [`docs/plans/reference-discovery.md`](../plans/reference-discovery.md)

This is the first real measurement window for the discovery surfaces published
on 2026-08-24. It is a week-one edge snapshot, not a complete telemetry
baseline: the Worker telemetry needed to distinguish negotiated Markdown is not
readable with the current account credential.

## Collection receipt

The collection used seven independent Cloudflare GraphQL
`httpRequestsAdaptiveGroups` queries, one closed UTC day per query. Every query
returned HTTP 200. The total query counted requests after an exact hostname
allowlist for the two production hosts. The category queries used the same
hostname and time filters, then grouped by request path and edge response
status.

The query did not add a `requestSource` filter. These figures therefore retain
the protocol's edge-request denominator rather than silently changing it to an
eyeball-only denominator. Future windows must keep that choice or re-declare the
baseline.

The classification rules were:

- **Discovery:** `/sitemap-index.xml`, `/rss.xml`, `/llms.txt`,
  `/reference-index.json`, `/knowledge.json`, and the
  `/.well-known/agent-skills/` prefix.
- **Direct reference consumption:** `/notes/<slug>.md`, `/projects/<slug>.md`,
  `/notes/<slug>.prompt.txt`, and `/projects/<slug>.prompt.txt`.
- **Residual traffic:** the hostname-filtered total minus the two measured
  categories. It is not a measure of human readership.
- **Negotiated Markdown:** kept outside the zone-path categories because the
  same HTML path can be requested with `Accept: text/markdown`. This requires
  Worker telemetry.

The first exploratory query was zone-wide and returned 40,914 requests. It is
rejected: the zone contains traffic for other hosts and alternate-port variants.
It must not be used in comparisons or trend reporting. The corrected
host-filtered query removed 2,417 requests and left the 69 discovery requests
unchanged.

## Accepted baseline

| Category             |   Requests | Share of total |
| -------------------- | ---------: | -------------: |
| Discovery            |         69 |         0.179% |
| Direct `.md`         |          0 |             0% |
| Direct `.prompt.txt` |          0 |             0% |
| Residual traffic     |     38,428 |        99.821% |
| **Total**            | **38,497** |       **100%** |

Discovery traffic was narrow and concentrated in the older surfaces:

| Surface            | Requests | Statuses            |
| ------------------ | -------: | ------------------- |
| Sitemap            |       54 | 46× `200`, 8× `304` |
| RSS                |       11 | 11× `200`           |
| `llms.txt`         |        4 | 4× `200`            |
| Reference catalog  |        0 | —                   |
| Knowledge map      |        0 | —                   |
| Agent-skills index |        0 | —                   |

The daily records are retained here so a partial day or an anomalous spike is
not hidden by the aggregate:

| UTC day    |  Total | Discovery | Residual |
| ---------- | -----: | --------: | -------: |
| 2026-08-25 |  2,095 |         8 |    2,087 |
| 2026-08-26 |  2,073 |         4 |    2,069 |
| 2026-08-27 |  9,162 |         7 |    9,155 |
| 2026-08-28 |  7,711 |         7 |    7,704 |
| 2026-08-29 | 12,527 |        10 |   12,517 |
| 2026-08-30 |  2,917 |        17 |    2,900 |
| 2026-08-31 |  2,012 |        16 |    1,996 |

## Worker-side check

The account-level Worker invocation aggregate returned 30,576 requests, zero
reported errors, and 27,352 subrequests for the same dates. This confirms that
the aggregate Worker statistics path is returning data and that no Worker errors
were reported in the window.

The 7,921-request difference between the accepted zone total and Worker
invocations is not yet reconciled. The datasets may have different routing,
cache, hostname, or execution scopes. The figures must remain separate until a
query proves the relationship.

The Workers Observability keys endpoint returned `403 Authentication error`.
Consequently, this receipt does not establish that negotiated Markdown was
unused. It establishes only that no direct `.md` or `.prompt.txt` request was
returned by the accepted zone-path queries.

## Outcomes and derived actions

The strongest supported outcome is low but nonzero use of the sitemap, RSS, and
`llms.txt`. The catalog, knowledge map, and agent-skills index had no observed
requests in this window. That is a result about this seven-day sample, not a
claim that those surfaces are ineffective. The data cannot identify people,
unique clients, crawlers, referrals, sessions, or AI-agent consumption.

Actions follow from the gaps rather than from the zeroes:

1. **Baseline v1 is accepted.** Use only the host-filtered result in future
   comparisons; retain the exploratory result as rejected scope contamination.
2. **The protocol is frozen for repetition.** Preserve the host allowlist, UTC
   half-open daily bounds, no-`requestSource` choice, path rules, status
   grouping, and category reconciliation to 38,497.
3. **Workers Observability access remains a P0 dependency.** Restore a
   least-privilege credential or use the dashboard Query Builder, then collect
   negotiated Markdown by day and production host.
4. **Reconcile the Worker denominator at P1.** Align hostname, time, route, and
   cache scope before interpreting the 7,921-request difference.
5. **Repeat the unchanged collection for three more weekly windows.** A single
   week is a reference point; four comparable windows can show ordinary
   variance.
6. **Verify browser Web Analytics separately at P2.** Edge and Worker aggregates
   do not prove that browser RUM beacons are being ingested.

The collection was read-only. No production probes, Cloudflare settings, or
repository deployment were performed for this receipt.
