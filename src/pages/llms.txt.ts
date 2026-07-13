import type { APIRoute } from "astro";

import { siteConfig } from "../site";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(siteConfig.siteUrl);
  const body = [
    `# ${siteConfig.title}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "This is a public, read-only site. It has no API, accounts, authentication flow, or MCP server.",
    "",
    "## Site map",
    "",
    `- [Home](${new URL("/", baseUrl)})`,
    `- [Projects](${new URL("/projects/", baseUrl)})`,
    `- [System notes](${new URL("/notes/", baseUrl)})`,
    `- [About](${new URL("/about/", baseUrl)})`,
    `- [RSS feed](${new URL("/rss.xml", baseUrl)})`,
    `- [XML sitemap](${new URL("/sitemap-index.xml", baseUrl)})`,
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
