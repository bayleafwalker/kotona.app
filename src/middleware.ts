import { defineMiddleware } from "astro:middleware";

import { htmlToMarkdown, prefersMarkdown } from "./lib/markdown-response.js";
import {
  renderPromptText,
  renderReferenceMarkdown,
} from "./lib/reference-markdown";
import {
  findReference,
  type ReferenceCollection,
} from "./lib/reference-lookup";
import { applySecurityHeaders } from "./lib/security-headers.js";
import { siteConfig } from "./site";

const homepageLinks = [
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</reference-index.json>; rel="index"; type="application/json"; title="Reference catalog"',
  '</rss.xml>; rel="alternate"; type="application/rss+xml"; title="RSS"',
].join(", ");

const legacyWritingPaths: Record<string, string> = {
  "/notes/the-application-is-the-assurance-kernel":
    "/notes/the-agent-is-not-the-application/",
  "/notes/the-application-is-the-assurance-kernel/":
    "/notes/the-agent-is-not-the-application/",
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

/**
 * `/notes/<slug>.md`, `/projects/<slug>.md`, and `/notes/<slug>.prompt.txt`.
 * A slug that does not match this shape is left to ordinary routing, so a
 * malformed request meets the same 404 as any other unknown path.
 */
function parseReferencePath(pathname: string) {
  const match = pathname.match(
    /^\/(notes|projects)\/([a-z0-9]+(?:-[a-z0-9]+)*)(\.md|\.prompt\.txt)$/,
  );
  if (!match) return undefined;

  return {
    collection: match[1] as ReferenceCollection,
    slug: match[2],
    kind: match[3] === ".md" ? ("markdown" as const) : ("prompt" as const),
  };
}

/** A representation is never a competing canonical document. */
function referenceHeaders(
  canonicalUrl: string,
  contentType: string,
  cspNonce: string,
) {
  const headers = new Headers({ "Content-Type": contentType });
  headers.set(
    "Link",
    [
      `<${canonicalUrl}>; rel="canonical"`,
      '</reference-index.json>; rel="index"; type="application/json"',
    ].join(", "),
  );
  headers.set("X-Kotona-Revision", __BUILD_REVISION__);
  applySecurityHeaders(headers, cspNonce, { development: import.meta.env.DEV });
  return headers;
}

function notFound(cspNonce: string) {
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  headers.set("X-Kotona-Revision", __BUILD_REVISION__);
  applySecurityHeaders(headers, cspNonce, { development: import.meta.env.DEV });
  return new Response("Not found\n", { status: 404, headers });
}

/** Same status, headers, and content type as the GET; no body. */
function withoutBody(response: Response, method: string) {
  if (method !== "HEAD") return response;
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const cspNonce = btoa(String.fromCharCode(...nonceBytes));
  context.locals.cspNonce = cspNonce;

  const legacyTarget = legacyWritingPaths[context.url.pathname];

  if (legacyTarget) {
    const target = new URL(legacyTarget, context.url);
    target.search = context.url.search;
    const response = Response.redirect(target, 301);
    const headers = new Headers(response.headers);
    applySecurityHeaders(headers, cspNonce, {
      development: import.meta.env.DEV,
    });
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const baseUrl = context.site ?? new URL(siteConfig.siteUrl);
  const referencePath = parseReferencePath(context.url.pathname);

  if (referencePath) {
    const { collection, slug, kind } = referencePath;
    const found = await findReference(collection, slug, baseUrl);

    // Drafts, unknown slugs, and prompt-less notes are one indistinguishable
    // 404. The response must not establish that unpublished content exists.
    if (!found || (kind === "prompt" && !found.prompt)) {
      return withoutBody(notFound(cspNonce), context.request.method);
    }

    const { document, prompt } = found;
    const markdownUrl = new URL(
      `/${collection}/${slug}.md`,
      baseUrl,
    ).toString();
    const promptUrl = prompt
      ? new URL(`/${collection}/${slug}.prompt.txt`, baseUrl).toString()
      : undefined;

    if (kind === "prompt") {
      const headers = referenceHeaders(
        document.url,
        "text/plain; charset=utf-8",
        cspNonce,
      );
      return withoutBody(
        new Response(
          renderPromptText(document, prompt as string, {
            revision: __BUILD_REVISION__,
            markdownUrl,
          }),
          { headers },
        ),
        context.request.method,
      );
    }

    const rendered = await next(`/${collection}/${slug}/`);

    // Only a successful HTML render becomes a reference representation. A 500
    // error page converted to Markdown, wrapped in a valid prelude and served
    // as 200, is a rendering failure that a machine client would cache and
    // cite as the document itself.
    if (
      rendered.status !== 200 ||
      !rendered.headers.get("Content-Type")?.startsWith("text/html")
    ) {
      const headers = new Headers({
        "Content-Type": "text/plain; charset=utf-8",
      });
      headers.set("X-Kotona-Revision", __BUILD_REVISION__);
      applySecurityHeaders(headers, cspNonce, {
        development: import.meta.env.DEV,
      });
      return withoutBody(
        new Response(
          rendered.status === 404 ? "Not found\n" : "Unavailable\n",
          {
            status: rendered.status === 200 ? 502 : rendered.status,
            headers,
          },
        ),
        context.request.method,
      );
    }

    const markdown = renderReferenceMarkdown(await rendered.text(), document, {
      revision: __BUILD_REVISION__,
      promptUrl,
    });
    const headers = referenceHeaders(
      document.url,
      "text/markdown; charset=utf-8",
      cspNonce,
    );
    headers.set(
      "x-markdown-tokens",
      String(markdown.split(/\s+/).filter(Boolean).length),
    );

    return withoutBody(
      new Response(markdown, { status: 200, headers }),
      context.request.method,
    );
  }

  const response = await next();
  response.headers.set("X-Kotona-Revision", __BUILD_REVISION__);
  applySecurityHeaders(response.headers, cspNonce, {
    development: import.meta.env.DEV,
  });
  const isHtml = response.headers.get("Content-Type")?.startsWith("text/html");

  if (!isHtml) {
    return response;
  }

  appendVary(response.headers, "Accept");

  if (context.url.pathname === "/") {
    response.headers.set("Link", homepageLinks);
  }

  // A content page advertises its own machine representations, so an agent
  // that has walked to an arbitrary page does not have to already know that
  // content negotiation is available here.
  const contentPath = context.url.pathname.match(
    /^\/(notes|projects)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/,
  );
  const found =
    response.status === 200 && contentPath
      ? await findReference(
          contentPath[1] as ReferenceCollection,
          contentPath[2],
          baseUrl,
        )
      : undefined;

  if (found && contentPath) {
    const base = `/${contentPath[1]}/${contentPath[2]}`;
    response.headers.set(
      "Link",
      [
        `<${base}.md>; rel="alternate"; type="text/markdown"`,
        ...(found.prompt
          ? [`<${base}.prompt.txt>; rel="alternate"; type="text/plain"`]
          : []),
        '</reference-index.json>; rel="index"; type="application/json"',
      ].join(", "),
    );
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

  const html = await response.text();
  // One renderer, two delivery paths. A published note or project always
  // negotiates to the same bytes its `.md` resource serves.
  const markdown = found
    ? renderReferenceMarkdown(html, found.document, {
        revision: __BUILD_REVISION__,
        promptUrl: found.prompt
          ? new URL(
              `/${contentPath?.[1]}/${contentPath?.[2]}.prompt.txt`,
              baseUrl,
            ).toString()
          : undefined,
      })
    : htmlToMarkdown(html);
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
