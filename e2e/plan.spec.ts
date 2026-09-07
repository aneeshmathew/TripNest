import { expect, test } from "@playwright/test";

test.describe("/plan — natural language trip search", () => {
  test("a destination-only query shows one group with its curated activities", async ({ page }) => {
    await page.goto("/plan?q=Vancouver");

    await expect(page.getByText(/Showing results for "Vancouver" — Vancouver/)).toBeVisible();
    await expect(page.getByText("Hiking")).toBeVisible();
    await expect(page.getByText("Kayaking")).toBeVisible();
  });

  test("an activity-only query groups every matching destination by location", async ({ page }) => {
    await page.goto("/plan?q=scuba diving");

    // Fiji and Maui both offer scuba-diving per destinationActivities.ts.
    await expect(page.getByText("Fiji", { exact: true })).toBeVisible();
    await expect(page.getByText("Maui", { exact: true })).toBeVisible();
  });

  test("destination + an activity it actually offers shows it without an unavailable note", async ({
    page
  }) => {
    await page.goto("/plan?q=kayaking near Vancouver");

    await expect(page.getByText(/unavailable|not available/i)).toHaveCount(0);
    await expect(page.getByText("Kayaking")).toBeVisible();
  });

  test("destination + an activity it does NOT offer shows the honest fallback message", async ({
    page
  }) => {
    // Vancouver isn't mapped to scuba-diving in destinationActivities.ts.
    await page.goto("/plan?q=scuba diving in Vancouver");

    await expect(
      page.getByText(/requested activity not available.*available activities in Vancouver/i)
    ).toBeVisible();
    await expect(page.getByText("Hiking")).toBeVisible();
  });

  test("a query matching neither vocabulary shows an honest miss, not fabricated results", async ({
    page
  }) => {
    await page.goto("/plan?q=I would like to go to Chile for something unusual");

    await expect(page.getByText(/didn't match a destination or activity/i)).toBeVisible();
  });

  test("the Find button on a group sends the chosen stay type to the destination's own tab", async ({
    page
  }) => {
    await page.goto("/plan?q=Vancouver");

    await page.getByTestId("plan-find-select-vancouver-canada").selectOption("hotels");
    await page.getByTestId("plan-find-btn-vancouver-canada").click();

    await expect(page).toHaveURL("/destinations/vancouver-canada?tab=hotels");
  });
});
