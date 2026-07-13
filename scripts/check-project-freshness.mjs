#!/usr/bin/env node

import console from "node:console";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const MAX_VERIFICATION_AGE_DAYS = 90;
export const DEFAULT_PROJECTS_DIR = "src/content/projects";
export const SITE_TIME_ZONE = "Europe/Helsinki";

const REQUIRED_DATE_FIELDS = ["published", "lastRevised", "lastVerified"];
const PROJECT_EXTENSIONS = new Set([".md", ".mdx"]);
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function stripMatchingQuotes(value) {
  const trimmed = value.trim();
  const first = trimmed.at(0);
  const last = trimmed.at(-1);

  if (
    trimmed.length >= 2 &&
    ((first === '"' && last === '"') || (first === "'" && last === "'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function parseDateOnly(value, label = "date") {
  const normalized = stripMatchingQuotes(String(value));
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) {
    throw new Error(
      `${label} must use YYYY-MM-DD, got ${JSON.stringify(value)}`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const milliseconds = Date.UTC(year, month - 1, day);
  const parsed = new Date(milliseconds);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(
      `${label} is not a calendar date, got ${JSON.stringify(value)}`,
    );
  }

  return {
    value: normalized,
    epochDay: Math.floor(milliseconds / MILLISECONDS_PER_DAY),
  };
}

export function parseFrontmatter(source, filePath = "<input>") {
  const normalized = source.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");

  if (lines[0] !== "---") {
    throw new Error(`${filePath}: missing opening frontmatter delimiter`);
  }

  const closingIndex = lines.indexOf("---", 1);
  if (closingIndex === -1) {
    throw new Error(`${filePath}: missing closing frontmatter delimiter`);
  }

  const fields = new Map();

  for (const line of lines.slice(1, closingIndex)) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/.exec(line);
    if (!match) continue;

    const [, key, scalar = ""] = match;
    if (REQUIRED_DATE_FIELDS.includes(key) && fields.has(key)) {
      throw new Error(
        `${filePath}: duplicate frontmatter field ${JSON.stringify(key)}`,
      );
    }
    fields.set(key, scalar);
  }

  return fields;
}

export function checkProjectSource(
  source,
  { filePath = "<input>", asOf, maxAgeDays = MAX_VERIFICATION_AGE_DAYS } = {},
) {
  const issues = [];
  let fields;

  try {
    fields = parseFrontmatter(source, filePath);
  } catch (error) {
    return { filePath, issues: [error.message], ageDays: null };
  }

  const dates = {};
  for (const field of REQUIRED_DATE_FIELDS) {
    if (!fields.has(field) || fields.get(field).trim() === "") {
      issues.push(
        `${filePath}: missing required frontmatter field ${JSON.stringify(field)}`,
      );
      continue;
    }

    try {
      dates[field] = parseDateOnly(fields.get(field), `${filePath}: ${field}`);
    } catch (error) {
      issues.push(error.message);
    }
  }

  if (dates.published && dates.lastRevised) {
    if (dates.published.epochDay > dates.lastRevised.epochDay) {
      issues.push(
        `${filePath}: published (${dates.published.value}) must not be after ` +
          `lastRevised (${dates.lastRevised.value})`,
      );
    }
  }

  if (dates.lastRevised && dates.lastVerified) {
    if (dates.lastRevised.epochDay > dates.lastVerified.epochDay) {
      issues.push(
        `${filePath}: lastRevised (${dates.lastRevised.value}) must not be after ` +
          `lastVerified (${dates.lastVerified.value})`,
      );
    }
  }

  let ageDays = null;
  if (dates.lastVerified) {
    ageDays = asOf.epochDay - dates.lastVerified.epochDay;

    if (ageDays < 0) {
      issues.push(
        `${filePath}: lastVerified (${dates.lastVerified.value}) is after ` +
          `as-of date (${asOf.value})`,
      );
    } else if (ageDays > maxAgeDays) {
      issues.push(
        `${filePath}: lastVerified (${dates.lastVerified.value}) is ${ageDays} days old ` +
          `as of ${asOf.value}; maximum is ${maxAgeDays} days`,
      );
    }
  }

  return { filePath, issues, ageDays };
}

export function siteToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function takeOptionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

export function parseCliArgs(argv) {
  let asOfValue = null;
  let projectsDir = DEFAULT_PROJECTS_DIR;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      help = true;
    } else if (argument === "--as-of") {
      asOfValue = takeOptionValue(argv, index, "--as-of");
      index += 1;
    } else if (argument.startsWith("--as-of=")) {
      asOfValue = argument.slice("--as-of=".length);
    } else if (argument === "--projects-dir") {
      projectsDir = takeOptionValue(argv, index, "--projects-dir");
      index += 1;
    } else if (argument.startsWith("--projects-dir=")) {
      projectsDir = argument.slice("--projects-dir=".length);
    } else {
      throw new Error(`unknown argument ${JSON.stringify(argument)}`);
    }
  }

  const asOf = parseDateOnly(asOfValue ?? siteToday(), "--as-of");
  return { asOf, projectsDir, help };
}

async function discoverProjectFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await discoverProjectFiles(entryPath)));
    } else if (
      entry.isFile() &&
      PROJECT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export async function checkProjectDirectory({ projectsDir, asOf }) {
  const absoluteDirectory = path.resolve(projectsDir);
  const projectFiles = await discoverProjectFiles(absoluteDirectory);

  if (projectFiles.length === 0) {
    return {
      directory: absoluteDirectory,
      fileCount: 0,
      issues: [`${absoluteDirectory}: no project Markdown or MDX files found`],
    };
  }

  const results = await Promise.all(
    projectFiles.map(async (filePath) => {
      const source = await readFile(filePath, "utf8");
      return checkProjectSource(source, { filePath, asOf });
    }),
  );

  return {
    directory: absoluteDirectory,
    fileCount: projectFiles.length,
    issues: results.flatMap((result) => result.issues),
  };
}

function usage() {
  return [
    "Usage: node scripts/check-project-freshness.mjs [options]",
    "",
    "Options:",
    "  --as-of YYYY-MM-DD  Evaluate freshness on this date (defaults to today)",
    "  --projects-dir DIR   Project Markdown directory (defaults to src/content/projects)",
    "  -h, --help           Show this help",
  ].join("\n");
}

export async function main(argv = process.argv.slice(2)) {
  let options;

  try {
    options = parseCliArgs(argv);
  } catch (error) {
    console.error(`Project freshness check could not start: ${error.message}`);
    console.error(usage());
    return 2;
  }

  if (options.help) {
    console.log(usage());
    return 0;
  }

  let report;
  try {
    report = await checkProjectDirectory(options);
  } catch (error) {
    console.error(`Project freshness check could not run: ${error.message}`);
    return 2;
  }

  if (report.issues.length > 0) {
    console.error(
      `Project freshness check failed as of ${options.asOf.value}:`,
    );
    for (const issue of report.issues) console.error(`- ${issue}`);
    return 1;
  }

  console.log(
    `Project freshness check passed: ${report.fileCount} files as of ` +
      `${options.asOf.value} (maximum age ${MAX_VERIFICATION_AGE_DAYS} days).`,
  );
  return 0;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  process.exitCode = await main();
}
