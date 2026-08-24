import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { rankReferences } from "../src/lib/reference-ranking.js";

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const casesPath = path.join(rootDirectory, "tests/retrieval-cases.json");
const require = createRequire(import.meta.url);
const astroPackagePath = require.resolve("astro/package.json");
const astroPackage = JSON.parse(await readFile(astroPackagePath, "utf8"));
const astroBin = path.resolve(
  path.dirname(astroPackagePath),
  astroPackage.bin.astro,
);

function output(value) {
  process.stdout.write(`[retrieval-eval] ${value}\n`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object", "Could not allocate a port");
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

async function startPreview() {
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}/`;
  const detached = process.platform !== "win32";
  const child = spawn(
    process.execPath,
    [astroBin, "preview", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: rootDirectory,
      detached,
      env: { ...process.env, CI: process.env.CI ?? "1", NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs = `${logs}${chunk}`.slice(-20_000);
  });
  child.stderr.on("data", (chunk) => {
    logs = `${logs}${chunk}`.slice(-20_000);
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Astro preview exited before readiness:\n${logs}`);
    }
    try {
      const response = await globalThis.fetch(baseUrl, {
        signal: globalThis.AbortSignal.timeout(1_000),
      });
      if (response.status < 500)
        return { baseUrl, child, detached, logs: () => logs };
    } catch {
      // Preview is still starting.
    }
    await delay(100);
  }
  throw new Error(`Astro preview did not become ready:\n${logs}`);
}

async function stopPreview({ child, detached }) {
  if (!child.pid || child.exitCode !== null) return;
  const stopped = new Promise((resolve) => child.once("exit", resolve));
  try {
    if (detached) process.kill(-child.pid, "SIGTERM");
    else child.kill("SIGTERM");
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
  const graceful = await Promise.race([
    stopped.then(() => true),
    delay(5_000).then(() => false),
  ]);
  if (!graceful && child.pid) {
    if (detached) process.kill(-child.pid, "SIGKILL");
    else child.kill("SIGKILL");
    await stopped;
  }
}

function contentPaths(llmsText) {
  return [
    ...new Set(
      [
        ...llmsText.matchAll(
          /https:\/\/kotona\.app(\/(?:notes|projects)\/[^)\s]+\/)/g,
        ),
      ].map((match) => match[1]),
    ),
  ].sort();
}

async function loadPublicCorpus(baseUrl) {
  const llmsResponse = await globalThis.fetch(new URL("/llms.txt", baseUrl));
  assert(llmsResponse.ok, `llms.txt returned HTTP ${llmsResponse.status}`);
  const paths = contentPaths(await llmsResponse.text());
  assert(
    paths.length >= 20,
    `Expected at least 20 public documents, found ${paths.length}`,
  );

  const graphResponse = await globalThis.fetch(
    new URL("/knowledge.json", baseUrl),
  );
  assert(
    graphResponse.ok,
    `knowledge.json returned HTTP ${graphResponse.status}`,
  );
  const graph = await graphResponse.json();
  const graphPaths = new Set(graph.nodes.map((node) => node.href));
  assert(
    graphPaths.size === graph.nodes.length,
    "knowledge.json contains duplicate node paths",
  );
  for (const documentPath of paths) {
    assert(
      graphPaths.has(documentPath),
      `knowledge.json omitted public document ${documentPath}`,
    );
  }
  assert(
    graphPaths.size === paths.length,
    `knowledge.json and llms.txt disagree: ${graphPaths.size} graph nodes, ${paths.length} documents`,
  );

  // The three public surfaces project one identity set.
  const indexResponse = await globalThis.fetch(
    new URL("/reference-index.json", baseUrl),
  );
  assert(
    indexResponse.ok,
    `reference-index.json returned HTTP ${indexResponse.status}`,
  );
  const index = await indexResponse.json();
  const indexPaths = new Set(
    index.documents.map((document) => new URL(document.url).pathname),
  );
  assert(
    indexPaths.size === index.documents.length,
    "reference-index.json contains duplicate documents",
  );
  assert(
    indexPaths.size === paths.length,
    `reference-index.json and llms.txt disagree: ${indexPaths.size} entries, ${paths.length} documents`,
  );
  for (const documentPath of paths) {
    assert(
      indexPaths.has(documentPath),
      `reference-index.json omitted public document ${documentPath}`,
    );
  }

  const byPath = new Map(
    index.documents.map((document) => [
      new URL(document.url).pathname,
      document,
    ]),
  );

  // The corpus is assembled the way an external client would assemble it:
  // catalog metadata plus the public Markdown body, over HTTP only.
  return Promise.all(
    paths.map(async (documentPath) => {
      const response = await globalThis.fetch(new URL(documentPath, baseUrl), {
        headers: { Accept: "text/markdown" },
      });
      assert(response.ok, `${documentPath} returned HTTP ${response.status}`);
      const text = await response.text();
      const entry = byPath.get(documentPath);
      assert(entry, `${documentPath} is missing from reference-index.json`);

      return {
        id: entry.id,
        type: entry.type,
        path: documentPath,
        title: entry.title,
        summary: entry.summary,
        area: entry.classification.area,
        role: entry.classification.role,
        claimPosture: entry.classification.claimPosture,
        lifecycle: entry.classification.lifecycle,
        tags: entry.classification.tags,
        supersededBy: entry.supersededBy?.map((successor) => successor.id),
        discoverFor: entry.reference?.discoverFor,
        establishes: entry.reference?.establishes,
        // The prelude repeats catalog metadata; scoring it again would count
        // curated phrases twice and let a long prelude outweigh a body.
        text: text.replace(/^---\n[\s\S]*?\n---\n/, ""),
      };
    }),
  );
}

