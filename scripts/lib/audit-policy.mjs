/**
 * Dependency audit policy. `npm audit` has no way to accept one advisory, so
 * a single unfixable finding would otherwise force a choice between a red
 * gate and no gate. This keeps the gate and makes each acceptance explicit:
 * one advisory, one package, a stated reason, and a date by which it must be
 * looked at again.
 */

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

/**
 * Accepted advisories. An entry is a decision, not a suppression list. It
 * names one advisory on one package and records why the deployed site is not
 * exposed. It fails the audit once its review date passes, and when it no
 * longer matches anything, so it cannot outlive its reason.
 *
 * `absentFromBuild` turns the exposure claim into a check: property names and
 * strings from the package's own source that survive minification. After a
 * build, `scripts/check-audit-exposure.mjs` fails if any of them appears in
 * the Worker or client output. `tests/audit-policy.test.mjs` proves each one
 * really occurs in the installed package, so the check cannot pass vacuously.
 *
 * @type {{ id: string, package: string, owner: string, reviewBy: string,
 *   reason: string, exposure: string, absentFromBuild: string[] }[]}
 */
export const ACCEPTED_ADVISORIES = [
  {
    id: "GHSA-fc5q-39xc-vjpf",
    package: "picomatch",
    owner: "site maintainer",
    reviewBy: "2026-12-01",
    reason:
      "No patched release exists: the advisory covers every version through " +
      "4.0.7, the latest. npm's offered fix downgrades Astro by two majors.",
    exposure:
      "The flaw needs an attacker-chosen glob pattern. picomatch arrives " +
      "through astro, vite, tinyglobby, fdir, @astrojs/internal-helpers and " +
      "anymatch (via unstorage). Its importers in this build are Astro's " +
      "asset plugin, its content glob loader and plugin filters, which run " +
      "at build time on patterns from this repository's configuration and " +
      "on this repository's file paths. The one runtime importer, Astro's " +
      "in-memory cache provider, matches request query names against " +
      "configured patterns; this site configures no cache, and the " +
      "provider is not in the built Worker. No picomatch code is present " +
      "in the Worker or client output, which the build check enforces.",
    absentFromBuild: ["noextglob", "nonegate", "POSIX_REGEX_SOURCE"],
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
