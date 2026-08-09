/* global DOMException, Response */

import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
  checkUrl,
  classifyNetworkFailure,
  classifyStatus,
  extractHttpUrls,
  localNetworkPolicyEnabled,
  mapWithConcurrency,
  sinkAddresses,
  skipReason,
} from "../scripts/check-external-links.mjs";

const BEACON = "https://static.cloudflareinsights.com/beacon.min.js";
const SEBOK_MBSE =
  "https://sebokwiki.org/wiki/Model-Based_Systems_Engineering_%28MBSE%29";
const SEI_ASSURANCE_CASES =
  "https://www.sei.cmu.edu/library/assurance-cases-overview/";
const BEACON_REASON =
  "Cloudflare Web Analytics beacon intentionally blocked by declared local DNS policy";

function dnsFailure(hostname = "static.cloudflareinsights.com") {
  const error = new TypeError("fetch failed");
  error.cause = Object.assign(new Error("getaddrinfo ENOTFOUND"), {
    code: "ENOTFOUND",
    hostname,
  });
  return error;
}

function sinkRefusal(address = "::") {
  const error = new TypeError("fetch failed");
  error.cause = Object.assign(new Error("connect ECONNREFUSED"), {
    code: "ECONNREFUSED",
    address,
    hostname: "static.cloudflareinsights.com",
  });
  return error;
}

// Node reports a multi-address connect failure this way, which is the shape the
// real sinkholed host produces.
function aggregateRefusal(addresses) {
  const error = new TypeError("fetch failed");
  error.cause = Object.assign(
    new AggregateError(
      addresses.map((address) =>
        Object.assign(new Error(`connect ECONNREFUSED ${address}:443`), {
          code: "ECONNREFUSED",
          address,
          port: 443,
        }),
      ),
    ),
    { code: "ECONNREFUSED" },
  );
  return error;
}

function throwingFetch(error) {
  return async () => {
    throw error;
  };
}

const withPolicy = {
  policyEnabled: true,
  retryDelayMs: 1,
  sinks: sinkAddresses({}),
};

test("extracts and normalizes HTTP links from Markdown and Astro source", () => {
  const source = `
    [One](https://docs.example.test/a_(b)?x=1#section).
    <a href="https://docs.example.test/two?x=1&amp;y=2">Two</a>
    duplicate: https://docs.example.test/two?x=1&y=2
    ignored: mailto:test@example.test
  `;

  assert.deepEqual(extractHttpUrls(source), [
    "https://docs.example.test/a_(b)?x=1",
    "https://docs.example.test/two?x=1&y=2",
  ]);
});

test("status policy is strict except for exact bot-blocked URLs", () => {
  assert.equal(classifyStatus("https://example.test/", 204).ok, true);
  assert.equal(classifyStatus("https://example.test/", 301).ok, true);
  assert.equal(classifyStatus("https://example.test/", 403).ok, false);
  assert.deepEqual(
    classifyStatus("https://www.linkedin.com/in/juhahuotari/", 999),
    {
      ok: true,
      kind: "automation-blocked",
      reason: "LinkedIn profile blocks automated link checks",
    },
  );
  assert.equal(
    classifyStatus("https://www.linkedin.com/in/someone-else/", 999).ok,
    false,
  );
  assert.deepEqual(
    classifyStatus(
      "https://www.oecd.org/en/publications/the-impact-of-ai-on-the-workplace-main-findings-from-the-oecd-ai-surveys-of-employers-and-workers_ea0a0fe1-en.html",
      403,
    ),
    {
      ok: true,
      kind: "automation-blocked",
      reason: "OECD publication blocks automated link checks",
    },
  );
  assert.equal(
    classifyStatus("https://www.oecd.org/en/publications/another.html", 403).ok,
    false,
  );
  assert.equal(
    classifyStatus(
      "https://www.oecd.org/en/publications/the-impact-of-ai-on-the-workplace-main-findings-from-the-oecd-ai-surveys-of-employers-and-workers_ea0a0fe1-en.html",
      404,
    ).ok,
    false,
  );
  assert.deepEqual(
    classifyStatus("https://www.iso.org/standard/68390.html", 403),
    {
      ok: true,
      kind: "automation-blocked",
      reason: "ISO standard page blocks automated link checks",
    },
  );
  assert.equal(
    classifyStatus("https://www.iso.org/standard/68390.html", 404).ok,
    false,
  );
  assert.equal(
    classifyStatus("https://www.iso.org/standard/other.html", 403).ok,
    false,
  );
});

test("source examples are skipped without suppressing ordinary GitHub links", () => {
  assert.equal(
    skipReason("https://github.com/owner/repo"),
    "project-template placeholder",
  );
  assert.equal(skipReason("https://github.com/bayleafwalker/box"), null);
});

