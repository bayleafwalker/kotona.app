import type { APIRoute } from "astro";

import { siteConfig } from "../site";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(siteConfig.siteUrl);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Content-Signal: ai-train=no, search=yes, ai-input=yes",
    `Sitemap: ${new URL("/sitemap-index.xml", baseUrl).toString()}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
