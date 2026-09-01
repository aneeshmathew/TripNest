import { expect, test } from "@playwright/test";

// Assumes the seed data from backend/prisma/seed.ts — listings spanning
// all 6 continents, including "Shibuya Sky Suite" (Tokyo, ASIA) and
// "Manhattan Skyline Suite" (New York, NORTH_AMERICA).
test.describe("Continent map", () => {
  test("clicking a region filters listings to that continent", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("continent-ASIA").click();

    await expect(page).toHaveURL(/continent=ASIA/);
    await expect(page.getByText("Shibuya Sky Suite")).toBeVisible();
    await expect(page.getByText("Manhattan Skyline Suite")).not.toBeVisible();
  });

  test("shows a clear-region link only once a continent is selected", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("clear-continent-link")).not.toBeVisible();

    await page.getByTestId("continent-EUROPE").click();
    await expect(page.getByTestId("clear-continent-link")).toBeVisible();

    await page.getByTestId("clear-continent-link").click();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
