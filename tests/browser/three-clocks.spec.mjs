import { expect, test } from "@playwright/test";

async function openExhibit(page) {
  await page.goto("/notes/three-clocks/");
  const exhibit = page.locator("[data-three-clocks]");
  await expect(exhibit).toHaveAttribute("data-initialized", "true");
  return exhibit;
}

test("interpretation controls update the amount, selected inputs and manifest", async ({
  page,
}) => {
  const exhibit = await openExhibit(page);
  await expect(exhibit.locator("[data-clock-total]")).toHaveText("€11,433.07");
  const first = exhibit.locator('[data-record="p-101"]');
  await expect(first.locator("[data-row-amount]")).toHaveText("€108.88");
  await expect(first.locator("[data-row-raw]")).toHaveText("Raw: 12,50 SEK");

  await exhibit.getByLabel("Interpretation version").selectOption("corrected");
  await expect(exhibit.locator("[data-clock-total]")).toHaveText("€124.13");
  await expect(first.locator("[data-row-amount]")).toHaveText("€1.09");
  await expect(first.locator("[data-row-assertion]")).toHaveText(
    "p-101-original",
  );
  await exhibit.getByText("Inspect the interpretation manifest").click();
  await expect(exhibit.locator("[data-basis-parser]")).toHaveText(
    "decimal-comma-corrected/v2",
  );
  await expect(exhibit.locator("[data-basis-reference]")).toHaveText(
    "fx@2026-05-02",
  );

  await exhibit
    .getByLabel("Interpretation version")
    .selectOption("revised-reference");
  await expect(exhibit.locator("[data-clock-total]")).toHaveText("€129.51");
  await expect(first.locator("[data-row-amount]")).toHaveText("€1.14");
  await expect(exhibit.locator("[data-basis-reference]")).toHaveText(
    "fx@2026-09-07",
  );
  await expect(
    exhibit.locator('[data-record="p-102"] [data-row-amount]'),
  ).toHaveText("€9.90");
});

test("both time controls select the correct assertion and its explicit labels", async ({
  page,
}) => {
  const exhibit = await openExhibit(page);
  const first = exhibit.locator('[data-record="p-101"]');
  await expect(exhibit.locator("[data-clock-valid]")).toHaveAccessibleName(
    "Valid time",
  );
  await expect(exhibit.locator("[data-clock-record]")).toHaveAccessibleName(
    "Record time cutoff",
  );
  await expect(
    exhibit.locator("[data-clock-interpretation]"),
  ).toHaveAccessibleName("Interpretation version");
  await exhibit.getByLabel("Interpretation version").selectOption("corrected");
  await exhibit
    .getByLabel("Valid time", { exact: true })
    .selectOption("2026-05-04T12:00:00Z");
  await exhibit
    .getByLabel("Record time cutoff")
    .selectOption("2026-05-05T09:00:00Z");
  await expect(first.locator("[data-row-assertion]")).toHaveText(
    "p-101-amendment",
  );
  await expect(first.locator("[data-row-amount]")).toHaveText("€1.31");
  await expect(first.locator("[data-row-valid]")).toContainText(
    "Valid from: 2026-05-04 00:00 UTC",
  );
  await expect(first.locator("[data-row-recorded]")).toHaveText(
    "Recorded at: 2026-05-05 09:00 UTC",
  );

  await exhibit
    .getByLabel("Record time cutoff")
    .selectOption("2026-05-08T09:00:00Z");
  await expect(first.locator("[data-row-assertion]")).toHaveText(
    "p-101-amendment",
  );
  await exhibit
    .getByLabel("Valid time", { exact: true })
    .selectOption("2026-05-03T12:00:00Z");
  await expect(first.locator("[data-row-assertion]")).toHaveText(
    "p-101-correction",
  );
  await expect(first.locator("[data-row-amount]")).toHaveText("€0.87");
  await expect(first.locator("[data-row-valid]")).toContainText(
    "valid to: 2026-05-04 00:00 UTC (exclusive)",
  );
  await expect(first.locator("[data-row-recorded]")).toHaveText(
    "Recorded at: 2026-05-08 09:00 UTC",
  );
});

test("the overwrite scene refuses a historical total and restoring history recovers it", async ({
  page,
}) => {
  const exhibit = await openExhibit(page);
  const overwrite = exhibit.getByRole("checkbox");
  await overwrite.check();
  await expect(exhibit.locator("[data-clock-total]")).toHaveText("Unavailable");
  await expect(exhibit.locator("[data-clock-total]")).toHaveAttribute(
    "data-status",
    "unavailable",
  );
  await expect(
    exhibit.locator('[data-record="p-101"] [data-row-amount]'),
  ).toHaveText("Unavailable");
  await expect(
    exhibit.locator('[data-record="p-101"] [data-row-raw]'),
  ).toHaveText("Earlier payload missing");
  await expect(exhibit.locator("[data-clock-unavailable]")).toBeVisible();
  await overwrite.uncheck();
  await expect(exhibit.locator("[data-clock-total]")).toHaveText("€11,433.07");
  await expect(exhibit.locator("[data-clock-unavailable]")).toBeHidden();
});

test("the exhibit fits a narrow viewport and native controls remain operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 820 });
  const exhibit = await openExhibit(page);
  await exhibit.getByLabel("Interpretation version").selectOption("corrected");
  await expect(exhibit.locator("[data-clock-total]")).toHaveText("€124.13");
  const layout = await exhibit.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    scroll: element.scrollWidth,
    viewport: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scroll).toBeLessThanOrEqual(Math.ceil(layout.width));
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport);
});