test("falls back from a rejected HEAD request to GET", async () => {
  const methods = [];
  const fetchImpl = async (_url, options) => {
    methods.push(options.method);
    return new Response(null, {
      status: options.method === "HEAD" ? 405 : 200,
    });
  };

  const result = await checkUrl("https://example.test/resource", {
    fetchImpl,
    timeoutMs: 100,
  });

  assert.deepEqual(methods, ["HEAD", "GET"]);
  assert.equal(result.ok, true);
  assert.equal(result.method, "GET");
});

test("retries a transient transport failure three times with backoff", async () => {
  let calls = 0;
  const result = await checkUrl("https://example.test/transient", {
    fetchImpl: async () => {
      calls += 1;
      if (calls < 3) throw new TypeError("fetch failed");
      return new Response(null, { status: 204 });
    },
    retryDelayMs: 1,
    timeoutMs: 100,
  });

  assert.equal(result.ok, true);
  assert.equal(result.method, "HEAD");
  assert.equal(calls, 3);
});

test("serializes checks for the same host while checking other hosts concurrently", async () => {
  const activeHosts = new Set();
  let overlappingHost = false;
  let active = 0;
  let peakActive = 0;
  const values = [
    { id: 1, host: "one.test" },
    { id: 2, host: "one.test" },
    { id: 3, host: "two.test" },
  ];

  const results = await mapWithConcurrency(
    values,
    3,
    async (value) => {
      if (activeHosts.has(value.host)) overlappingHost = true;
      activeHosts.add(value.host);
      active += 1;
      peakActive = Math.max(peakActive, active);
      await delay(5);
      active -= 1;
      activeHosts.delete(value.host);
      return value.id * 2;
    },
    (value) => value.host,
  );

  assert.deepEqual(results, [2, 4, 6]);
  assert.equal(overlappingHost, false);
  assert.equal(peakActive, 2);
});

test("accepts repeated timeouts only for exact SEBoK policy URLs", async () => {
  const timedOut = throwingFetch(
    new DOMException("Request timed out", "AbortError"),
  );
  const sebok = await checkUrl(SEBOK_MBSE, {
    fetchImpl: timedOut,
    retryDelayMs: 1,
    timeoutMs: 100,
  });
  assert.equal(sebok.ok, true);
  assert.equal(sebok.kind, "automation-blocked");

  const unrelated = await checkUrl("https://example.test/timed-out", {
    fetchImpl: timedOut,
    retryDelayMs: 1,
    timeoutMs: 100,
  });
  assert.equal(unrelated.ok, false);
  assert.equal(unrelated.reason, "request timed out");
});

