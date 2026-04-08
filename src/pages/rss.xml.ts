import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

import { getPublishedEntries, sortByDateAndTitle } from "../lib/content";
import { siteConfig } from "../site";

export const GET: APIRoute = async (context) => {
  const posts = sortByDateAndTitle(await getCollection("posts"));
  const published = getPublishedEntries(posts);

  return rss({
    title: `${siteConfig.title} writing`,
    description: "Posts and technical notes from kotona.app.",
    site: context.site ?? siteConfig.siteUrl,
    items: published.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary ?? "",
      pubDate: entry.data.date,
      link: `/writing/${entry.slug}/`,
      categories: entry.data.tags,
    })),
  });
};
