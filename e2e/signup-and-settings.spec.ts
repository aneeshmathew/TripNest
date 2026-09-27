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
    await expect(page.getByTestId("account-menu-trigger")).toHaveText(/Hello E2E Signup Tester/);
  });

  test("Navbar shows Login and Sign up when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("login-nav-btn")).toBeVisible();
    await expect(page.getByTestId("signup-nav-btn")).toBeVisible();
  });

  test("Login/Sign up open as a closable popup rather than navigating away", async ({ page }) => {
    await page.goto("/destinations/dolomites-italy");

    await page.getByTestId("login-nav-btn").click();
    await expect(page.getByTestId("auth-modal")).toBeVisible();
    // Confirms this is a popup, not a page navigation.
    await expect(page).toHaveURL("/destinations/dolomites-italy");

    // Switches mode in place, without closing/reopening the modal.
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByTestId("signup-name")).toBeVisible();

    // Escape closes it.
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("auth-modal")).not.toBeVisible();

    // The X button also closes it.
    await page.getByTestId("signup-nav-btn").click();
    await page.getByTestId("auth-modal-close").click();
    await expect(page.getByTestId("auth-modal")).not.toBeVisible();

    // Clicking the backdrop also closes it.
    await page.getByTestId("login-nav-btn").click();
    await page.getByTestId("auth-modal-overlay").click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId("auth-modal")).not.toBeVisible();
  });
});

test.describe("Settings gating", () => {
  test("prompts a logged-out visitor to log in, and hides the account menu", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("account-menu-trigger")).not.toBeVisible();

    await page.goto("/settings");
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("shows account details once logged in", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("user1@mail.com");
    await page.getByTestId("login-password").fill("user123");
    await page.getByTestId("login-submit-btn").click();
    await expect(page).toHaveURL("/");

    await page.getByTestId("account-menu-trigger").click();
    await page.getByRole("menuitem", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
    await expect(page.getByText("user1@mail.com")).toBeVisible();
  });
});
