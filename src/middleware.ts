import { defineMiddleware } from "astro:middleware";

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

function acceptsMarkdown(value: string | null) {
  return value
    ?.split(",")
    .some((mediaType) =>
      mediaType.trim().toLowerCase().startsWith("text/markdown"),
    );
}

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

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

// This is deliberately a small, dependency-free HTML-to-Markdown projection.
// The canonical representation remains HTML; this provides agents a readable
// response without inventing a second content store.
function htmlToMarkdown(html: string) {
  const markdown = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(
      /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi,
      (_, level, content) => `\n\n${"#".repeat(Number(level))} ${content}\n\n`,
    )
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(
      /<(p|div|section|article|header|main|footer|nav|ul|ol)[^>]*>/gi,
      "\n\n",
    )
    .replace(
      /<\/(p|div|section|article|header|main|footer|nav|ul|ol)>/gi,
      "\n\n",
    )
    .replace(/<br\s*\/?>(\n)?/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeEntities(markdown)
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .concat("\n");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const legacyTarget = legacyWritingPaths[context.url.pathname];

  if (legacyTarget) {
    return Response.redirect(new URL(legacyTarget, context.url), 301);
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

  if (!acceptsMarkdown(context.request.headers.get("Accept"))) {
    return response;
  }

  const markdown = htmlToMarkdown(await response.text());
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
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