test("accepts exact SEI runner blocks without masking broken SEI links", async () => {
  const blocked = await checkUrl(SEI_ASSURANCE_CASES, {
    fetchImpl: throwingFetch(new TypeError("fetch failed")),
    retryDelayMs: 1,
    timeoutMs: 100,
  });
  assert.equal(blocked.ok, true);
  assert.equal(blocked.kind, "automation-blocked");

  const missing = await checkUrl(SEI_ASSURANCE_CASES, {
    fetchImpl: async () => new Response(null, { status: 404 }),
    retryDelayMs: 1,
    timeoutMs: 100,
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.reason, "HTTP 404");

  const unrelated = await checkUrl("https://www.sei.cmu.edu/other/", {
    fetchImpl: throwingFetch(new TypeError("fetch failed")),
    retryDelayMs: 1,
    timeoutMs: 100,
  });
  assert.equal(unrelated.ok, false);
  assert.equal(unrelated.reason, "fetch failed");
});

test("local network policy is off unless explicitly enabled", () => {
  assert.equal(localNetworkPolicyEnabled({}), false);
  assert.equal(
    localNetworkPolicyEnabled({ LINK_CHECK_LOCAL_NETWORK_POLICY: "0" }),
    false,
  );
  assert.equal(
    localNetworkPolicyEnabled({ LINK_CHECK_LOCAL_NETWORK_POLICY: "1" }),
    true,
  );
  assert.ok(sinkAddresses({}).has("::"));
  assert.ok(
    sinkAddresses({ LINK_CHECK_SINK_ADDRESSES: "192.0.2.1" }).has("192.0.2.1"),
  );
});

test("intentional network blocks are exact-URL, policy-gated and sinkhole-shaped", () => {
  const enotfound = { message: "fetch failed", code: "ENOTFOUND" };
  const refusedBySink = {
    message: "fetch failed",
    code: "ECONNREFUSED",
    address: "::",
  };

  assert.deepEqual(
    classifyNetworkFailure(BEACON, [enotfound, enotfound], withPolicy),
    { ok: true, kind: "intentional-network-block", reason: BEACON_REASON },
  );
  assert.deepEqual(
    classifyNetworkFailure(BEACON, [refusedBySink, refusedBySink], withPolicy),
    { ok: true, kind: "intentional-network-block", reason: BEACON_REASON },
  );

  // Policy disabled: the same failure is a failure.
  assert.equal(
    classifyNetworkFailure(BEACON, [enotfound, enotfound], {
      policyEnabled: false,
      sinks: sinkAddresses({}),
    }),
    null,
  );

  // A different URL never qualifies, however it failed.
  assert.equal(
    classifyNetworkFailure(
      "https://static.cloudflareinsights.com/other.js",
      [enotfound, enotfound],
      withPolicy,
    ),
    null,
  );

  // A refusal from a real address is a broken link, not a sinkhole.
  assert.equal(
    classifyNetworkFailure(
      BEACON,
      [
        { ...refusedBySink, address: "104.16.0.1" },
        { ...refusedBySink, address: "104.16.0.1" },
      ],
      withPolicy,
    ),
    null,
  );

  // Timeouts and TLS errors carry no sinkhole-shaped code.
  assert.equal(
    classifyNetworkFailure(
      BEACON,
      [{ message: "request timed out" }, { message: "request timed out" }],
      withPolicy,
    ),
    null,
  );
  assert.equal(
    classifyNetworkFailure(
      BEACON,
      [
        { message: "fetch failed", code: "CERT_HAS_EXPIRED" },
        { message: "fetch failed", code: "CERT_HAS_EXPIRED" },
      ],
      withPolicy,
    ),
    null,
  );

  // A real HTTP answer on one attempt disqualifies the whole result.
  assert.equal(
    classifyNetworkFailure(BEACON, [undefined, enotfound], withPolicy),
    null,
  );
});

test("the beacon still fails on HTTP answers and succeeds when reachable", async () => {
  const notFound = await checkUrl(BEACON, {
    fetchImpl: async () => new Response(null, { status: 404 }),
    timeoutMs: 100,
    ...withPolicy,
  });
  assert.equal(notFound.ok, false);
  assert.equal(notFound.reason, "HTTP 404");

  const reachable = await checkUrl(BEACON, {
    fetchImpl: async () => new Response(null, { status: 200 }),
    timeoutMs: 100,
    ...withPolicy,
  });
  assert.equal(reachable.ok, true);
  assert.equal(reachable.kind, "reachable");
});

test("a sinkholed beacon warns under policy and fails without it", async () => {
  for (const failure of [dnsFailure(), sinkRefusal()]) {
    const warned = await checkUrl(BEACON, {
      fetchImpl: throwingFetch(failure),
      timeoutMs: 100,
      ...withPolicy,
    });
    assert.equal(warned.ok, true);
    assert.equal(warned.kind, "intentional-network-block");
    assert.equal(warned.reason, BEACON_REASON);

    const failed = await checkUrl(BEACON, {
      fetchImpl: throwingFetch(failure),
      timeoutMs: 100,
      policyEnabled: false,
      sinks: sinkAddresses({}),
    });
    assert.equal(failed.ok, false);
    assert.equal(failed.kind, "failure");
  }

  // The real shape: every dialled address is a sink.
  const aggregate = await checkUrl(BEACON, {
    fetchImpl: throwingFetch(aggregateRefusal(["0.0.0.0", "::"])),
    timeoutMs: 100,
    ...withPolicy,
  });
  assert.equal(aggregate.kind, "intentional-network-block");

  // One genuine address among them means the host really refused us.
  const partiallyReal = await checkUrl(BEACON, {
    fetchImpl: throwingFetch(aggregateRefusal(["0.0.0.0", "104.16.0.1"])),
    timeoutMs: 100,
    ...withPolicy,
  });
  assert.equal(partiallyReal.ok, false);

  // The same DNS failure on an undeclared URL still fails.
  const other = await checkUrl("https://example.test/asset.js", {
    fetchImpl: throwingFetch(dnsFailure("example.test")),
    timeoutMs: 100,
    ...withPolicy,
  });
  assert.equal(other.ok, false);
});

test("reports a failed GET with both request attempts", async () => {
  const fetchImpl = async () => new Response(null, { status: 404 });
  const result = await checkUrl("https://example.test/missing", {
    fetchImpl,
    timeoutMs: 100,
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "HTTP 404");
  assert.equal(result.attempts.head.status, 404);
  assert.equal(result.attempts.get.status, 404);
});
