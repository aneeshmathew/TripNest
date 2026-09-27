import { expect, test } from "@playwright/test";

// Assumes the seed data from backend/prisma/seed.ts is loaded — the
// original 9-listing demo set (across all 6 continents, each with one
// review from the demo user) plus real coverage for all 25 Nat Geo
// destinations added later. These tests only rely on the original 9
// (e.g. "Eiffel View Loft"), which are unaffected by the later additions.
test.describe("Home page", () => {
  test("shows the marketing front door, not a listing dump, before any search", async ({
    page
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Find a comfortable place to relax and experience the best attractions and adventures." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
    // Not "no listing text visible anywhere" — Featured Stays legitimately
    // shows real, top-rated listings on the marketing front door by
    // design (see FeaturedStays.tsx), and which listings rank into it
    // shifts as seed data/ratings change. What "not a listing dump"
    // actually means here is: the full search-results view (its own
    // intro heading + filters form) isn't what's showing.
    await expect(page.getByTestId("search-filters-form")).not.toBeVisible();
  });

  test("a hero search now goes to /plan, not the plain listings search", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-search-input").fill("surfing in Fiji");
    await page.getByTestId("hero-search-btn").click();

    await expect(page).toHaveURL(/\/plan\?q=/);
    await expect(page.getByRole("heading", { name: "Plan your trip" })).toBeVisible();
  });

  test("the plain listings search (SearchFilters/SearchResultsIntro) still works when reached directly", async ({
    page
  }) => {
    // No longer reachable via the Hero search (see above) — this exercises
    // the same underlying feature (app/page.tsx's active-filters branch)
    // via a direct URL instead, since it's still real, working code.
    await page.goto("/?search=Eiffel");

    // level: 1 disambiguates from TripIllustrationBanner's <h2> further
    // down the page, which reuses this same "Value For Experience"
    // wording on every page by design (see that component's own
    // comment) — this h1 is the search-results-specific one.
    await expect(
      page.getByRole("heading", { name: "The Value For Experience", level: 1 })
    ).toBeVisible();
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
