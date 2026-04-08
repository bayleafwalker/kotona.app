import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import { siteConfig } from "./src/site";

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
  }),
  site: siteConfig.siteUrl,
  output: "server",
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
