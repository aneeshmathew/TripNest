import { expect, test } from "@playwright/test";

test.describe("Activities carousel", () => {
  test("clicking a tile navigates to that activity's detail page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("activity-surfing").click();

    await expect(page).toHaveURL("/activities/surfing");
    await expect(page.getByRole("heading", { name: "Surfing trips" })).toBeVisible();
  });

  test("clicking the 'Search all' tile also navigates to its activity page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("activity-kayaking").click();

    await expect(page).toHaveURL("/activities/kayaking");
  });

  test("filtering by category narrows the visible tiles", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("activity-filter-history-culture").click();

    await expect(page.getByTestId("activity-ancient-ruins")).toBeVisible();
    await expect(page.getByTestId("activity-surfing")).not.toBeVisible();
  });
});

test.describe("Activity detail page tabs", () => {
  test("defaults to the Apartments tab", async ({ page }) => {
    await page.goto("/activities/surfing");
    await expect(page.getByTestId("activity-tab-apartments")).toHaveClass(/active/);
  });

  test("an activity with no keyword overlap in seed data shows an honest empty state", async ({
    page
  }) => {
    await page.goto("/activities/surfing");
    await expect(page.getByText(/no apartments match "surfing" yet/i)).toBeVisible();
  });

  test("searching a tab for a real seeded term surfaces real results", async ({ page }) => {
    // Rio de Janeiro overlaps with seed data (backend/prisma/seed.ts has
    // "Copacabana Beachfront Flat" there) — searching for it from within
    // an unrelated activity's Apartments tab should still find it, since
    // the search box replaces the default activity keyword.
    await page.goto("/activities/surfing");
    await page.getByTestId("activity-tab-search-input").fill("Rio");
    await page.getByTestId("activity-tab-search-btn").click();

    await expect(page).toHaveURL(/q=Rio/);
    await expect(page.getByText("Copacabana Beachfront Flat")).toBeVisible();
  });

  test("switching tabs does not carry over the previous tab's search text", async ({ page }) => {
    await page.goto("/activities/surfing?tab=apartments&q=Rio");
    await page.getByTestId("activity-tab-hotels").click();

    await expect(page).toHaveURL(/tab=hotels/);
    await expect(page).not.toHaveURL(/q=Rio/);
  });

  test("the Reviews tab has no search box", async ({ page }) => {
    await page.goto("/activities/surfing");
    await page.getByTestId("activity-tab-reviews").click();

    await expect(page.getByTestId("activity-tab-search-form")).toHaveCount(0);
  });

  test("404s for an unknown activity slug", async ({ page }) => {
    const response = await page.goto("/activities/not-a-real-activity");
    expect(response?.status()).toBe(404);
  });
});
