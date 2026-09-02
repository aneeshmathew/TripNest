import { expect, test } from "@playwright/test";

test.describe("Signup", () => {
  test("creates a new account and logs straight in", async ({ page }) => {
    const email = `e2e-signup-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByTestId("signup-name").fill("E2E Signup Tester");
    await page.getByTestId("signup-email").fill(email);
    await page.getByTestId("signup-password").fill("password123");
    await page.getByTestId("signup-submit-btn").click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(email)).toBeVisible();
  });

  test("Navbar shows Login and Sign up when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByTestId("signup-nav-link")).toBeVisible();
  });
});

test.describe("Settings gating", () => {
  test("prompts a logged-out visitor to log in, and hides the Settings nav link", async ({
    page
  }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Settings" })).not.toBeVisible();

    await page.goto("/settings");
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("shows account details once logged in", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("user1@mail.com");
    await page.getByTestId("login-password").fill("user123");
    await page.getByTestId("login-submit-btn").click();
    await expect(page).toHaveURL("/");

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
    await expect(page.getByText("user1@mail.com")).toBeVisible();
  });
});
