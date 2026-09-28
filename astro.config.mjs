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
import { markdownPresentationIntegration } from "./src/lib/markdown-presentation.js";

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
    markdownPresentationIntegration(),
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
    // Shiki colours code with inline style attributes, which the production
    // CSP (`style-src 'self'`, src/lib/security-headers.js) refuses to apply.
    // Production therefore never showed its colours, and development showed
    // code boxes readers never saw. Plain `<pre><code class="language-*">`
    // renders the same in both and is styled in global.css; the Markdown
    // projection reads the language from that class.
    syntaxHighlight: false,
  },
  vite: {
    build: {
      // Astro inlines small component scripts as bare <script type="module">
      // elements. They carry no CSP nonce, so production (`script-src 'self'
      // 'nonce-...'`) refused to run them and the reference and prompt copy
      // buttons did nothing. Emitting every script as a same-origin file keeps
      // them under 'self'.
      assetsInlineLimit: 0,
    },
    define: {
      __BUILD_REVISION__: JSON.stringify(buildRevision),
    },
  },
});
