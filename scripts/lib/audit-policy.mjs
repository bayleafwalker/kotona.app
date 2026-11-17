/**
 * Dependency audit policy. `npm audit` has no way to accept one advisory, so
 * a single unfixable finding would otherwise force a choice between a red
 * gate and no gate. This keeps the gate and makes each acceptance explicit:
 * one advisory, one package, a stated reason, and a date by which it must be
 * looked at again.
 */

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

/**
 * Accepted advisories. An entry is a decision, not a suppression list: it
 * fails the audit once its review date passes, and it fails the audit when
 * it no longer matches anything, so it cannot outlive its reason.
 *
 * @type {{ id: string, package: string, reviewBy: string, reason: string }[]}
 */
export const ACCEPTED_ADVISORIES = [
  {
    id: "GHSA-fc5q-39xc-vjpf",
    package: "picomatch",
    reviewBy: "2026-12-17",
    reason:
      "ReDoS through attacker-supplied extglob patterns. No patched release " +
      "exists (every version through 4.0.7 is affected), and npm's offered " +
      "fix downgrades Astro by two majors. picomatch is absent from the " +
      "built Worker and client bundles; it runs only in build and lint " +
      "tooling, against patterns from this repository's own configuration.",
  },
];

/**
 * Advisories reported by `npm audit --json`, de-duplicated. A package that is
 * vulnerable only through a dependency lists that dependency by name; the
 * advisory itself appears once, on the package it was filed against.
 *
 * @param {{ vulnerabilities?: Record<string, { via: unknown[] }> }} report
 */
export function collectAdvisories(report) {
  const advisories = new Map();
  for (const [name, entry] of Object.entries(report.vulnerabilities ?? {})) {
    for (const via of entry.via) {
      if (typeof via !== "object" || via === null) continue;
      const id = String(via.url ?? "")
        .split("/")
        .at(-1);
      advisories.set(`${id}:${name}`, {
        id,
        package: name,
        severity: via.severity,
        title: via.title,
        url: via.url,
      });
    }
  }
  return [...advisories.values()];
}

/**
 * @param {ReturnType<typeof collectAdvisories>} advisories
 * @param {{ today: string, level?: keyof typeof SEVERITY_RANK,
 *   accepted?: typeof ACCEPTED_ADVISORIES }} options
 */
export function evaluateAudit(
  advisories,
  { today, level = "moderate", accepted = ACCEPTED_ADVISORIES },
) {
  const failures = [];
  const acceptedFindings = [];
  const matched = new Set();

  for (const advisory of advisories) {
    if ((SEVERITY_RANK[advisory.severity] ?? 4) < SEVERITY_RANK[level]) {
      continue;
    }
    const acceptance = accepted.find(
      (entry) => entry.id === advisory.id && entry.package === advisory.package,
    );
    if (!acceptance) {
      failures.push(
        `${advisory.package}: ${advisory.title} (${advisory.severity}) ${advisory.url}`,
      );
      continue;
    }
    matched.add(acceptance);
    if (today > acceptance.reviewBy) {
      failures.push(
        `${advisory.package}: acceptance of ${advisory.id} was due for review on ${acceptance.reviewBy}. Check for a patched release, then renew or remove it.`,
      );
    } else {
      acceptedFindings.push({ ...advisory, acceptance });
    }
  }

  for (const entry of accepted) {
    if (!matched.has(entry)) {
      failures.push(
        `${entry.package}: accepted advisory ${entry.id} is no longer reported. Remove the acceptance.`,
      );
    }
  }

  return { failures, accepted: acceptedFindings };
}
