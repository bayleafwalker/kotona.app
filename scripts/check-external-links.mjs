#!/usr/bin/env node

/* global AbortController, DOMException, URL, clearTimeout, console, fetch, process, setTimeout */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_CONCURRENCY = 6;
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRY_DELAY_MS = 250;
const MAX_REQUEST_ATTEMPTS = 3;
const USER_AGENT =
  "kotona.app-link-checker/1.0 (+https://kotona.app/; read-only CI check)";

const SOURCE_EXTENSIONS = new Set([".astro", ".md", ".mdx"]);
const SKIPPED_DIRECTORIES = new Set([
  ".astro",
  ".git",
  ".wrangler",
  "coverage",
  "dist",
  "node_modules",
  "temp",
]);
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const SEBOK_AUTOMATION_BLOCK_POLICY = {
  statuses: new Set([403]),
  networkErrors: new Set(["request timed out"]),
  reason:
    "SEBoK sits behind a Cloudflare bot challenge that blocks automated link checks",
};
const SEI_AUTOMATION_BLOCK_POLICY = {
  statuses: new Set([403]),
  networkErrors: new Set(["fetch failed", "request timed out"]),
  reason: "SEI pages drop automated link checks from GitHub-hosted runners",
};

// These are explicit source examples, not remotely verifiable site links.
const EXAMPLE_URLS = new Map([
  ["https://github.com/owner/repo", "project-template placeholder"],
]);

// Some public pages deliberately reject automated clients. Exceptions stay
// URL- and status-specific so a normal 404 or a new blocked host still fails.
const AUTOMATION_BLOCK_POLICIES = new Map([
  [
    "https://www.linkedin.com/in/juhahuotari/",
    {
      statuses: new Set([403, 429, 999]),
      reason: "LinkedIn profile blocks automated link checks",
    },
  ],
  [
    "https://www.oecd.org/en/publications/the-impact-of-ai-on-the-workplace-main-findings-from-the-oecd-ai-surveys-of-employers-and-workers_ea0a0fe1-en.html",
    {
      statuses: new Set([403]),
      reason: "OECD publication blocks automated link checks",
    },
  ],
  [
    "https://sebokwiki.org/wiki/Requirements_Engineering",
    SEBOK_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://sebokwiki.org/wiki/System_Requirements_Definition",
    SEBOK_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://sebokwiki.org/wiki/System_Verification",
    SEBOK_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://sebokwiki.org/wiki/System_Validation",
    SEBOK_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://sebokwiki.org/wiki/Model-Based_Systems_Engineering_%28MBSE%29",
    SEBOK_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://www.rtca.org/products/do-330/",
    {
      statuses: new Set([403]),
      reason:
        "RTCA sits behind a Cloudflare bot challenge that blocks automated link checks",
    },
  ],
  [
    "https://www.iso.org/standard/68390.html",
    {
      statuses: new Set([403]),
      reason: "ISO standard page blocks automated link checks",
    },
  ],
  [
    "https://www.iso.org/standard/74393.html",
    {
      statuses: new Set([403]),
      reason: "ISO standard page blocks automated link checks",
    },
  ],
  [
    "https://www.iso.org/standard/81230.html",
    {
      statuses: new Set([403]),
      reason: "ISO standard page blocks automated link checks",
    },
  ],
  [
    "https://sms.onlinelibrary.wiley.com/toc/10970266/1997/18/7",
    {
      statuses: new Set([403]),
      reason: "Wiley journal page blocks automated link checks",
    },
  ],
  [
    "https://www.sei.cmu.edu/annual-reviews/2023-research-review/formal-arguments-for-large-scale-assurance-falsa/",
    SEI_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://www.sei.cmu.edu/library/assurance-cases-overview/",
    SEI_AUTOMATION_BLOCK_POLICY,
  ],
  [
    "https://www.sei.cmu.edu/library/resources-for-assurance-cases/",
    SEI_AUTOMATION_BLOCK_POLICY,
  ],
]);

// A separate class from AUTOMATION_BLOCK_POLICIES. Those handle a remote server
// answering with a specific status; these never reach an HTTP response at all,
// because the local resolver deliberately blocks the host. The policy is off by
// default, so CI runners keep checking these URLs normally.
const NETWORK_BLOCK_POLICIES = new Map([
  [
    "https://static.cloudflareinsights.com/beacon.min.js",
    {
      reason:
        "Cloudflare Web Analytics beacon intentionally blocked by declared local DNS policy",
    },
  ],
]);

// Addresses a DNS sinkhole answers with. A refusal from one of these is a
// blocked host; a refusal from a real address is a broken link.
const DEFAULT_SINK_ADDRESSES = new Set(["0.0.0.0", "::", "0:0:0:0:0:0:0:0"]);
const SINK_REFUSAL_CODES = new Set(["ECONNREFUSED", "EHOSTUNREACH"]);

