import { expect, test } from "@playwright/test";

test.describe("ExploreCategories (homepage 'easy to use' section)", () => {
  test("all four tiles go to their own search-ready browse pages", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("explore-apartments").click();
    await expect(page).toHaveURL("/apartments");

    await page.goto("/");
    await page.getByTestId("explore-hotels").click();
    await expect(page).toHaveURL("/hotels");

    await page.goto("/");
    await page.getByTestId("explore-restaurants").click();
    await expect(page).toHaveURL("/restaurants");

    await page.goto("/");
    await page.getByTestId("explore-activities").click();
    await expect(page).toHaveURL("/activities");
  });
});

test.describe("Apartments, Hotels, Restaurants, and Activities browse pages", () => {
  test("/apartments lists real apartments and supports search", async ({ page }) => {
    await page.goto("/apartments");
    await expect(page.getByRole("heading", { name: "Apartments" })).toBeVisible();
    await expect(page.getByTestId("apartments-search-input")).toHaveAttribute(
      "placeholder",
      "Search for apartments nearby location"
    );

    await page.getByTestId("apartments-search-input").fill("zzzznotarealapartmentzzzz");
    await page.getByTestId("apartments-search-btn").click();
    await expect(page.getByText(/no apartments match/i)).toBeVisible();

    await page.getByTestId("apartments-search-clear").click();
    await expect(page).toHaveURL("/apartments");
  });

  test("/hotels lists real hotels and supports search", async ({ page }) => {
    await page.goto("/hotels");
    await expect(page.getByRole("heading", { name: "Hotels" })).toBeVisible();
    await expect(page.getByTestId("hotels-search-input")).toHaveAttribute(
      "placeholder",
      "Search for hotels nearby location"
    );

    await page.getByTestId("hotels-search-input").fill("zzzznotarealhotelzzzz");
    await page.getByTestId("hotels-search-btn").click();
    await expect(page.getByText(/no hotels match/i)).toBeVisible();

    await page.getByTestId("hotels-search-clear").click();
    await expect(page).toHaveURL("/hotels");
  });

  test("/restaurants lists real restaurants and supports search", async ({ page }) => {
    await page.goto("/restaurants");
    await expect(page.getByRole("heading", { name: "Restaurants" })).toBeVisible();
    await expect(page.getByTestId("restaurants-search-input")).toHaveAttribute(
      "placeholder",
      "Search for restaurants nearby location"
    );

    await page.getByTestId("restaurants-search-input").fill("zzzznotarealrestaurantzzzz");
    await page.getByTestId("restaurants-search-btn").click();
    await expect(page.getByText(/no restaurants match/i)).toBeVisible();
  });

  test("/activities lists curated activities and supports search", async ({ page }) => {
    await page.goto("/activities");
    await expect(page.getByRole("heading", { name: "Activities" })).toBeVisible();
    await expect(page.getByTestId("activities-search-input")).toHaveAttribute(
      "placeholder",
      "Search for activities nearby location"
    );

    await page.getByTestId("activities-search-input").fill("hiking");
    await page.getByTestId("activities-search-btn").click();
    await expect(page.getByTestId("activities-page-hiking")).toBeVisible();

    await page.getByTestId("activities-search-clear").click();
    await expect(page).toHaveURL("/activities");
  });
});
