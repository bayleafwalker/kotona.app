import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

import { getPublishedEntries, sortByDateAndTitle } from "../lib/content";
import { siteConfig } from "../site";

export const GET: APIRoute = async (context) => {
  const notes = sortByDateAndTitle(
    (await getCollection("notes")).map((entry) => ({
      ...entry,
      data: {
        ...entry.data,
        date: entry.data.published,
      },
    })),
  );
  const published = getPublishedEntries(notes);

  return rss({
    title: `${siteConfig.title} notes`,
    description: "Project notes and system notes from kotona.app.",
    site: context.site ?? siteConfig.siteUrl,
    items: published.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary ?? "",
      pubDate: entry.data.published,
      link: `/notes/${entry.slug}/`,
      categories: [entry.data.area, ...entry.data.tags],
    })),
  });
};
