import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import {
  getPublishedEntries,
  sortByDateAndTitle,
  sortByLastVerifiedAndTitle,
} from "../lib/content";
import { buildRevision } from "../build";
import { siteConfig } from "../site";

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(siteConfig.siteUrl);
  const projects = getPublishedEntries(
    sortByLastVerifiedAndTitle(await getCollection("projects")),
  );
  const notes = getPublishedEntries(
    sortByDateAndTitle(
      (await getCollection("notes")).map((entry) => ({
        ...entry,
        data: { ...entry.data, date: entry.data.published },
      })),
    ),
  );
  const body = [
    `# ${siteConfig.title}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "This is a public, read-only site. It has no API, accounts, authentication flow, or MCP server.",
    `Deployed source revision: ${buildRevision}.`,
    "",
    "## Site map",
    "",
    `- [Home](${new URL("/", baseUrl)})`,
    `- [Projects](${new URL("/projects/", baseUrl)})`,
    `- [Notes](${new URL("/notes/", baseUrl)})`,
    `- [Tags](${new URL("/tags/", baseUrl)})`,
    `- [About](${new URL("/about/", baseUrl)})`,
    `- [Privacy](${new URL("/privacy/", baseUrl)})`,
    `- [Deployed revision](${new URL("/version.json", baseUrl)})`,
    `- [Publication and project log](${new URL("/log/", baseUrl)})`,
    `- [RSS feed](${new URL("/rss.xml", baseUrl)})`,
    `- [XML sitemap](${new URL("/sitemap-index.xml", baseUrl)})`,
    "",
    "## Projects",
    "",
    ...projects.map(
      (entry) =>
        `- [${entry.data.title}](${new URL(`/projects/${entry.id}/`, baseUrl)}): ${entry.data.summary ?? "Project context and current state."}`,
    ),
    "",
    "## Notes",
    "",
    ...notes.map(
      (entry) =>
        `- [${entry.data.title}](${new URL(`/notes/${entry.id}/`, baseUrl)}) (${entry.data.lifecycle}; ${entry.data.role}; ${entry.data.status}): ${entry.data.summary ?? "System note."}`,
    ),
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
