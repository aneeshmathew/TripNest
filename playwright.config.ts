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
  // Capped rather than left at Playwright's CPU-count default (8 on a
  // typical dev machine): `webServer` below runs `npm run dev`, which
  // compiles each route on first visit — 8 workers all hitting
  // never-before-compiled routes on that one shared dev server at once
  // can genuinely exceed even a 30s test timeout, not just look "slow".
  // Fewer concurrent workers means less compilation queued up at once.
  workers: 4,
  // Not retries: a retry re-runs the whole test, and tests that mutate
  // real, persistent DB state (e.g. reviews.spec.ts creating a real user
  // + review) can leave that data behind if the first attempt got far
  // enough before failing for an unrelated reason — the retry then
  // collides with its own leftover data instead of getting a clean
  // slate. Fixing the actual slowness (workers, above) is the real fix;
  // retrying just papers over it and risks compounding stateful tests.
  retries: 0,
  reporter: "list",
  expect: {
    timeout: 10_000
  },
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
