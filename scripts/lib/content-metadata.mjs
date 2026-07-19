import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

function contentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return contentFiles(entryPath);
    }

    return /\.mdx?$/.test(entry.name) ? [entryPath] : [];
  });
}

export function readContentMetadata(
  rootDirectory,
  collection,
  { draftByDefault },
) {
  const contentDirectory = path.join(rootDirectory, "src/content", collection);

  return contentFiles(contentDirectory).map((filePath) => {
    const source = readFileSync(filePath, "utf8");
    const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/)?.[1];

    if (!frontmatter) {
      throw new Error(`Missing frontmatter in ${filePath}`);
    }

    const data = parse(frontmatter);
    const draft = typeof data.draft === "boolean" ? data.draft : draftByDefault;
    const id = path
      .relative(contentDirectory, filePath)
      .replaceAll(path.sep, "/")
      .replace(/\.mdx?$/, "")
      .replace(/\/index$/, "");

    return { data, draft, filePath, id };
  });
}
