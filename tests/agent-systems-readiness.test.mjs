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

// These checks protect the maintained record shape, not its factual accuracy.
test("readiness records retain stable IDs and explicit judgments", () => {
  assert.ok(records.length >= 10, "the accepted baseline has ten records");
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
});

test("every assessment resolves its evidence references", () => {
  const definitions = new Map(
    [...body.matchAll(/^\[([^\]]+)\]: (https:\/\/\S+)$/gm)].map(
      ([, label, url]) => [label, url],
    ),
  );

  for (const record of records) {
    const evidence = record.split("**Evidence:**")[1]?.split("**Limit:**")[0];
    const references = [...evidence.matchAll(/\[[^\]]+\]\[([^\]]+)\]/g)];
    assert.ok(references.length > 0, "each record needs primary evidence");
    for (const [, label] of references) {
      assert.ok(definitions.has(label), `unresolved source: ${label}`);
      assert.equal(new URL(definitions.get(label)).protocol, "https:");
    }
  }
});

test("readiness remains distinct from the responsibility map", () => {
  assert.match(body, /\]\(\/notes\/where-agent-tooling-fits\/\)/);
  assert.match(body, /^## Judgment history$/m);
  assert.match(body, /^### \d{4}-\d{2}-\d{2}: /m);
  assert.match(body, /does not report comparative benchmarks/);
});
