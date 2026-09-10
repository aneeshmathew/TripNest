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

  test("a second destination (not Rio) also has real seeded data across all three tabs", async ({
    page
  }) => {
    // Confirms seed coverage isn't just Rio de Janeiro — all 25 Nat Geo
    // destinations have an apartment/hotel/restaurant now (see
    // backend/prisma/seed.ts's destinationSeeds).
    await page.goto("/destinations/dolomites-italy");
    await expect(page.getByText("Alpine Chalet Retreat")).toBeVisible();

    await page.getByTestId("destination-tab-hotels").click();
    await expect(page.getByText("Dolomiti Peak Lodge")).toBeVisible();

    await page.getByTestId("destination-tab-restaurants").click();
    await expect(page.getByText("Rifugio delle Alpi")).toBeVisible();
  });

  test("a search matching no data shows honest empty states, not fabricated content", async ({
    page
  }) => {
    // All 25 Nat Geo destinations have real seed coverage now (see
    // backend/prisma/seed.ts), so there's no destination left to browse
    // to for a naturally-empty tab — trigger the same empty-state code
    // path via the search box instead, with a query that matches nothing.
    await page.goto("/destinations/dolomites-italy");
    await page.getByTestId("destination-tab-search-input").fill("zzznotarealplacezzzz");
    await page.getByTestId("destination-tab-search-btn").click();

    await expect(page.getByText(/no apartments match "zzznotarealplacezzzz" yet/i)).toBeVisible();
  });

  test("the Activities tab shows curated activities linking to their own activity pages", async ({
    page
  }) => {
    await page.goto("/destinations/dolomites-italy");
    await page.getByTestId("destination-tab-activities").click();

    await expect(page).toHaveURL(/tab=activities/);
    const hikingCard = page.getByTestId("destination-activity-hiking");
    await expect(hikingCard).toBeVisible();
    await expect(hikingCard).toHaveAttribute("href", "/activities/hiking");
  });

  test("each non-Reviews, non-Activities tab has its own search box; neither Reviews nor Activities has one", async ({
    page
  }) => {
    await page.goto("/destinations/rio-de-janeiro-brazil");
    await expect(page.getByTestId("destination-tab-search-input")).toHaveAttribute(
      "placeholder",
      "Search for apartments nearby"
    );

    await page.getByTestId("destination-tab-activities").click();
    await expect(page.getByTestId("destination-tab-search-form")).toHaveCount(0);

    await page.getByTestId("destination-tab-reviews").click();
    await expect(page.getByTestId("destination-tab-search-form")).toHaveCount(0);
  });

  test("the search box can override the destination's default keyword", async ({ page }) => {
    await page.goto("/destinations/dolomites-italy");
    await page.getByTestId("destination-tab-search-input").fill("Rio");
    await page.getByTestId("destination-tab-search-btn").click();

    await expect(page).toHaveURL(/q=Rio/);
    await expect(page.getByText("Copacabana Beachfront Flat")).toBeVisible();
  });

  test("404s for an unknown destination slug", async ({ page }) => {
    const response = await page.goto("/destinations/not-a-real-destination");
    expect(response?.status()).toBe(404);
  });
});
