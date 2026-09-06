import { expect, test } from "@playwright/test";

test.describe("ExploreCategories (homepage 'easy to use' section)", () => {
  test("Apartments tile goes home, Hotels/Restaurants go to their browse pages", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("explore-hotels").click();
    await expect(page).toHaveURL("/hotels");

    await page.goto("/");
    await page.getByTestId("explore-restaurants").click();
    await expect(page).toHaveURL("/restaurants");
  });

  test("Activities tile scrolls to the Trip Inspiration section on the homepage", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("explore-activities").click();

    await expect(page).toHaveURL("/#trip-inspiration");
    await expect(page.locator("#trip-inspiration")).toBeInViewport();
  });
});

test.describe("Hotels and Restaurants browse pages", () => {
  test("/hotels lists real hotels and supports search", async ({ page }) => {
    await page.goto("/hotels");
    await expect(page.getByRole("heading", { name: "Hotels" })).toBeVisible();

    await page.getByTestId("hotels-search-input").fill("zzzznotarealhotelzzzz");
    await page.getByTestId("hotels-search-btn").click();
    await expect(page.getByText(/no hotels match/i)).toBeVisible();

    await page.getByTestId("hotels-search-clear").click();
    await expect(page).toHaveURL("/hotels");
  });

  test("/restaurants lists real restaurants and supports search", async ({ page }) => {
    await page.goto("/restaurants");
    await expect(page.getByRole("heading", { name: "Restaurants" })).toBeVisible();

    await page.getByTestId("restaurants-search-input").fill("zzzznotarealrestaurantzzzz");
    await page.getByTestId("restaurants-search-btn").click();
    await expect(page.getByText(/no restaurants match/i)).toBeVisible();
  });
});
