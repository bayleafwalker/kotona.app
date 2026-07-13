import { defineMiddleware } from "astro:middleware";

import { htmlToMarkdown, prefersMarkdown } from "./lib/markdown-response.js";

const homepageLinks = [
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</rss.xml>; rel="alternate"; type="application/rss+xml"; title="RSS"',
].join(", ");

const legacyWritingPaths: Record<string, string> = {
  "/writing": "/notes/",
  "/writing/": "/notes/",
  "/writing/the-boring-auth-boundary-was-right":
    "/notes/the-boring-auth-boundary-was-right/",
  "/writing/the-boring-auth-boundary-was-right/":
    "/notes/the-boring-auth-boundary-was-right/",
  "/writing/a-gitops-rollback-needs-time-to-reach-git":
    "/notes/a-gitops-rollback-needs-time-to-reach-git/",
  "/writing/a-gitops-rollback-needs-time-to-reach-git/":
    "/notes/a-gitops-rollback-needs-time-to-reach-git/",
  "/writing/compatibility-reports-should-be-a-little-rude":
    "/notes/compatibility-reports-should-be-a-little-rude/",
  "/writing/compatibility-reports-should-be-a-little-rude/":
    "/notes/compatibility-reports-should-be-a-little-rude/",
};

function appendVary(headers: Headers, value: string) {
  const existing = headers.get("Vary");
  const values = new Set(
    (existing ? existing.split(",") : [])
      .map((item) => item.trim())
      .filter(Boolean),
  );
  values.add(value);
  headers.set("Vary", [...values].join(", "));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const legacyTarget = legacyWritingPaths[context.url.pathname];

  if (legacyTarget) {
    const target = new URL(legacyTarget, context.url);
    target.search = context.url.search;
    return Response.redirect(target, 301);
  }

  const response = await next();
  const isHtml = response.headers.get("Content-Type")?.startsWith("text/html");

  if (!isHtml) {
    return response;
  }

  appendVary(response.headers, "Accept");

  if (context.url.pathname === "/") {
    response.headers.set("Link", homepageLinks);
  }

  if (!prefersMarkdown(context.request.headers.get("Accept"))) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.delete("Content-Length");
  headers.delete("ETag");

  if (context.request.method === "HEAD") {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const markdown = htmlToMarkdown(await response.text());
  headers.set(
    "x-markdown-tokens",
    String(markdown.split(/\s+/).filter(Boolean).length),
  );

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
