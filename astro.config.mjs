import { execFileSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import { readContentMetadata } from "./scripts/lib/content-metadata.mjs";
import { siteConfig } from "./src/site";
import { projectTags, tagSlug } from "./src/lib/tag-slug.js";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const buildRevision =
  process.env.KOTONA_BUILD_REVISION ??
  (() => {
    try {
      return execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: rootDirectory,
        encoding: "utf8",
      }).trim();
    } catch {
      return "unknown";
    }
  })();

const publishedNotes = readContentMetadata(rootDirectory, "notes", {
  draftByDefault: false,
}).filter((entry) => !entry.draft);
const publishedProjects = readContentMetadata(rootDirectory, "projects", {
  draftByDefault: true,
}).filter((entry) => !entry.draft);

const canonicalContentPages = [
  ...publishedNotes.map((entry) =>
    new URL(`/notes/${entry.id}/`, siteConfig.siteUrl).toString(),
  ),
  ...publishedProjects.map((entry) =>
    new URL(`/projects/${entry.id}/`, siteConfig.siteUrl).toString(),
  ),
];
const canonicalTagPages = [
  ...new Set([
    ...publishedNotes.flatMap((entry) => entry.data.tags ?? []),
    ...publishedProjects.flatMap((entry) => projectTags(entry.data)),
  ]),
].map((tag) =>
  new URL(`/tags/${tagSlug(tag)}/`, siteConfig.siteUrl).toString(),
);

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
      customPages: [...canonicalContentPages, ...canonicalTagPages],
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
  vite: {
    define: {
      __BUILD_REVISION__: JSON.stringify(buildRevision),
    },
  },
});
