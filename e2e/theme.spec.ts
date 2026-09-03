import { expect, test } from "@playwright/test";

test.describe("Theme", () => {
  test("defaults to light theme on a fresh visit, regardless of OS preference", async ({
    browser
  }) => {
    // A fresh context with no localStorage, explicitly emulating a
    // dark-mode OS preference — light should still win, since the
    // default is deliberate, not derived from prefers-color-scheme.
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await context.close();
  });

  test("the navbar toggle switches theme and persists it across reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByTestId("navbar-theme-toggle-btn").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
