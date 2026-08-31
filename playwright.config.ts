import { defineConfig, devices } from "@playwright/test";

// Prerequisite this config assumes (documented in README.md): Postgres is
// already up and migrated/seeded — `npm run db:up && npm run db:migrate
// && npm run db:seed` — before running `npm run test:e2e`. Playwright's
// webServer below starts the frontend+backend dev servers for you, but it
// doesn't manage Docker/Postgres.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
