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
  // One definition per term, generated from the terms the notes and projects
  // already carry. Agents retrieving a single note otherwise meet the local
  // vocabulary with no way to resolve it.
  const vocabulary = new Map<string, string>();
  for (const entry of [...projects, ...notes]) {
    for (const { term, definition } of entry.data.terms ?? []) {
      if (!vocabulary.has(term)) vocabulary.set(term, definition);
    }
  }

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
    `- [Explore](${new URL("/explore/", baseUrl)})`,
    `- [Knowledge graph data](${new URL("/knowledge.json", baseUrl)})`,
    `- [Reference catalog](${new URL("/reference-index.json", baseUrl)})`,
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
    ...(vocabulary.size > 0
      ? [
          "",
          "## Vocabulary",
          "",
          "Local system names and site-specific concepts, defined where the notes and projects use them.",
          "",
          ...[...vocabulary]
            .sort(([left], [right]) => left.localeCompare(right, "en"))
            .map(([term, definition]) => `- ${term}: ${definition}`),
        ]
      : []),
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
