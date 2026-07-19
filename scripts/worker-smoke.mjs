import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const astroPackagePath = require.resolve("astro/package.json");
const astroPackage = JSON.parse(await readFile(astroPackagePath, "utf8"));
const astroBin = path.resolve(
  path.dirname(astroPackagePath),
  astroPackage.bin.astro,
);

const workerLogLimit = 40_000;
let worker;
let workerExit;
let stopPromise;
let workerLogs = "";
let workerSpawnError;

function output(value) {
  process.stdout.write(`[worker-smoke] ${value}\n`);
}

function appendWorkerLog(chunk) {
  workerLogs = `${workerLogs}${chunk}`.slice(-workerLogLimit);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, label) {
  assert(
    actual === expected,
    `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

function assertIncludes(value, expected, label) {
  assert(
    value.includes(expected),
    `${label}: expected ${JSON.stringify(value)} to include ${JSON.stringify(expected)}`,
  );
}

function assertContentType(response, expected) {
  const actual = response.headers.get("content-type") ?? "";
  assert(
    actual.toLowerCase().startsWith(expected.toLowerCase()),
    `${response.url} content type: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

function assertVaryAccept(response) {
  const vary = (response.headers.get("vary") ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase());
  assert(vary.includes("accept"), `${response.url} does not vary on Accept`);
}

function canonicalFromHtml(html) {
  return html.match(
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i,
  )?.[1];
}

function structuredDataFromHtml(html) {
  const source = html.match(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  )?.[1];
  assert(source, "Page does not include JSON-LD structured data");
  return JSON.parse(source);
}

function locationPath(response, baseUrl) {
  const location = response.headers.get("location");
  assert(location, `${response.url} redirect did not include Location`);
  const target = new URL(location, baseUrl);
  return `${target.pathname}${target.search}`;
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(
    address && typeof address === "object",
    "Could not allocate a local port",
  );
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

function startWorker(port) {
  const detached = process.platform !== "win32";
  worker = spawn(
    process.execPath,
    [astroBin, "preview", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: rootDirectory,
      detached,
      env: {
        ...process.env,
        CI: process.env.CI ?? "1",
        NO_COLOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  worker.stdout.on("data", appendWorkerLog);
  worker.stderr.on("data", appendWorkerLog);
  workerExit = new Promise((resolve) => {
    worker.once("error", (error) => {
      workerSpawnError = error;
      appendWorkerLog(`Astro preview spawn error: ${error.stack ?? error}\n`);
      resolve({ code: null, signal: null });
    });
    worker.once("exit", (code, signal) => resolve({ code, signal }));
  });
  return detached;
}

function signalWorker(signal, detached) {
  if (!worker?.pid) {
    return;
  }

  try {
    if (detached) {
      process.kill(-worker.pid, signal);
    } else {
      worker.kill(signal);
    }
  } catch (error) {
    if (error?.code !== "ESRCH") {
      throw error;
    }
  }
}

function stopWorker(detached) {
  if (stopPromise) {
    return stopPromise;
  }

  stopPromise = (async () => {
    signalWorker("SIGTERM", detached);
    const stopped = await Promise.race([
      workerExit.then(() => true),
      delay(5_000).then(() => false),
    ]);

    if (!stopped) {
      signalWorker("SIGKILL", detached);
      await workerExit;
    }
  })();

  return stopPromise;
}

async function waitForReady(baseUrl) {
  const deadline = Date.now() + 30_000;
  let lastError;

  while (Date.now() < deadline) {
    if (workerSpawnError) {
      throw workerSpawnError;
    }

    if (worker.exitCode !== null) {
      const result = await workerExit;
      throw new Error(
        `Astro preview exited before readiness (code=${result.code}, signal=${result.signal})`,
      );
    }

    try {
      const response = await globalThis.fetch(baseUrl, {
        redirect: "manual",
        signal: globalThis.AbortSignal.timeout(1_000),
      });
      if (response.status < 500) {
        return;
      }
      lastError = new Error(`Readiness returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(100);
  }

  throw new Error(
    `Astro preview was not ready within 30s: ${lastError?.message}`,
  );
}

async function runChecks(baseUrl) {
  const request = async (
    pathname,
    { method = "GET", accept, redirect = "manual" } = {},
  ) => {
    const headers = accept ? { Accept: accept } : undefined;
    const response = await globalThis.fetch(new URL(pathname, baseUrl), {
      method,
      headers,
      redirect,
      signal: globalThis.AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    return { response, body };
  };

  const check = async (name, callback) => {
    try {
      await callback();
      output(`PASS ${name}`);
    } catch (error) {
      throw new Error(`${name}: ${error.message}`, { cause: error });
    }
  };

  await check("native and middleware redirects", async () => {
    const redirects = [
      ["GET", "/case-studies", "/projects/"],
      ["GET", "/case-studies/", "/projects/"],
      ["GET", "/case-studies/gitops-cluster", "/projects/gitops-cluster/"],
      ["HEAD", "/case-studies/gitops-cluster/", "/projects/gitops-cluster/"],
      [
        "GET",
        "/case-studies/gitops-cluster/?ref=smoke",
        "/projects/gitops-cluster/?ref=smoke",
      ],
      ["GET", "/writing/?ref=smoke", "/notes/?ref=smoke"],
    ];

    for (const [method, pathname, expectedLocation] of redirects) {
      const { response, body } = await request(pathname, { method });
      assertEqual(response.status, 301, `${method} ${pathname} status`);
      assertEqual(
        locationPath(response, baseUrl),
        expectedLocation,
        `${method} ${pathname} location`,
      );
      if (method === "HEAD") {
        assertEqual(body, "", `${method} ${pathname} body`);
      }
    }
  });

  await check("canonical trailing-slash policy", async () => {
    const noSlash = await request("/about");
    assertEqual(noSlash.response.status, 301, "/about status");
    assertEqual(
      locationPath(noSlash.response, baseUrl),
      "/about/",
      "/about location",
    );

    const canonical = await request("/about/?utm_source=smoke");
    assertEqual(canonical.response.status, 200, "/about/ status");
    assertContentType(canonical.response, "text/html");
    assertEqual(
      canonicalFromHtml(canonical.body),
      "https://kotona.app/about/",
      "/about/ canonical",
    );
  });

  await check("security headers and CSP nonces", async () => {
    const page = await request("/notes/schema-on-split/");
    const policy = page.response.headers.get("content-security-policy") ?? "";
    const nonce = policy.match(/'nonce-([^']+)'/)?.[1];

    assert(nonce, "CSP does not include a nonce");
    assertIncludes(
      policy,
      "https://static.cloudflareinsights.com",
      "CSP analytics script origin",
    );
    assertIncludes(policy, "frame-ancestors 'none'", "CSP frame policy");
    assert(
      !policy.includes("'unsafe-inline'"),
      "Production CSP allows unsafe inline content",
    );
    assertEqual(
      page.response.headers.get("strict-transport-security"),
      "max-age=63072000; includeSubDomains; preload",
      "HSTS",
    );
    assertEqual(
      page.response.headers.get("x-content-type-options"),
      "nosniff",
      "content type protection",
    );
    assertEqual(
      page.response.headers.get("referrer-policy"),
      "strict-origin-when-cross-origin",
      "referrer policy",
    );
    assert(
      /^[0-9a-f]{40}$/.test(
        page.response.headers.get("x-kotona-revision") ?? "",
      ),
      "Response does not expose a source revision",
    );

    const scriptNonces = [
      ...page.body.matchAll(/<script\b[^>]*\bnonce=["']([^"']+)["']/gi),
    ].map((match) => match[1]);
    assert(scriptNonces.length >= 2, "Expected JSON-LD and analytics nonces");
    assert(
      scriptNonces.every((scriptNonce) => scriptNonce === nonce),
      "A script nonce does not match the response CSP",
    );
  });

  await check("evidence, metadata titles, and content structure", async () => {
    const project = await request("/projects/household-operating-platform/");
    assertIncludes(project.body, 'id="evidence-title"', "project evidence");
    assertIncludes(
      project.body,
      "v0.1.0 operating-view release",
      "latest proof",
    );
    const projectMarkdown = await request(
      "/projects/household-operating-platform/",
      { accept: "text/markdown" },
    );
    assertIncludes(projectMarkdown.body, "## Evidence", "Markdown evidence");
    assertIncludes(
      projectMarkdown.body,
      "Known limitation",
      "Markdown evidence limitation",
    );
    assertIncludes(
      projectMarkdown.body,
      "[ Source repository ](https://github.com/bayleafwalker/homelab-analytics)",
      "Markdown proof link",
    );

    const projectData = structuredDataFromHtml(project.body);
    const projectTypes = projectData["@graph"].map((item) => item["@type"]);
    assert(
      projectTypes.includes("Article"),
      "Project Article schema is missing",
    );
    assert(
      projectTypes.includes("BreadcrumbList"),
      "Project BreadcrumbList schema is missing",
    );
    const projectArticle = projectData["@graph"].find(
      (item) => item["@type"] === "Article",
    );
    assertEqual(
      projectArticle.author.url,
      "https://kotona.app/about/",
      "Article author URL",
    );

    const note = await request("/notes/the-ref-nobody-adds/");
    assertIncludes(
      note.body,
      "<title>Why agent workflows ignore documentation references | kotona.app</title>",
      "SEO title",
    );
    assertIncludes(note.body, ">The ref nobody adds</h1>", "editorial heading");
    assertIncludes(
      note.body,
      'content="Agents cannot use documents they are never shown | kotona.app"',
      "social title",
    );
    assertIncludes(note.body, "Lifecycle: current", "current note lifecycle");

    const archivedNote = await request(
      "/notes/a-gitops-rollback-needs-time-to-reach-git/",
      { accept: "text/markdown" },
    );
    assertIncludes(
      archivedNote.body,
      "Lifecycle: archived",
      "archived note lifecycle",
    );
    assertIncludes(
      archivedNote.body,
      "Preserved as a historical incident lesson",
      "archived note reason",
    );

    const about = await request("/about/");
    const aboutTypes = structuredDataFromHtml(about.body)["@graph"].map(
      (item) => item["@type"],
    );
    assert(aboutTypes.includes("ProfilePage"), "ProfilePage schema is missing");

    const home = await request("/");
    const homeTypes = structuredDataFromHtml(home.body)["@graph"].map(
      (item) => item["@type"],
    );
    assert(homeTypes.includes("WebSite"), "WebSite schema is missing");
    assertIncludes(
      home.body,
      'href="/notes/the-workshop-is-learning-my-accent/"',
      "editorial model link",
    );
  });

  await check("Markdown GET and HEAD negotiation", async () => {
    const markdown = await request("/notes/schema-on-split/", {
      accept: "text/markdown",
    });
    assertEqual(markdown.response.status, 200, "Markdown GET status");
    assertContentType(markdown.response, "text/markdown");
    assertVaryAccept(markdown.response);
    assertIncludes(markdown.body, "# Schema on split", "Markdown title");
    assertIncludes(
      markdown.body,
      "| Layer | Contract | Failure mode |",
      "Markdown table",
    );
    assertIncludes(markdown.body, "```text", "Markdown fenced code");
    assert(!/<html\b/i.test(markdown.body), "Markdown contains HTML chrome");
    assert(
      Number(markdown.response.headers.get("x-markdown-tokens")) > 0,
      "Markdown token count is missing",
    );
    assert(
      !markdown.response.headers.has("etag"),
      "Markdown retained an upstream ETag",
    );
    const contentLength = markdown.response.headers.get("content-length");
    if (contentLength !== null) {
      assertEqual(
        Number(contentLength),
        Buffer.byteLength(markdown.body),
        "Markdown Content-Length",
      );
    }

    const head = await request("/notes/schema-on-split/", {
      method: "HEAD",
      accept: "text/markdown",
    });
    assertEqual(head.response.status, 200, "Markdown HEAD status");
    assertContentType(head.response, "text/markdown");
    assertVaryAccept(head.response);
    assertEqual(head.body, "", "Markdown HEAD body");

    const rejected = await request("/notes/schema-on-split/", {
      accept: "text/markdown;q=0, text/html;q=1",
    });
    assertEqual(rejected.response.status, 200, "q=0 status");
    assertContentType(rejected.response, "text/html");
    assertVaryAccept(rejected.response);

    const ordered = await request(
      "/notes/the-missing-layer-is-binding-not-intelligence/",
      { accept: "text/markdown" },
    );
    assertIncludes(
      ordered.body,
      "1. `actionq run` starts from a named work item",
      "Markdown ordered-list start",
    );
    assertIncludes(
      ordered.body,
      "9. The claim is closed, resumed, or deferred",
      "Markdown ordered-list end",
    );
  });

  await check("404 status and metadata", async () => {
    for (const pathname of ["/not-here/", "/notes/not-here/"]) {
      const missing = await request(pathname);
      assertEqual(missing.response.status, 404, `${pathname} status`);
      assertContentType(missing.response, "text/html");
      assert(
        /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(
          missing.body,
        ),
        `${pathname} is missing noindex`,
      );
      assert(
        !/<link\s+rel=["']canonical["']/i.test(missing.body),
        `${pathname} has a canonical URL`,
      );
      assert(
        !/<meta\s+property=["']og:url["']/i.test(missing.body),
        `${pathname} has an Open Graph URL`,
      );
    }

    const markdown = await request("/notes/not-here/", {
      accept: "text/markdown",
    });
    assertEqual(markdown.response.status, 404, "Markdown 404 status");
    assertContentType(markdown.response, "text/markdown");
    assertIncludes(markdown.body, "# That page is not here.", "Markdown 404");

    const head = await request("/notes/not-here/", {
      method: "HEAD",
      accept: "text/markdown",
    });
    assertEqual(head.response.status, 404, "Markdown 404 HEAD status");
    assertContentType(head.response, "text/markdown");
    assertEqual(head.body, "", "Markdown 404 HEAD body");
  });

  await check("sitemap inventory and canonical pages", async () => {
    const sitemapIndex = await request("/sitemap-index.xml", {
      accept: "text/markdown",
    });
    assertEqual(sitemapIndex.response.status, 200, "sitemap index status");
    assertContentType(sitemapIndex.response, "application/xml");
    assertIncludes(
      sitemapIndex.body,
      "https://kotona.app/sitemap-0.xml",
      "sitemap index",
    );

    const sitemap = await request("/sitemap-0.xml", {
      accept: "text/markdown",
    });
    assertEqual(sitemap.response.status, 200, "sitemap status");
    assertContentType(sitemap.response, "application/xml");
    assertIncludes(
      sitemap.body,
      "https://kotona.app/notes/schema-on-split/",
      "sitemap note",
    );
    assertIncludes(
      sitemap.body,
      "https://kotona.app/projects/gitops-cluster/",
      "sitemap project",
    );
    assert(
      !sitemap.body.includes("case-studies"),
      "sitemap contains a redirect",
    );
    assert(!sitemap.body.includes("/404"), "sitemap contains the 404 page");

    const locations = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    assert(
      locations.length >= 20,
      "sitemap unexpectedly contains fewer than 20 pages",
    );
    assertEqual(
      new Set(locations).size,
      locations.length,
      "sitemap unique URL count",
    );

    await Promise.all(
      locations.map(async (location) => {
        const publicUrl = new URL(location);
        assertEqual(publicUrl.origin, "https://kotona.app", "sitemap origin");
        const page = await request(publicUrl.pathname);
        assertEqual(page.response.status, 200, `${publicUrl.pathname} status`);
        assertContentType(page.response, "text/html");
        assertEqual(
          canonicalFromHtml(page.body),
          location,
          `${publicUrl.pathname} canonical`,
        );
      }),
    );
  });

  await check("feed and discovery endpoints", async () => {
    const feed = await request("/rss.xml", { accept: "text/markdown" });
    assertEqual(feed.response.status, 200, "RSS status");
    assertContentType(feed.response, "application/xml");
    assert(/<rss\b/i.test(feed.body), "RSS root element is missing");
    assert(/<item>/i.test(feed.body), "RSS contains no items");

    const feedHead = await request("/rss.xml", {
      method: "HEAD",
      accept: "text/markdown",
    });
    assertEqual(feedHead.response.status, 200, "RSS HEAD status");
    assertContentType(feedHead.response, "application/xml");
    assertEqual(feedHead.body, "", "RSS HEAD body");

    const llms = await request("/llms.txt");
    assertEqual(llms.response.status, 200, "llms.txt status");
    assertContentType(llms.response, "text/markdown");
    assertIncludes(llms.body, "# kotona.app", "llms.txt heading");
    assertIncludes(llms.body, "(archived; archival)", "llms.txt lifecycle");

    const version = await request("/version.json");
    assertEqual(version.response.status, 200, "version endpoint status");
    assertContentType(version.response, "application/json");
    const versionDocument = JSON.parse(version.body);
    assert(
      /^[0-9a-f]{40}$/.test(versionDocument.revision),
      "version endpoint revision is not a commit SHA",
    );
    assertEqual(
      versionDocument.source,
      `https://github.com/bayleafwalker/kotona.app/commit/${versionDocument.revision}`,
      "version endpoint source",
    );

    const robots = await request("/robots.txt");
    assertEqual(robots.response.status, 200, "robots.txt status");
    assertContentType(robots.response, "text/plain");
    assertIncludes(
      robots.body,
      "https://kotona.app/sitemap-index.xml",
      "robots.txt sitemap",
    );
  });
}

async function main() {
  for (const relativePath of [
    "dist/server/entry.mjs",
    "dist/client/sitemap-index.xml",
    "dist/client/sitemap-0.xml",
  ]) {
    try {
      await access(path.join(rootDirectory, relativePath));
    } catch {
      throw new Error(`Missing ${relativePath}; run npm run build first`);
    }
  }

  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}/`;
  const detached = startWorker(port);
  let smokeError;

  const stopForSignal = (signal, exitCode) => {
    void stopWorker(detached).finally(() => process.exit(exitCode));
    output(`received ${signal}; stopping Astro preview`);
  };
  process.once("SIGINT", () => stopForSignal("SIGINT", 130));
  process.once("SIGTERM", () => stopForSignal("SIGTERM", 143));

  try {
    output(`starting Astro preview on ${baseUrl}`);
    await waitForReady(baseUrl);
    await runChecks(baseUrl);
  } catch (error) {
    smokeError = error;
  } finally {
    await stopWorker(detached);
  }

  if (/Invalid binding [`'"]?SESSION|\benv\.SESSION\b/i.test(workerLogs)) {
    smokeError ??= new Error(
      "Astro preview reported an unexpected SESSION binding",
    );
  }

  if (smokeError) {
    process.stderr.write(
      `\n[worker-smoke] Astro preview output:\n${workerLogs}\n`,
    );
    throw smokeError;
  }

  output("all production Worker checks passed");
}

await main().catch((error) => {
  process.stderr.write(`[worker-smoke] FAIL ${error.stack ?? error}\n`);
  process.exitCode = 1;
});
