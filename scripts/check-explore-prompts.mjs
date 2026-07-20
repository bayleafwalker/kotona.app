#!/usr/bin/env node

import console from "node:console";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

import { readContentMetadata } from "./lib/content-metadata.mjs";

export const MIN_PROMPT_LENGTH = 80;
export const MAX_PROMPT_LENGTH = 2400;

const defaultRootDirectory = fileURLToPath(new URL("..", import.meta.url));

/**
 * These are deliberately structural, not content-graded. See
 * docs/explore-prompts.md for the editorial contract itself, and the
 * "Enforcement" section for why "every current non-draft note requires
 * explorePrompt" is not yet one of these checks: the backfill across the
 * existing note corpus has not been completed, so that rule cannot be turned
 * on without failing notes that predate the feature.
 *
 * @param {{ id: string; filePath: string; data: Record<string, unknown> }[]} notes
 */
export function explorePromptIssues(notes) {
  const issues = [];
  const promptsBySeenText = new Map();

  for (const note of notes) {
    const prompt = note.data.explorePrompt;

    if (prompt === undefined) continue;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      issues.push(`${note.id}: explorePrompt is empty`);
      continue;
    }

    if (prompt.length < MIN_PROMPT_LENGTH) {
      issues.push(
        `${note.id}: explorePrompt is ${prompt.length} characters, ` +
          `minimum is ${MIN_PROMPT_LENGTH}`,
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      issues.push(
        `${note.id}: explorePrompt is ${prompt.length} characters, ` +
          `maximum is ${MAX_PROMPT_LENGTH}`,
      );
    }

    const normalized = prompt.trim().replace(/\s+/g, " ").toLowerCase();
    const seenIn = promptsBySeenText.get(normalized);

    if (seenIn) {
      issues.push(
        `${note.id}: explorePrompt duplicates the prompt already used by ${seenIn}`,
      );
    } else {
      promptsBySeenText.set(normalized, note.id);
    }
  }

  return issues;
}

function usage() {
  return [
    "Usage: node scripts/check-explore-prompts.mjs [options]",
    "",
    "Options:",
    "  --root DIR   Repository root containing src/content/notes (defaults to this repository)",
    "  -h, --help   Show this help",
  ].join("\n");
}

export function parseCliArgs(argv) {
  let rootDirectory = defaultRootDirectory;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      help = true;
    } else if (argument === "--root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--root requires a value");
      }
      rootDirectory = value;
      index += 1;
    } else if (argument.startsWith("--root=")) {
      rootDirectory = argument.slice("--root=".length);
    } else {
      throw new Error(`unknown argument ${JSON.stringify(argument)}`);
    }
  }

  return { rootDirectory, help };
}

export async function main(argv = process.argv.slice(2)) {
  let options;

  try {
    options = parseCliArgs(argv);
  } catch (error) {
    console.error(`Explore-prompt check could not start: ${error.message}`);
    console.error(usage());
    return 2;
  }

  if (options.help) {
    console.log(usage());
    return 0;
  }

  const notes = readContentMetadata(options.rootDirectory, "notes", {
    draftByDefault: false,
  }).filter((note) => !note.draft);

  const issues = explorePromptIssues(notes);
  const withPrompt = notes.filter(
    (note) => note.data.explorePrompt !== undefined,
  ).length;

  if (issues.length > 0) {
    console.error("Explore-prompt check failed:");
    for (const issue of issues) console.error(`- ${issue}`);
    return 1;
  }

  console.log(
    `Explore-prompt check passed: ${withPrompt}/${notes.length} ` +
      "published notes carry an explorePrompt.",
  );
  return 0;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  process.exitCode = await main();
}