async function main() {
  const evaluationCases = JSON.parse(await readFile(casesPath, "utf8"));
  const explain = process.argv.slice(2).join(" ").trim();
  const preview = await startPreview();
  let failure;

  try {
    const documents = await loadPublicCorpus(preview.baseUrl);
    output(
      `loaded ${documents.length} documents through public Markdown responses`,
    );

    // `npm run test:retrieval -- "a question"` shows what the shipped ranking
    // does with one query, so a new case is written against observed behaviour
    // rather than guessed at.
    if (explain) {
      // `EXPLAIN_LIMIT` widens the window when a case is about a document the
      // default ten results do not reach.
      const limit = Number(process.env.EXPLAIN_LIMIT ?? 10);
      for (const [index, result] of rankReferences(documents, explain)
        .slice(0, limit)
        .entries()) {
        const reasons = result.reasons
          .map((reason) => `${reason.field}=${reason.value}`)
          .join("; ");
        output(
          `${index + 1}. ${result.document.path} (${result.score.toFixed(2)}) ${reasons}`,
        );
      }
      return;
    }

    for (const evaluationCase of evaluationCases) {
      const ranked = rankReferences(documents, evaluationCase.question);
      const paths = ranked.map((result) => result.document.path);

      // A case either pins one document to a rank, or names the documents any
      // of which would be a good answer within the top k. Vague intent has no
      // single correct result, and demanding one would encode a wrong claim.
      let rank;
      let selected;

      if (evaluationCase.expectedPath) {
        rank = paths.indexOf(evaluationCase.expectedPath) + 1;
        assert(
          rank > 0,
          `${evaluationCase.id}: expected document was not discovered`,
        );
        assert(
          rank <= evaluationCase.maxRank,
          `${evaluationCase.id}: expected rank <= ${evaluationCase.maxRank}, got ${rank}; ` +
            `top results: ${paths.slice(0, 3).join(", ")}`,
        );
        selected = ranked[rank - 1];
      } else {
        const topK = paths.slice(0, evaluationCase.topK);
        const hitIndex = topK.findIndex((path) =>
          evaluationCase.acceptablePaths.includes(path),
        );
        assert(
          hitIndex > -1,
          `${evaluationCase.id}: no acceptable document in top ${evaluationCase.topK}; ` +
            `got: ${topK.join(", ")}`,
        );
        rank = hitIndex + 1;
        selected = ranked[hitIndex];
      }

      // Lifecycle policy: a case may require that nothing historical leads,
      // or that history is exactly what a historical question retrieves.
      for (const path of evaluationCase.mustNotPrecede ?? []) {
        const position = paths.indexOf(path);
        assert(
          position === -1 || position + 1 > rank,
          `${evaluationCase.id}: ${path} outranked the expected document`,
        );
      }

      // A question about whether a superseded claim still holds is only
      // answered if the successor is retrievable too. The predecessor leading
      // is correct -- it is the document named -- but a reader who stops at
      // the visible window must still be handed where the reasoning went.
      if (evaluationCase.alsoWithin) {
        const window = paths.slice(0, evaluationCase.alsoWithin.topK);
        for (const required of evaluationCase.alsoWithin.paths) {
          assert(
            window.includes(required),
            `${evaluationCase.id}: ${required} was not in the top ${evaluationCase.alsoWithin.topK}; ` +
              `got: ${window.join(", ")}`,
          );
        }
      }

      const text = selected.document.text;
      for (const phrase of evaluationCase.requiredPhrases ?? []) {
        assert(
          text.toLowerCase().includes(phrase.toLowerCase()),
          `${evaluationCase.id}: expected public response to include ${JSON.stringify(phrase)}`,
        );
      }
      // Prompt separation: portable task language must not reach the neutral
      // reference representation, and must remain retrievable on its own
      // resource with the lifecycle that bounds it.
      for (const phrase of evaluationCase.forbiddenPhrases ?? []) {
        assert(
          !text.toLowerCase().includes(phrase.toLowerCase()),
          `${evaluationCase.id}: reference Markdown must not include ${JSON.stringify(phrase)}`,
        );
      }
      if (evaluationCase.reasonFields) {
        const fields = new Set(selected.reasons.map((reason) => reason.field));
        for (const field of evaluationCase.reasonFields) {
          assert(
            fields.has(field),
            `${evaluationCase.id}: expected a ${field} match reason, got ${[...fields].join(", ") || "none"}`,
          );
        }
      }
      if (evaluationCase.promptPhrases) {
        const promptUrl = new URL(
          `${selected.document.path.replace(/\/$/, "")}.prompt.txt`,
          preview.baseUrl,
        );
        const promptResponse = await globalThis.fetch(promptUrl);
        assert(
          promptResponse.ok,
          `${evaluationCase.id}: prompt resource returned HTTP ${promptResponse.status}`,
        );
        const promptText = (await promptResponse.text()).toLowerCase();
        for (const phrase of evaluationCase.promptPhrases) {
          assert(
            promptText.includes(phrase.toLowerCase()),
            `${evaluationCase.id}: prompt resource must include ${JSON.stringify(phrase)}`,
          );
        }
      }
      output(`PASS ${evaluationCase.id} (rank ${rank})`);
    }
  } catch (error) {
    failure = error;
  } finally {
    await stopPreview(preview);
  }

  if (failure) {
    process.stderr.write(`${preview.logs()}\n`);
    throw failure;
  }
  output(`all ${evaluationCases.length} retrieval cases passed`);
}

await main().catch((error) => {
  process.stderr.write(`[retrieval-eval] FAIL ${error.stack ?? error}\n`);
  process.exitCode = 1;
});
