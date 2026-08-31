import { expect, test } from "@playwright/test";

// Assumes the seed data from backend/prisma/seed.ts is loaded (4 listings
// including "Eiffel View Loft", each with one review from the demo user).
test.describe("Home page", () => {
  test("shows the seeded listings", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Featured Apartments" })).toBeVisible();
    await expect(page.getByText("Eiffel View Loft")).toBeVisible();
  });

  test("filters listings by search term via the URL", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("search-input").fill("Eiffel");
    await page.getByTestId("search-submit-btn").click();

    await expect(page).toHaveURL(/search=Eiffel/);
    await expect(page.getByText("Eiffel View Loft")).toBeVisible();
    await expect(page.getByText("Beachside Villa")).not.toBeVisible();
  });

  test("shows a no-results message for a search with no matches", async ({ page }) => {
    await page.goto("/?search=zzz-no-such-listing-zzz");
    await expect(page.getByText(/no apartments match your search/i)).toBeVisible();
  });
});
