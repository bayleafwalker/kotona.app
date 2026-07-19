import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const casesPath = path.join(rootDirectory, "tests/retrieval-cases.json");
const require = createRequire(import.meta.url);
const astroPackagePath = require.resolve("astro/package.json");
const astroPackage = JSON.parse(await readFile(astroPackagePath, "utf8"));
const astroBin = path.resolve(
  path.dirname(astroPackagePath),
  astroPackage.bin.astro,
);

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "did",
  "do",
  "does",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "which",
  "why",
  "with",
]);

function output(value) {
  process.stdout.write(`[retrieval-eval] ${value}\n`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function tokens(value) {
  return (
    value.toLowerCase().match(/[a-z0-9]+(?:[.-][a-z0-9]+)*/g) ?? []
  ).filter((token) => token.length > 1 && !stopWords.has(token));
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

function scoreDocuments(documents, question) {
  const queryTokens = [...new Set(tokens(question))];
  const averageLength =
    documents.reduce((sum, document) => sum + document.tokens.length, 0) /
    documents.length;
  const documentFrequency = new Map(
    queryTokens.map((token) => [
      token,
      documents.filter((document) => document.termCounts.has(token)).length,
    ]),
  );
  const k1 = 1.2;
  const b = 0.75;

  return documents
    .map((document) => {
      let score = 0;
      for (const token of queryTokens) {
        const frequency = document.termCounts.get(token) ?? 0;
        if (frequency === 0) continue;
        const containingDocuments = documentFrequency.get(token) ?? 0;
        const inverseDocumentFrequency = Math.log(
          1 +
            (documents.length - containingDocuments + 0.5) /
              (containingDocuments + 0.5),
        );
        const lengthWeight =
          frequency +
          k1 * (1 - b + b * (document.tokens.length / averageLength));
        score +=
          inverseDocumentFrequency * ((frequency * (k1 + 1)) / lengthWeight);
      }
      return { ...document, score };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.path.localeCompare(right.path),
    );
}

async function loadPublicCorpus(baseUrl) {
  const llmsResponse = await globalThis.fetch(new URL("/llms.txt", baseUrl));
  assert(llmsResponse.ok, `llms.txt returned HTTP ${llmsResponse.status}`);
  const paths = contentPaths(await llmsResponse.text());
  assert(
    paths.length >= 20,
    `Expected at least 20 public documents, found ${paths.length}`,
  );

  return Promise.all(
    paths.map(async (documentPath) => {
      const response = await globalThis.fetch(new URL(documentPath, baseUrl), {
        headers: { Accept: "text/markdown" },
      });
      assert(response.ok, `${documentPath} returned HTTP ${response.status}`);
      const text = await response.text();
      const title = text.match(/^# (.+)$/m)?.[1] ?? "";
      const documentTokens = [
        ...tokens(text),
        ...Array(5).fill(tokens(title)).flat(),
      ];
      const termCounts = new Map();
      for (const token of documentTokens) {
        termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
      }
      return { path: documentPath, text, tokens: documentTokens, termCounts };
    }),
  );
}

async function main() {
  const evaluationCases = JSON.parse(await readFile(casesPath, "utf8"));
  const preview = await startPreview();
  let failure;

  try {
    const documents = await loadPublicCorpus(preview.baseUrl);
    output(
      `loaded ${documents.length} documents through public Markdown responses`,
    );

    for (const evaluationCase of evaluationCases) {
      const ranked = scoreDocuments(documents, evaluationCase.question);
      const rank =
        ranked.findIndex(
          (document) => document.path === evaluationCase.expectedPath,
        ) + 1;
      const expected = ranked[rank - 1];
      assert(
        rank > 0,
        `${evaluationCase.id}: expected document was not discovered`,
      );
      assert(
        rank <= evaluationCase.maxRank,
        `${evaluationCase.id}: expected rank <= ${evaluationCase.maxRank}, got ${rank}; ` +
          `top results: ${ranked
            .slice(0, 3)
            .map((item) => item.path)
            .join(", ")}`,
      );
      for (const phrase of evaluationCase.requiredPhrases) {
        assert(
          expected.text.toLowerCase().includes(phrase.toLowerCase()),
          `${evaluationCase.id}: expected public response to include ${JSON.stringify(phrase)}`,
        );
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
