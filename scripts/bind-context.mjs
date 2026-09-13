#!/usr/bin/env node

// Usage: node scripts/bind-context.mjs [record.json]. Binds context.manifest.json
// to concrete content through an uncommitted provider map (CONTEXT_PROVIDERS).
// Exit 2 means something was unresolved or refused.

import { execFileSync } from "node:child_process";
import console from "node:console";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
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

// A hash identifies content; a repository and blob id can also restore it.
export async function bindSource(file) {
  const content = await readFile(file).catch(() => null);
  if (!content) return { path: file, status: "unavailable" };
  const sha256 = createHash("sha256").update(content).digest("hex");
  const [dir, base] = [path.dirname(file), path.basename(file)];
  const blob = git(dir, "rev-parse", `HEAD:./${base}`);
  const bound = { path: file, status: "bound", sha256, custody: "unversioned" };
  if (!blob) return bound;
  const modified = git(dir, "status", "--porcelain", "--", base);
  bound.custody = modified ? "git-modified" : "git";
  const repository = git(dir, "rev-parse", "--show-toplevel");
  return Object.assign(bound, { repository, blob });
}

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

async function main(argv) {
  if (argv.length > 1 || argv[0]?.startsWith("-")) {
    throw new Error("usage: bind-context.mjs [record.json]");
  }
  const at = (file) => path.resolve(ROOT, file);
  const out = argv[0] ?? at(`temp/context-bindings/${Date.now()}.json`);
  const manifest = await readJson(at("context.manifest.json"));
  const providerMap =
    process.env.CONTEXT_PROVIDERS ?? at(".context-providers.json");
  const providers = await readJson(providerMap).catch(() => ({}));
  const standingOf = new Map(manifest.context.map((s) => [s.name, s.standing]));

  const context = await Promise.all(
    manifest.context.map(async ({ name, standing }) => {
      const file = providers[name];
      const bound = file ? await bindSource(file) : { status: "unresolved" };
      return { name, standing, ...bound };
    }),
  );
  const own = async (name) => ({ name, ...(await bindSource(at(name))) });
  const local = await Promise.all(manifest.local.map(own));
  const exceptions = (manifest.exceptions ?? []).map((exception) => ({
    ...exception,
    outcome: classify(exception, standingOf),
  }));
  const problems =
    [...context, ...local].filter((s) => s.status !== "bound").length +
    exceptions.filter((e) => e.outcome.startsWith("refused")).length;
  const repository = { commit: git(ROOT, "rev-parse", "HEAD") };
  const createdAt = new Date().toISOString();
  const record = { schema: "context-binding/v0", createdAt, repository };
  Object.assign(record, { context, local, exceptions, problems });
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`${out}: ${problems} problem(s)`);
  return problems ? 2 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    return 1;
  });
}
