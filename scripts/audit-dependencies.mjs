import { spawnSync } from "node:child_process";
import process from "node:process";

import { collectAdvisories, evaluateAudit } from "./lib/audit-policy.mjs";

// npm exits non-zero whenever anything is reported, so the report is read
// from stdout and judged against the policy rather than by exit status.
const audit = spawnSync("npm", ["audit", "--json"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === "win32",
});

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  process.stderr.write(
    `Dependency audit could not be read.\n${audit.stderr || audit.stdout}\n`,
  );
  process.exit(1);
}
if (report.error) {
  process.stderr.write(
    `Dependency audit failed: ${report.error.summary ?? report.error.code}\n`,
  );
  process.exit(1);
}

const { failures, accepted } = evaluateAudit(collectAdvisories(report), {
  today: new Date().toISOString().slice(0, 10),
});

for (const finding of accepted) {
  process.stdout.write(
    `Accepted until ${finding.acceptance.reviewBy}: ${finding.package} ${finding.id} (${finding.severity}). ${finding.acceptance.reason}\n`,
  );
}

if (failures.length > 0) {
  process.stderr.write(
    `Dependency audit failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `Dependency audit passed: no unaccepted advisory at moderate severity or above${accepted.length > 0 ? `; ${accepted.length} accepted` : ""}.\n`,
);
