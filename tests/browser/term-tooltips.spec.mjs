import { expect, test } from "@playwright/test";

/**
 * Term tooltips are centred on their term, so one near a viewport edge used to
 * render partly offscreen -- `max-width` bounds the size but not the position.
 * Nothing outside a browser measures where a tooltip actually lands.
 */
// Term hints render where a defined term first appears in annotated prose, so
// only a handful of pages carry one. Appservice sits far enough left that its
// centred tooltip used to render partly offscreen.
const pages = ["/projects/gitops-cluster/"];
const widths = [1363, 1024, 1600];

for (const path of pages) {
  for (const width of widths) {
    test(`every term tooltip stays inside the viewport on ${path} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 936 });
      await page.goto(path);

      const terms = page.locator(".term-hint dfn");
      const count = await terms.count();
      expect(count).toBeGreaterThan(0);

      const offscreen = [];

      for (let index = 0; index < count; index += 1) {
        const term = terms.nth(index);
        await term.focus();
        const note = term.locator("xpath=following-sibling::span[1]");
        await expect(note).toBeVisible();
        // The reveal transform transitions over 120ms; measuring mid-flight
        // reports a position the reader never sees.
        await note.evaluate((element) =>
          Promise.all(
            element.getAnimations().map((animation) => animation.finished),
          ),
        );

        const box = await note.boundingBox();
        const width = await page.evaluate(
          () => document.documentElement.clientWidth,
        );

        if (box.x < 0 || box.x + box.width > width) {
          offscreen.push(
            `${await term.innerText()}: x=${box.x.toFixed(1)} right=${(
              box.x + box.width
            ).toFixed(1)} viewport=${width}`,
          );
        }
      }

      expect(offscreen).toEqual([]);
    });
  }
}
