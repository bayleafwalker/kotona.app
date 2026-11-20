import { expect, test } from "@playwright/test";

test("the captured case exposes its pinned replay and retained evidence on a narrow screen", async ({
  page,
  request,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/notes/the-scorer-never-saw-the-changed-bytes/");
  const recipe = page.getByRole("region", {
    name: "Reproduce the retained Acceptance Lab case",
  });
  const version = await (await request.get("/version.json")).json();
  const checkout = `git -C kotona-case checkout --detach ${version.revision}`;
  await expect(recipe).toContainText(checkout);
  await expect(recipe).toContainText(
    "node --test tests/acceptance-case.test.mjs",
  );
  await expect(recipe).toContainText(
    "The altered-output control remains CONDITIONAL inside the Lab alone.",
  );

  const manifest = await request.get(
    "/evidence/acceptance-lab/2026-11-20-campaign-provenance/manifest.json",
  );
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).files["observations/001.json"]).toMatch(
    /^[a-f0-9]{64}$/,
  );
  const observation = await request.get(
    "/evidence/acceptance-lab/2026-11-20-campaign-provenance/observations/001.json",
  );
  expect(observation.ok()).toBeTruthy();

  const markdown = await request.get(
    "/notes/the-scorer-never-saw-the-changed-bytes.md",
  );
  expect(markdown.ok()).toBeTruthy();
  expect(await markdown.text()).toContain(checkout);

  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const dimensions = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  await recipe.screenshot({
    path: testInfo.outputPath("acceptance-case-replay-320.png"),
    animations: "disabled",
  });
});
