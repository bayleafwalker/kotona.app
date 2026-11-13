import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import { readContentMetadata } from "./lib/content-metadata.mjs";
import { bindExhibits } from "./lib/exhibit-bindings.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
let revision = process.env.KOTONA_BUILD_REVISION ?? "unknown";
let modified = null;
try {
  if (revision === "unknown") {
    revision = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  }
  modified =
    execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], {
      cwd: root,
      encoding: "utf8",
    }).trim().length > 0;
} catch {
  // Source digests remain available when this is built from an exported tree.
}
const entries = readContentMetadata(root, "notes", { draftByDefault: false });
const exhibits = bindExhibits(root, entries, revision);
if (process.argv.includes("--write")) {
  const output = path.join(root, "public/exhibits");
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  for (const exhibit of exhibits) {
    const directory = path.join(output, exhibit.id);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(directory, "fixtures.json"),
      readFileSync(path.join(root, exhibit.fixtures.path)),
    );
    writeFileSync(
      path.join(directory, "binding.json"),
      `${JSON.stringify({ ...exhibit, workingTreeModified: modified }, null, 2)}\n`,
    );
  }
  writeFileSync(
    path.join(output, "index.json"),
    `${JSON.stringify({ schemaVersion: 1, sourceRevision: revision, workingTreeModified: modified, exhibits }, null, 2)}\n`,
  );
}
process.stdout.write(
  `Exhibit bindings checked: ${exhibits.length} published; implementation, fixtures, unit and browser checks present.\n`,
);
