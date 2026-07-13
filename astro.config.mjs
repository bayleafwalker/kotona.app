import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import { siteConfig } from "./src/site";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

function contentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return contentFiles(entryPath);
    }

    return /\.mdx?$/.test(entry.name) ? [entryPath] : [];
  });
}

function publishedContentPages(collection, { draftByDefault }) {
  const contentDirectory = path.join(rootDirectory, "src/content", collection);

  return contentFiles(contentDirectory).flatMap((filePath) => {
    const source = readFileSync(filePath, "utf8");
    const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? "";
    const draftValue = frontmatter.match(/^draft:\s*(true|false)\s*$/m)?.[1];
    const isDraft = draftValue ? draftValue === "true" : draftByDefault;

    if (isDraft) {
      return [];
    }

    const slug = path
      .relative(contentDirectory, filePath)
      .replaceAll(path.sep, "/")
      .replace(/\.mdx?$/, "")
      .replace(/\/index$/, "");

    return [new URL(`/${collection}/${slug}/`, siteConfig.siteUrl).href];
  });
}

const canonicalContentPages = [
  ...publishedContentPages("notes", { draftByDefault: false }),
  ...publishedContentPages("projects", { draftByDefault: true }),
];

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
  }),
  // The site does not use Astro sessions. An explicit null driver keeps the
  // Worker independent of an otherwise-unused Cloudflare KV binding.
  session: {
    driver: {
      entrypoint: "unstorage/drivers/null",
    },
  },
  site: siteConfig.siteUrl,
  trailingSlash: "always",
  output: "server",
  integrations: [
    mdx(),
    sitemap({
      customPages: canonicalContentPages,
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return (
          pathname !== "/case-studies" && !pathname.startsWith("/case-studies/")
        );
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