function countCharacter(value, character) {
  return [...value].filter((item) => item === character).length;
}

function trimCandidate(candidate) {
  let value = candidate.replaceAll("&amp;", "&");

  while (/[.,;:!*]$/.test(value)) {
    value = value.slice(0, -1);
  }

  for (const [opening, closing] of [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
  ]) {
    while (
      value.endsWith(closing) &&
      countCharacter(value, closing) > countCharacter(value, opening)
    ) {
      value = value.slice(0, -1);
    }
  }

  return value;
}

function normalizeUrl(candidate) {
  try {
    const url = new URL(trimCandidate(candidate));

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function extractHttpUrlMatches(source) {
  const matches = [];
  const pattern = /https?:\/\/[^\s<>"'`]+/giu;

  for (const match of source.matchAll(pattern)) {
    const url = normalizeUrl(match[0]);

    if (url) {
      matches.push({ url, index: match.index ?? 0 });
    }
  }

  return matches;
}

export function extractHttpUrls(source) {
  return [...new Set(extractHttpUrlMatches(source).map((match) => match.url))];
}

export function skipReason(urlValue) {
  const normalized = normalizeUrl(urlValue);

  if (!normalized) {
    return "invalid HTTP(S) URL";
  }

  const url = new URL(normalized);
  const exampleReason = EXAMPLE_URLS.get(normalized.replace(/\/$/, ""));

  if (exampleReason) {
    return exampleReason;
  }

  if (
    ["example.com", "example.net", "example.org"].includes(url.hostname) ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]"
  ) {
    return "reserved example or loopback host";
  }

  return null;
}

export function classifyStatus(urlValue, status) {
  if (status >= 200 && status < 400) {
    return { ok: true, kind: "reachable" };
  }

  const policy = AUTOMATION_BLOCK_POLICIES.get(urlValue);

  if (policy?.statuses.has(status)) {
    return { ok: true, kind: "automation-blocked", reason: policy.reason };
  }

  return { ok: false, kind: "failure", reason: `HTTP ${status}` };
}

export function classifyAutomationFailure(urlValue, details) {
  const policy = AUTOMATION_BLOCK_POLICIES.get(urlValue);

  if (
    !policy?.networkErrors ||
    details.length === 0 ||
    !details.every(
      (detail) => detail?.message && policy.networkErrors.has(detail.message),
    )
  ) {
    return null;
  }

  return { ok: true, kind: "automation-blocked", reason: policy.reason };
}

export function localNetworkPolicyEnabled(env = process.env) {
  const value = env.LINK_CHECK_LOCAL_NETWORK_POLICY;
  return value === "1" || value === "true";
}

export function sinkAddresses(env = process.env) {
  const configured = (env.LINK_CHECK_SINK_ADDRESSES ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return new Set([...DEFAULT_SINK_ADDRESSES, ...configured]);
}

function isNetworkBlockShaped(detail, sinks) {
  if (!detail?.code) {
    return false;
  }

  if (detail.code === "ENOTFOUND") {
    return true;
  }

  if (!SINK_REFUSAL_CODES.has(detail.code)) {
    return false;
  }

  const addresses =
    detail.addresses?.length > 0
      ? detail.addresses
      : [detail.address].filter(Boolean);

  // Every address dialled must be a sink. One real address means the host
  // resolved somewhere genuine and refused the connection.
  return (
    addresses.length > 0 && addresses.every((address) => sinks.has(address))
  );
}

// Only an exact declared URL, only under an explicitly enabled local policy, and
// only for a DNS/sinkhole-shaped failure. A 404, a TLS error, a timeout, or the
// same failure on any other URL still fails.
export function classifyNetworkFailure(urlValue, details, options = {}) {
  const {
    policyEnabled = localNetworkPolicyEnabled(),
    sinks = sinkAddresses(),
  } = options;

  if (!policyEnabled) {
    return null;
  }

  const policy = NETWORK_BLOCK_POLICIES.get(urlValue);

  if (!policy) {
    return null;
  }

  // Every attempt must have failed this way. A missing detail means that
  // attempt reached a real HTTP answer, which disqualifies the result.
  if (
    details.length === 0 ||
    !details.every((detail) => isNetworkBlockShaped(detail, sinks))
  ) {
    return null;
  }

  return {
    ok: true,
    kind: "intentional-network-block",
    reason: policy.reason,
  };
}

function isSourceFile(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  return (
    SOURCE_EXTENSIONS.has(path.extname(normalized).toLowerCase()) ||
    normalized === "src/site.ts"
  );
}

export async function discoverSourceFiles(rootDirectory) {
  const files = [];

  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) {
          await walk(absolutePath);
        }
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const relativePath = path.relative(rootDirectory, absolutePath);

      if (isSourceFile(relativePath)) {
        files.push(absolutePath);
      }
    }
  }

  await walk(rootDirectory);
  return files.sort();
}

