import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

const note = readFileSync(
  new URL(
    "../src/content/notes/agent-systems-what-is-ready-to-rely-on.md",
    import.meta.url,
  ),
  "utf8",
);
const body = note.replace(/^---[\s\S]*?---\s*/, "");
const records = body
  .split(/(?=<a id="as-\d{2}"><\/a>)/)
  .slice(1)
  .map((section) => section.split("\n## ")[0]);

function evidenceDefinitions(markdown) {
  return new Map(
    [...markdown.matchAll(/^\[([^\]]+)\]:\s+(https:\/\/\S+)$/gm)].map(
      ([, label, url]) => [label, url],
    ),
  );
}

function referenceLabels(markdown) {
  return [...markdown.matchAll(/\[[^\]]+\]\[([^\]]+)\]/g)].map(
    ([, label]) => label,
  );
}

// These checks protect the maintained record shape, not its factual accuracy.
// Evidence independence, sufficiency, and maturity remain editorial judgments.
test("readiness records retain stable IDs and explicit judgments", () => {
  const ids = new Set();

  for (const record of records) {
    const id = record.match(/^<a id="(as-\d{2})"><\/a>/)?.[1];
    assert.ok(id, "each assessment needs a stable anchor");
    assert.ok(!ids.has(id), `${id} is duplicated`);
    ids.add(id);
    assert.ok(record.includes(`### ${id.toUpperCase()}:`));
    assert.match(record, /\*\*Maturity:\*\* (Commons|Edge|Art|Unassessed)\n/);
    assert.match(record, /\*\*Confidence:\*\* (High|Medium|Low)\n/);

    const verified = record.match(
      /\*\*Last verified:\*\* (\d{4}-\d{2}-\d{2})\n/,
    )?.[1];
    assert.ok(verified, `${id} needs a verification date`);
    const date = new Date(`${verified}T00:00:00Z`);
    assert.ok(!Number.isNaN(date.getTime()), `${id} has an invalid date`);
    assert.equal(date.toISOString().slice(0, 10), verified);

    for (const field of [
      "Scope",
      "Evidence",
      "Limit",
      "Consequence",
      "Revisit when",
    ]) {
      assert.ok(record.includes(`**${field}:**`), `${id} needs ${field}`);
    }
  }

  for (let number = 1; number <= 11; number += 1) {
    const id = `as-${String(number).padStart(2, "0")}`;
    assert.ok(ids.has(id), `accepted record ${id} must retain its anchor`);
  }
});

test("evidence definitions accept formatter-wrapped URLs", () => {
  const definitions = evidenceDefinitions(
    "[inline]: https://example.org/a\n[wrapped]:\n  https://example.org/b\n",
  );
  assert.equal(definitions.get("inline"), "https://example.org/a");
  assert.equal(definitions.get("wrapped"), "https://example.org/b");
});

test("source parsing includes wrapped links and counterevidence", () => {
  assert.deepEqual(
    referenceLabels(
      "**Evidence:** [a wrapped\nsource][primary]\n\n" +
        "**Counterevidence:** [opposing evidence][opposing]\n",
    ),
    ["primary", "opposing"],
  );
});

test("every assessment retains evidence and all note references resolve", () => {
  const definitions = evidenceDefinitions(body);

  for (const record of records) {
    const evidence = record
      .split("**Evidence:**")[1]
      ?.split(/\*\*(?:Counterevidence|Limit):\*\*/)[0];
    assert.ok(evidence, "each record needs an evidence passage");
    assert.ok(
      referenceLabels(evidence).length > 0,
      "each record needs primary evidence",
    );
  }

  // Resolve references throughout the body, including limits and counterevidence.
  for (const label of referenceLabels(body)) {
    assert.ok(definitions.has(label), `unresolved source: ${label}`);
    assert.equal(new URL(definitions.get(label)).protocol, "https:");
  }
});

test("normative protocol citations do not use moving version aliases", () => {
  const definitions = evidenceDefinitions(body);
  for (const label of ["mcp", "mcp-auth", "a2a"]) {
    assert.ok(definitions.has(label), `missing specification: ${label}`);
    const path = new URL(definitions.get(label)).pathname;
    assert.doesNotMatch(path, /\/(?:latest|main|master)(?:\/|$)/);
    assert.match(path, /\/(?:v\d+\.\d+\.\d+|\d{4}-\d{2}-\d{2})(?:\/|$)/);
  }
});

test("readiness remains distinct from the responsibility map", () => {
  assert.match(body, /\]\(\/notes\/where-agent-tooling-fits\/\)/);
  assert.match(body, /^## Judgment history$/m);
  assert.match(body, /^### \d{4}-\d{2}-\d{2}: /m);
  assert.match(
    body.replace(/\s+/g, " "),
    /does not report comparative benchmarks/,
  );
});
