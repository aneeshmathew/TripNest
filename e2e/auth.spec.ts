import { expect, test } from "@playwright/test";

// Assumes the seed data's demo account: user1@mail.com / user123 (name
// "User 1" — see backend/prisma/seed.ts).
test.describe("Authentication", () => {
  test("logs in with the seeded demo account and can log out", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-email").fill("user1@mail.com");
    await page.getByTestId("login-password").fill("user123");
    await page.getByTestId("login-submit-btn").click();

    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("account-menu-trigger")).toHaveText(/Hello User 1/);

    await page.getByTestId("account-menu-trigger").click();
    await page.getByTestId("logout-btn").click();
    await expect(page.getByTestId("account-menu-trigger")).not.toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-email").fill("user1@mail.com");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit-btn").click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