function lineNumberAt(source, index) {
  let line = 1;

  for (let offset = 0; offset < index; offset += 1) {
    if (source.charCodeAt(offset) === 10) {
      line += 1;
    }
  }

  return line;
}

export async function collectExternalLinks(rootDirectory) {
  const links = new Map();
  const files = await discoverSourceFiles(rootDirectory);

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const relativePath = path
      .relative(rootDirectory, filePath)
      .split(path.sep)
      .join("/");

    for (const match of extractHttpUrlMatches(source)) {
      const link = links.get(match.url) ?? { url: match.url, references: [] };
      const reference = `${relativePath}:${lineNumberAt(source, match.index)}`;

      if (!link.references.includes(reference)) {
        link.references.push(reference);
      }

      links.set(match.url, link);
    }
  }

  return {
    files,
    links: [...links.values()].sort((left, right) =>
      left.url.localeCompare(right.url),
    ),
  };
}

function errorMessage(error) {
  if (error instanceof Error) {
    return error.name === "AbortError" ? "request timed out" : error.message;
  }

  return String(error);
}

// fetch() flattens transport failures into "fetch failed"; the code, address and
// hostname that distinguish a sinkholed host from a broken link live on the
// cause. Keep them.
function errorDetail(error) {
  const detail = { message: errorMessage(error) };

  if (!(error instanceof Error) || error.name === "AbortError") {
    return detail;
  }

  const cause = error.cause;

  if (cause && typeof cause === "object") {
    detail.code = cause.code;
    detail.address = cause.address;
    detail.hostname = cause.hostname;

    // Node reports a multi-address connect failure as an AggregateError whose
    // sub-errors carry the addresses actually dialled. Those are the ones that
    // say whether a sinkhole answered.
    if (Array.isArray(cause.errors)) {
      detail.addresses = cause.errors
        .map((sub) => sub?.address)
        .filter((address) => typeof address === "string");
    }
  }

  return detail;
}

