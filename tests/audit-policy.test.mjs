import assert from "node:assert/strict";
import test from "node:test";

import {
  ACCEPTED_ADVISORIES,
  collectAdvisories,
  evaluateAudit,
} from "../scripts/lib/audit-policy.mjs";

const advisory = (overrides = {}) => ({
  id: "GHSA-aaaa-bbbb-cccc",
  package: "example",
  severity: "high",
  title: "Example flaw",
  url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
  ...overrides,
});
const acceptance = {
  id: "GHSA-aaaa-bbbb-cccc",
  package: "example",
  reviewBy: "2026-12-01",
  reason: "No patched release.",
};

test("an advisory reaches the policy once, on the package it was filed against", () => {
  const advisories = collectAdvisories({
    vulnerabilities: {
      example: {
        via: [
          {
            url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
            severity: "high",
            title: "Example flaw",
          },
        ],
      },
      // Vulnerable only because it depends on `example`.
      consumer: { via: ["example"] },
    },
  });

  assert.deepEqual(advisories, [advisory()]);
});

test("an unaccepted advisory fails the audit", () => {
  const { failures, accepted } = evaluateAudit([advisory()], {
    today: "2026-11-17",
    accepted: [],
  });

  assert.equal(accepted.length, 0);
  assert.match(failures[0], /example: Example flaw \(high\)/);
});

test("an acceptance covers only its own advisory and package", () => {
  const { failures, accepted } = evaluateAudit(
    [
      advisory(),
      advisory({ id: "GHSA-zzzz-zzzz-zzzz", title: "Another flaw" }),
      advisory({ package: "other" }),
    ],
    { today: "2026-11-17", accepted: [acceptance] },
  );

  assert.equal(accepted.length, 1);
  assert.equal(failures.length, 2);
});

test("an acceptance lapses after its review date", () => {
  const onTheDay = evaluateAudit([advisory()], {
    today: "2026-12-01",
    accepted: [acceptance],
  });
  assert.deepEqual(onTheDay.failures, []);

  const dayAfter = evaluateAudit([advisory()], {
    today: "2026-12-02",
    accepted: [acceptance],
  });
  assert.match(dayAfter.failures[0], /due for review on 2026-12-01/);
});

test("an acceptance that matches nothing must be removed", () => {
  const { failures } = evaluateAudit([], {
    today: "2026-11-17",
    accepted: [acceptance],
  });

  assert.match(failures[0], /no longer reported\. Remove the acceptance/);
});

test("findings below the gate's severity do not fail it", () => {
  const { failures } = evaluateAudit([advisory({ severity: "low" })], {
    today: "2026-11-17",
    accepted: [],
  });

  assert.deepEqual(failures, []);
});

test("every standing acceptance states a reason and a review date", () => {
  for (const entry of ACCEPTED_ADVISORIES) {
    assert.match(entry.id, /^GHSA(-[a-z0-9]{4}){3}$/);
    assert.match(entry.reviewBy, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.reason.length > 40, `${entry.id} needs a real reason`);
  }
});
