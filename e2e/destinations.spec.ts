import { expect, test } from "@playwright/test";

test.describe("Destinations carousel", () => {
  test("clicking a tile navigates to that destination's detail page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("destination-rio-de-janeiro-brazil").click();

    await expect(page).toHaveURL("/destinations/rio-de-janeiro-brazil");
    await expect(page.getByRole("heading", { name: "Rio de Janeiro" })).toBeVisible();
  });
});

test.describe("Destination detail page tabs", () => {
  test("defaults to the Apartments tab, showing real seeded listings", async ({ page }) => {
    // Rio de Janeiro overlaps with seed data (backend/prisma/seed.ts has
    // "Copacabana Beachfront Flat" there).
    await page.goto("/destinations/rio-de-janeiro-brazil");

    await expect(page.getByTestId("destination-tab-apartments")).toHaveClass(/active/);
    await expect(page.getByText("Copacabana Beachfront Flat")).toBeVisible();
  });

  test("switching to the Hotels tab shows real seeded hotels", async ({ page }) => {
    await page.goto("/destinations/rio-de-janeiro-brazil");
    await page.getByTestId("destination-tab-hotels").click();

    await expect(page).toHaveURL(/tab=hotels/);
    await expect(page.getByText("Copacabana Palace Inn")).toBeVisible();
  });

  test("switching to the Restaurants tab shows real seeded restaurants", async ({ page }) => {
    await page.goto("/destinations/rio-de-janeiro-brazil");
    await page.getByTestId("destination-tab-restaurants").click();

    await expect(page).toHaveURL(/tab=restaurants/);
    await expect(page.getByText("Sabor Carioca")).toBeVisible();
  });

  test("a destination with no matching data shows honest empty states, not fabricated content", async ({
    page
  }) => {
    // The Dolomites has no seeded apartments/hotels/restaurants.
    await page.goto("/destinations/dolomites-italy");
    await expect(page.getByText(/no apartments listed in the dolomites yet/i)).toBeVisible();
  });

  test("404s for an unknown destination slug", async ({ page }) => {
    const response = await page.goto("/destinations/not-a-real-destination");
    expect(response?.status()).toBe(404);
  });
});
