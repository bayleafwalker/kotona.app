import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const contentDirectories = ["src/content/notes", "src/content/projects"];
const issues = [];

for (const relativeDirectory of contentDirectories) {
  const directory = path.join(root, relativeDirectory);
  for (const filename of await readdir(directory)) {
    if (!/\.mdx?$/.test(filename)) continue;
    const source = await readFile(path.join(directory, filename), "utf8");
    const body = source.replace(/^---[\s\S]*?---\s*/, "");
    let fence = null;
    const hasBodyH1 = body.split("\n").some((line) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
      if (marker) {
        if (!fence) fence = marker.at(0);
        else if (marker.startsWith(fence)) fence = null;
        return false;
      }
      return !fence && /^#\s+/.test(line);
    });
    if (hasBodyH1) {
      issues.push(
        `${relativeDirectory}/${filename}: body contains a level-one heading`,
      );
    }
  }
}

if (issues.length > 0) {
  process.stderr.write(`${issues.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    "Content shape check passed: layouts own every document H1.\n",
  );
}
