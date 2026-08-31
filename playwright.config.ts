import { defineConfig, devices } from "@playwright/test";

// Prerequisite this config assumes (documented in README.md): the DB is
// migrated/seeded — `npm run db:migrate && npm run db:seed` — before
// running `npm run test:e2e`. Playwright's webServer below starts the
// frontend+backend dev servers for you, but it doesn't set up the
// database itself (backend/.env's DATABASE_URL points at a hosted
// Postgres, e.g. Neon — nothing to start locally for that).
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