async function requestOnce(fetchImpl, url, method, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Request timed out", "AbortError")),
    timeoutMs,
  );
  timeout.unref?.();

  try {
    const response = await fetchImpl(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        "User-Agent": USER_AGENT,
      },
    });

    await response.body?.cancel().catch(() => {});

    return {
      status: response.status,
      finalUrl: response.url || url,
    };
  } catch (error) {
    return { error: errorMessage(error), detail: errorDetail(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithRetry(
  fetchImpl,
  url,
  method,
  timeoutMs,
  retryDelayMs,
) {
  let result;

  for (let attempt = 0; attempt < MAX_REQUEST_ATTEMPTS; attempt += 1) {
    result = await requestOnce(fetchImpl, url, method, timeoutMs);
    const retryable =
      Boolean(result.error) ||
      (result.status !== undefined && RETRYABLE_STATUSES.has(result.status));

    if (!retryable || attempt === MAX_REQUEST_ATTEMPTS - 1) {
      return result;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, retryDelayMs * 2 ** attempt),
    );
  }

  return result;
}

export async function checkUrl(
  url,
  {
    fetchImpl = fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    policyEnabled = localNetworkPolicyEnabled(),
    sinks = sinkAddresses(),
  } = {},
) {
  const head = await requestWithRetry(
    fetchImpl,
    url,
    "HEAD",
    timeoutMs,
    retryDelayMs,
  );

  if (head.status !== undefined) {
    const classification = classifyStatus(url, head.status);

    if (classification.ok) {
      return {
        url,
        method: "HEAD",
        ...head,
        ...classification,
        attempts: { head },
      };
    }
  }

  const get = await requestWithRetry(
    fetchImpl,
    url,
    "GET",
    timeoutMs,
    retryDelayMs,
  );

  if (get.status !== undefined) {
    const classification = classifyStatus(url, get.status);
    return {
      url,
      method: "GET",
      ...get,
      ...classification,
      attempts: { head, get },
    };
  }

  const failureDetails = [head.detail, get.detail];
  const automationClassification = classifyAutomationFailure(
    url,
    failureDetails,
  );

  if (automationClassification) {
    return {
      url,
      method: "GET",
      ...automationClassification,
      attempts: { head, get },
    };
  }

  const networkClassification = classifyNetworkFailure(url, failureDetails, {
    policyEnabled,
    sinks,
  });

  if (networkClassification) {
    return {
      url,
      method: "GET",
      ...networkClassification,
      attempts: { head, get },
    };
  }

  return {
    url,
    method: "GET",
    ok: false,
    kind: "failure",
    reason: get.error ?? head.error ?? "request failed",
    attempts: { head, get },
  };
}

export async function mapWithConcurrency(
  values,
  concurrency,
  operation,
  groupBy = (_value, index) => index,
) {
  const results = new Array(values.length);
  const groups = new Map();

  values.forEach((value, index) => {
    const key = groupBy(value, index);
    const group = groups.get(key) ?? [];
    group.push({ value, index });
    groups.set(key, group);
  });

  const workGroups = [...groups.values()];
  let nextGroup = 0;

  async function worker() {
    while (nextGroup < workGroups.length) {
      const groupIndex = nextGroup;
      nextGroup += 1;

      for (const { value, index } of workGroups[groupIndex]) {
        results[index] = await operation(value, index);
      }
    }
  }

  const workerCount = Math.min(concurrency, workGroups.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function formatAttempt(name, attempt) {
  if (!attempt) {
    return null;
  }

  if (attempt.error) {
    return `${name}: ${attempt.error}`;
  }

  const destination = attempt.finalUrl ? ` -> ${attempt.finalUrl}` : "";
  return `${name}: HTTP ${attempt.status}${destination}`;
}

function parsePositiveInteger(value, flag) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer`);
  }

  return parsed;
}

function parseArguments(argv) {
  const options = {
    rootDirectory: process.cwd(),
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help") {
      options.help = true;
    } else if (argument === "--root") {
      options.rootDirectory = path.resolve(argv[++index] ?? "");
    } else if (argument === "--concurrency") {
      options.concurrency = parsePositiveInteger(argv[++index], argument);
    } else if (argument === "--timeout-ms") {
      options.timeoutMs = parsePositiveInteger(argv[++index], argument);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function printUsage() {
  console.log(`Usage: node scripts/check-external-links.mjs [options]

Options:
  --root <path>          Repository root (default: current directory)
  --concurrency <count> Parallel requests (default: ${DEFAULT_CONCURRENCY})
  --timeout-ms <ms>     Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  --help                Show this help

Environment:
  LINK_CHECK_LOCAL_NETWORK_POLICY=1
      Accept declared intentional local DNS blocks (see NETWORK_BLOCK_POLICIES)
      when they fail in a sinkhole-shaped way. Off by default, so CI checks
      those URLs normally.
  LINK_CHECK_SINK_ADDRESSES=<addr,addr>
      Extra sink addresses beyond ${[...DEFAULT_SINK_ADDRESSES].join(", ")}.`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const inventory = await collectExternalLinks(options.rootDirectory);
  const skipped = [];
  const checkable = [];

  for (const link of inventory.links) {
    const reason = skipReason(link.url);

    if (reason) {
      skipped.push({ ...link, reason });
    } else {
      checkable.push(link);
    }
  }

  console.log(
    `External links: ${checkable.length} checkable, ${skipped.length} explicit examples, ${inventory.files.length} source files.`,
  );

  const results = await mapWithConcurrency(
    checkable,
    options.concurrency,
    async (link) => ({
      link,
      result: await checkUrl(link.url, { timeoutMs: options.timeoutMs }),
    }),
    (link) => new URL(link.url).hostname,
  );

  const blocked = results.filter(
    ({ result }) => result.kind === "automation-blocked",
  );
  const networkBlocked = results.filter(
    ({ result }) => result.kind === "intentional-network-block",
  );
  const failures = results.filter(({ result }) => !result.ok);

  for (const { link, result } of blocked) {
    console.warn(`WARN ${link.url}`);
    const status =
      result.status === undefined ? "" : ` (HTTP ${result.status})`;
    console.warn(`  ${result.reason}${status}`);
    console.warn(`  ${link.references.join(", ")}`);
  }

  for (const { link, result } of networkBlocked) {
    console.warn(`WARN ${link.url}`);
    console.warn(`  ${result.reason}`);
    console.warn(`  ${link.references.join(", ")}`);
  }

  for (const { link, result } of failures) {
    console.error(`FAIL ${link.url}`);
    console.error(`  ${result.reason}`);

    for (const detail of [
      formatAttempt("HEAD", result.attempts.head),
      formatAttempt("GET", result.attempts.get),
    ].filter(Boolean)) {
      console.error(`  ${detail}`);
    }

    console.error(`  ${link.references.join(", ")}`);
  }

  for (const link of skipped) {
    console.log(`SKIP ${link.url} (${link.reason})`);
  }

  const reachable =
    results.length - blocked.length - networkBlocked.length - failures.length;
  console.log(
    `External link result: ${reachable} reachable, ${blocked.length} explicitly bot-blocked, ${networkBlocked.length} blocked by declared local network policy, ${failures.length} failed.`,
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  main().catch((error) => {
    console.error(`External link checker failed: ${errorMessage(error)}`);
    process.exitCode = 1;
  });
}
