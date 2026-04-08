import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import { siteConfig } from "./src/site";

export default defineConfig({
  site: siteConfig.siteUrl,
  output: "static",
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
