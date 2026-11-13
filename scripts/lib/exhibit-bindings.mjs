import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

/** Build a record of the checked source bindings, not a test-pass receipt. */
export function bindExhibit(root, entry, revision) {
  const binding = entry.data.exhibit;
  if (!binding) {
    if (entry.data.role === "exhibit") {
      throw new Error(`${entry.id}: exhibit is missing its evidence bindings`);
    }
    return null;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(binding.id ?? "")) {
    throw new Error(`${entry.id}: invalid exhibit id`);
  }
  const rootPath = realpathSync(root);
  const artifact = (relative) => {
    if (
      typeof relative !== "string" ||
      !/^(?:src|tests)\/[A-Za-z0-9_./-]+$/.test(relative) ||
      relative.split("/").includes("..")
    ) {
      throw new Error(`${entry.id}: invalid public source path`);
    }
    const resolved = realpathSync(path.join(rootPath, relative));
    if (!resolved.startsWith(`${rootPath}${path.sep}`)) {
      throw new Error(`${entry.id}: source binding escapes the repository`);
    }
    const bytes = readFileSync(resolved);
    return {
      path: relative,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  };
  const tests = binding.tests ?? [];
  if (
    !tests.some((file) => /^tests\/[^/]+\.test\.mjs$/.test(file)) ||
    !tests.some((file) => /^tests\/browser\/.+\.spec\.mjs$/.test(file))
  ) {
    throw new Error(
      `${entry.id}: bind a discovered unit test and a browser presentation test`,
    );
  }
  const fixture = artifact(binding.fixtures);
  const fixtureData = JSON.parse(
    readFileSync(path.join(rootPath, fixture.path), "utf8"),
  );
  const result = {
    id: binding.id,
    note: `/notes/${entry.id}/`,
    sourceRevision: revision,
    implementation: artifact(binding.implementation),
    fixtures: fixture,
    checks: tests.map(artifact),
    claim:
      "Source bindings only. Test results and their scope are recorded separately.",
  };
  if (binding.presentation)
    result.presentation = artifact(binding.presentation);
  if (binding.upstream) {
    if (
      !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(
        binding.upstream.repository ?? "",
      ) ||
      !/^[a-f0-9]{40}$/.test(binding.upstream.revision ?? "") ||
      !/^[A-Za-z0-9_./-]+$/.test(binding.upstream.source ?? "") ||
      binding.upstream.source.split("/").includes("..")
    ) {
      throw new Error(
        `${entry.id}: upstream source requires an immutable revision and a safe source path`,
      );
    }
    if (
      fixtureData.implementation?.revision !== binding.upstream.revision ||
      fixtureData.implementation?.repository !==
        `https://github.com/${binding.upstream.repository}` ||
      fixtureData.fixture?.path !== binding.upstream.source ||
      fixtureData.implementation?.clean !== true ||
      fixtureData.verification?.status !== "passed"
    ) {
      throw new Error(
        `${entry.id}: upstream binding disagrees with a clean, verified trace`,
      );
    }
    result.upstream = binding.upstream;
  }
  return result;
}

export function bindExhibits(root, entries, revision) {
  const ids = new Set();
  return entries.flatMap((entry) => {
    const bound = bindExhibit(root, entry, revision);
    if (!bound) return [];
    if (ids.has(bound.id)) throw new Error(`Duplicate exhibit id: ${bound.id}`);
    ids.add(bound.id);
    return entry.draft ? [] : [bound];
  });
}
