import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

// None of these hit Prisma: /health doesn't touch the DB, the signup case
// fails zod validation before the service layer runs, and /me is rejected
// by requireAuth before any DB lookup — so this suite runs with no real
// Postgres connection, just the fake env values from vitest.setup.ts.
const app = createApp();

describe("GET /health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("unknown routes", () => {
  it("returns 404 via the shared notFoundHandler", async () => {
    const response = await request(app).get("/this-route-does-not-exist");
    expect(response.status).toBe(404);
  });
});

describe("POST /api/auth/signup", () => {
  it("rejects an invalid email with a 400 validation error", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not-an-email", password: "password123", name: "Test User" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("rejects a password under 8 characters", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test@example.com", password: "short", name: "Test User" });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("requires authentication", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });

  it("rejects a malformed bearer token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(response.status).toBe(401);
  });
});

describe("POST /api/listings/:listingId/reviews", () => {
  it("requires authentication", async () => {
    const response = await request(app)
      .post("/api/listings/some-listing-id/reviews")
      .send({ rating: 5, title: "Great", body: "Loved it" });

    expect(response.status).toBe(401);
  });
});
