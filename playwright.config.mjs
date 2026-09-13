import process from "node:process";

import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4410);
const chromiumExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;

/**
 * Browser coverage for the one seam the other suites cannot reach: whether the
 * Explore page presents what the ranking decides. Deliberately narrow -- the
 * ranking policy itself is proven by unit tests and the retrieval evaluation.
 *
 * This is a separate gate rather than part of `npm run validate`, because it
 * needs a provisioned browser (`npx playwright install chromium`) and ordinary
 * development environments may not have one.
 */
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? "list" : "line",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: chromiumExecutablePath },
      },
    },
  ],
  webServer: {
    command: `npm run build && npx astro preview --ignore-lock --host 127.0.0.1 --port ${port}`,
    env: { ASTRO_PREVIEW_BACKGROUND: "0" },
    url: `http://127.0.0.1:${port}/explore/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
  },
});
