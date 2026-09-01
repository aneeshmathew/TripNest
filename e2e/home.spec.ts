import { expect, test } from "@playwright/test";

// Assumes the seed data from backend/prisma/seed.ts is loaded (9 listings
// across all 6 continents, including "Eiffel View Loft", each with one
// review from the demo user).
test.describe("Home page", () => {
  test("shows the marketing front door, not a listing dump, before any search", async ({
    page
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Find the perfect place to stay" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
    await expect(page.getByText("Eiffel View Loft")).not.toBeVisible();
  });

  test("shows matching listings after a hero search", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-search-input").fill("Eiffel");
    await page.getByTestId("hero-search-btn").click();

    await expect(page).toHaveURL(/search=Eiffel/);
    await expect(page.getByRole("heading", { name: "Featured Apartments" })).toBeVisible();
    await expect(page.getByText("Eiffel View Loft")).toBeVisible();
    await expect(page.getByText("Beachside Villa")).not.toBeVisible();
    // Marketing sections should be gone once results are shown.
    await expect(page.getByRole("heading", { name: "Frequently asked questions" })).not.toBeVisible();
  });

  test("shows a no-results message for a search with no matches", async ({ page }) => {
    await page.goto("/?search=zzz-no-such-listing-zzz");
    await expect(page.getByText(/no apartments match your search/i)).toBeVisible();
  });
});
