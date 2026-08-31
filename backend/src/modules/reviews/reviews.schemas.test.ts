import { describe, expect, it } from "vitest";
import { createReviewSchema, updateReviewSchema } from "./reviews.schemas.js";

describe("createReviewSchema", () => {
  it("accepts a valid review with sub-ratings", () => {
    const result = createReviewSchema.parse({
      rating: 5,
      title: "Great stay",
      body: "Would book again",
      cleanliness: 4
    });
    expect(result.rating).toBe(5);
    expect(result.cleanliness).toBe(4);
  });

  it("rejects a rating outside 1-5", () => {
    expect(() => createReviewSchema.parse({ rating: 6, title: "Title", body: "Body" })).toThrow();
  });

  it("rejects a missing title", () => {
    expect(() => createReviewSchema.parse({ rating: 5, body: "Body" })).toThrow();
  });

  it("rejects a non-URL photo entry", () => {
    expect(() =>
      createReviewSchema.parse({
        rating: 5,
        title: "Title",
        body: "Body",
        photoUrls: ["not-a-url"]
      })
    ).toThrow();
  });
});

describe("updateReviewSchema", () => {
  it("allows a partial update with just the rating", () => {
    const result = updateReviewSchema.parse({ rating: 3 });
    expect(result).toEqual({ rating: 3 });
  });

  it("strips photoUrls — editing photos isn't supported via update", () => {
    const result = updateReviewSchema.parse({
      rating: 3,
      photoUrls: ["https://example.com/a.jpg"]
    });
    expect(result).not.toHaveProperty("photoUrls");
  });
});
