#!/usr/bin/env node

// Bind context.manifest.json to concrete content for one agent run. Paths come
// from an uncommitted provider map (CONTEXT_PROVIDERS); --against <record> lists
// what changed since that run. Exit 2: something unresolved or refused.

import { execFileSync } from "node:child_process";
import console from "node:console";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const STANDINGS = new Set(["rule", "default", "knowledge", "option"]);

// No linker composes prose, so outcomes are never inferred: local may narrow
// anything and replace a default; the rest is refused, not settled by order.
export function classify({ target, effect }, standingOf) {
  const standing = standingOf.get(String(target).split("#")[0]);
  if (!STANDINGS.has(standing)) return "refused: target has no known standing";
  if (effect === "narrow") return "narrowed";
  if (effect === "replace" && standing === "default") return "replaced";
  return `refused: local may not ${effect} a ${standing}`;
}

function git(dir, ...args) {
  try {
    const out = execFileSync("git", ["-C", dir, ...args], { stdio: "pipe" });
    return out.toString().trim() || null;
  } catch {
    return null;
  }
}

export async function bindSource(file) {
  const content = await readFile(file).catch(() => null);
  if (!content) return { path: file, status: "unavailable" };
  const [dir, base] = [path.dirname(file), path.basename(file)];
  const commit = git(dir, "log", "-1", "--format=%H", "--", base);
  const dirty = commit && git(dir, "status", "--porcelain", "--", base);
  const sha256 = createHash("sha256").update(content).digest("hex");
  const custody = commit ? (dirty ? "git-modified" : "git") : "unversioned";
  return { path: file, status: "bound", sha256, custody, commit };
}

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

async function main(argv) {
  const option = (name) => argv.includes(name) && argv[argv.indexOf(name) + 1];
  const out = option("--out") || `temp/context-bindings/${Date.now()}.json`;
  const manifest = await readJson("context.manifest.json");
  const providers = await readJson(
    process.env.CONTEXT_PROVIDERS ?? ".context-providers.json",
  ).catch(() => ({}));
  const standingOf = new Map(manifest.context.map((s) => [s.name, s.standing]));

  const context = await Promise.all(
    manifest.context.map(async ({ name, standing }) => {
      const file = providers[name];
      const bound = file ? await bindSource(file) : { status: "unresolved" };
      return { name, standing, ...bound };
    }),
  );
  const local = await Promise.all(manifest.local.map((f) => bindSource(f)));
  const exceptions = (manifest.exceptions ?? []).map((exception) => ({
    ...exception,
    outcome: classify(exception, standingOf),
  }));
  const sources = [...context, ...local];
  const problems =
    sources.filter((s) => s.status !== "bound").length +
    exceptions.filter((e) => e.outcome.startsWith("refused")).length;
  const repository = { commit: git(".", "rev-parse", "HEAD") };
  const createdAt = new Date().toISOString();
  const record = { schema: "context-binding/v0", createdAt, repository };
  Object.assign(record, { context, local, exceptions, problems });
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`${out}: ${problems} problem(s)`);

  if (option("--against")) {
    const before = await readJson(option("--against"));
    const key = (s) => s.name ?? s.path;
    const earlier = [...before.context, ...before.local];
    const bound = new Map(earlier.map((s) => [key(s), s]));
    const short = (s) => s?.sha256?.slice(0, 12) ?? s?.status ?? "absent";
    for (const source of sources) {
      const was = bound.get(key(source));
      if (was?.sha256 === source.sha256) continue;
      console.log(`${key(source)} bound: ${short(was)} now: ${short(source)}`);
    }
  }
  return problems ? 2 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
