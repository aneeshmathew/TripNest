import { expect, test } from "@playwright/test";

test.describe("Reviews", () => {
  test("prompts a logged-out visitor to log in instead of showing the review form", async ({
    page
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View details" }).first().click();

    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("a newly registered user can write a review", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;

    // There's no signup page in the UI yet (see README — signup exists as
    // a backend endpoint only). Hit the API directly to create a
    // throwaway user, since the seeded demo user has already reviewed
    // every seeded listing and can't submit another.
    const signupResponse = await page.request.post("http://localhost:5000/api/auth/signup", {
      data: { email, password: "password123", name: "E2E Tester" }
    });
    expect(signupResponse.ok()).toBe(true);

    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill("password123");
    await page.getByTestId("login-submit-btn").click();
    await expect(page).toHaveURL("/");

    await page.getByRole("link", { name: "View details" }).first().click();
    await page.getByTestId("review-title-input").fill("Wonderful stay");
    await page.getByTestId("review-body-input").fill("Everything was perfect, would recommend.");
    await page.getByTestId("submit-review-btn").click();

    await expect(page.getByText("Wonderful stay")).toBeVisible();
  });
});
