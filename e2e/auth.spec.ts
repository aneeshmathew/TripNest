import { expect, test } from "@playwright/test";

// Assumes the seed data's demo account: user1@mail.com / user123.
test.describe("Authentication", () => {
  test("logs in with the seeded demo account and can log out", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-email").fill("user1@mail.com");
    await page.getByTestId("login-password").fill("user123");
    await page.getByTestId("login-submit-btn").click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText("user1@mail.com")).toBeVisible();

    await page.getByTestId("logout-btn").click();
    await expect(page.getByText("user1@mail.com")).not.toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-email").fill("user1@mail.com");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit-btn").click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
