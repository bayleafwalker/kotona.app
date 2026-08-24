import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

/**
 * The skills index pins each artifact by digest, and a conformant client MUST
 * reject content whose bytes do not hash to the pinned value. A hand-maintained
 * hash therefore silently breaks the whole discovery surface the moment the
 * artifact is edited, so the index is generated from the artifact instead.
 *
 * Artifact URLs are path-absolute: RFC 3986 resolution against the index URL
 * keeps them correct on whichever host served the index, so the apex and `www`
 * forms cannot disagree.
 */
const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const skillsDirectory = path.join(
  rootDirectory,
  "public/.well-known/agent-skills",
);
const indexPath = path.join(skillsDirectory, "index.json");

const skills = [
  {
    name: "kotona-site-guide",
    type: "skill-md",
    description:
      "Find and cite public project and system notes published at kotona.app.",
    artifact: "kotona-site-guide/SKILL.md",
  },
];

async function buildIndex() {
  const entries = [];

  for (const { name, type, description, artifact } of skills) {
    const bytes = await readFile(path.join(skillsDirectory, artifact));
    const digest = createHash("sha256").update(bytes).digest("hex");
    entries.push({
      name,
      type,
      description,
      url: `/.well-known/agent-skills/${artifact}`,
      digest: `sha256:${digest}`,
    });
  }

  return `${JSON.stringify(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: entries,
    },
    null,
    2,
  )}\n`;
}

const generated = await buildIndex();

if (process.argv.includes("--check")) {
  const published = await readFile(indexPath, "utf8");
  if (published === generated) {
    process.stdout.write(
      "Agent-skills index check passed: every artifact digest matches its bytes.\n",
    );
  } else {
    process.stderr.write(
      "public/.well-known/agent-skills/index.json is stale.\n" +
        "Run `npm run generate:agent-skills` and commit the result.\n",
    );
    process.exitCode = 1;
  }
} else {
  await writeFile(indexPath, generated);
  process.stdout.write("Wrote public/.well-known/agent-skills/index.json\n");
}
