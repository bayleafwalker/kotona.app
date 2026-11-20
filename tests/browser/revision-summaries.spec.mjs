import { expect, test } from "@playwright/test";

test("a material revision travels from the log to the document and its Markdown", async ({
  page,
  request,
}) => {
  const response = await request.get("/reference-index.json");
  expect(response.ok()).toBeTruthy();
  const catalog = await response.json();
  const document = catalog.documents.find(
    (entry) => entry.id === "three-clocks",
  );
  expect(document.revisionSummary).toBeTruthy();

  await page.goto("/log/");
  const event = page
    .locator(".changelog-entry")
    .filter({ hasText: "Revised note: Three clocks" });
  await expect(event).toHaveCount(1);
  await expect(event.locator(".changelog-summary")).toHaveText(
    document.revisionSummary,
  );
  await expect(event.locator("time")).toHaveAttribute(
    "datetime",
    `${document.dates.lastRevised}T00:00:00.000Z`,
  );
  await event.getByRole("link").click();
  await expect(
    page.getByRole("complementary", { name: "Material revision" }),
  ).toContainText(document.revisionSummary);

  const markdown = await request.get("/notes/three-clocks.md");
  expect(markdown.ok()).toBeTruthy();
  expect(await markdown.text()).toContain(document.revisionSummary);
});
