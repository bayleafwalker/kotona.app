import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import { ACCEPTED_ADVISORIES } from "./lib/audit-policy.mjs";

/**
 * An accepted advisory rests on the claim that the affected package does not
 * reach the deployed site. This reads the built Worker and client scripts and
 * fails if any of that package's recorded signatures is present, so the claim
 * is re-checked on every build instead of being remembered.
 */
const root = fileURLToPath(new URL("..", import.meta.url));
const outputs = ["dist/server", "dist/client"].map((directory) =>
  path.join(root, directory),
);

function scripts(directory) {
  return readdirSync(directory).flatMap((name) => {
    const entry = path.join(directory, name);
    if (statSync(entry).isDirectory()) return scripts(entry);
    return /\.(?:m?js|cjs)$/.test(name) ? [entry] : [];
  });
}

const files = outputs.flatMap((directory) => {
  try {
    return scripts(directory);
  } catch {
    process.stderr.write(
      `Audit exposure check needs a build: ${path.relative(root, directory)} is missing.\n`,
    );
    process.exit(1);
  }
});
if (files.length === 0) {
  process.stderr.write("Audit exposure check found no built scripts.\n");
  process.exit(1);
}

const findings = [];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const advisory of ACCEPTED_ADVISORIES) {
    for (const signature of advisory.absentFromBuild) {
      if (source.includes(signature)) {
        findings.push(
          `${path.relative(root, file)} contains "${signature}" from ${advisory.package} (${advisory.id})`,
        );
      }
    }
  }
}

if (findings.length > 0) {
  process.stderr.write(
    `An accepted advisory's package reaches the build. Its acceptance no longer holds:\n${findings.map((finding) => `- ${finding}`).join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `Audit exposure check passed: ${files.length} built scripts carry no code from ${ACCEPTED_ADVISORIES.map((advisory) => advisory.package).join(", ") || "any accepted package"}.\n`,
);
