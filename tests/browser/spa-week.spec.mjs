import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

const fixture = JSON.parse(
  readFileSync(
    new URL("../../src/data/exhibits/spa-week.json", import.meta.url),
    "utf8",
  ),
);

test("the spa toggle projects each fixture result without changing its period", async ({
  page,
}) => {
  await page.goto("/notes/size-the-spa-to-the-river/");
  const exhibit = page.locator("[data-spa-week]");
  for (const [mode, label] of [
    ["average", "Weekly averages"],
    ["hourly", "Worst-week hours"],
    ["average", "Weekly averages"],
  ]) {
    await exhibit.getByRole("radio", { name: label }).check();
    for (const [key, value] of Object.entries(fixture.expected[mode])) {
      if (key === "hours") continue;
      const text =
        key === "peakImportKw"
          ? value === null
            ? "Not resolved"
            : `${value} kW`
          : `${(value / 1000).toFixed(2)} MWh`;
      await expect(exhibit.locator(`[data-metric="${key}"]`)).toHaveText(text);
    }
    await expect(exhibit.locator("[data-spa-explanation]")).toContainText(
      `${(fixture.expected[mode].gridImportKwh / 1000).toFixed(2)} MWh`,
    );
  }
  await expect(exhibit).toContainText("168 hours");
});

test("the spa check fits a narrow viewport and exposes its assumptions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/notes/size-the-spa-to-the-river/");
  const exhibit = page.locator("[data-spa-week]");
  await exhibit.getByText("Inspect the assumed daily profile").click();
  await expect(exhibit.getByRole("table")).toBeVisible();
  const fits = await exhibit.evaluate(
    (element) => element.scrollWidth <= element.clientWidth,
  );
  expect(fits).toBe(true);
  const response = await page.request.get("/exhibits/spa-week/fixtures.json");
  expect(await response.json()).toEqual(fixture);
});

test("the no-script explanation retains the checked hourly result", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/notes/size-the-spa-to-the-river/");
    // Playwright excludes NOSCRIPT itself from text matching even in a
    // JavaScript-disabled context. Its rendered paragraph is the assertion target.
    const explanation = page.locator("[data-spa-week] noscript p");
    await expect(explanation).toBeVisible();
    for (const key of ["gridImportKwh", "gridExportKwh", "directUseKwh"])
      await expect(explanation).toContainText(
        `${(fixture.expected.hourly[key] / 1000).toFixed(2)} MWh`,
      );
    await expect(explanation).toContainText(
      `${fixture.expected.hourly.peakImportKw} kW`,
    );
  } finally {
    await context.close();
  }
});
