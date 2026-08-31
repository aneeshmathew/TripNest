import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocked before importing reviews.service.ts so its `import { prisma } from
// "../../db/prisma.js"` resolves to this mock instead of a real client —
// these are unit tests for the service's logic (ownership checks, when
// recomputeListingRating fires), not integration tests against a real DB.
const prismaMock = {
  listing: { findUnique: vi.fn(), update: vi.fn() },
  review: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn()
  }
};

vi.mock("../../db/prisma.js", () => ({ prisma: prismaMock }));

const { createReview, updateReview, deleteReview } = await import("./reviews.service.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createReview", () => {
  it("throws 404 if the listing doesn't exist", async () => {
    prismaMock.listing.findUnique.mockResolvedValue(null);

    await expect(
      createReview("listing-1", "user-1", { rating: 5, title: "Great", body: "Loved it" })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("throws 409 if the user already reviewed this listing", async () => {
    prismaMock.listing.findUnique.mockResolvedValue({ id: "listing-1" });
    prismaMock.review.findUnique.mockResolvedValue({ id: "existing-review" });

    await expect(
      createReview("listing-1", "user-1", { rating: 5, title: "Great", body: "Loved it" })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("creates the review and recomputes the listing's rating", async () => {
    prismaMock.listing.findUnique.mockResolvedValue({ id: "listing-1" });
    prismaMock.review.findUnique.mockResolvedValue(null);
    prismaMock.review.create.mockResolvedValue({ id: "review-1", rating: 4 });
    prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: 1 });

    const result = await createReview("listing-1", "user-1", {
      rating: 4,
      title: "Nice stay",
      body: "Would come back"
    });

    expect(result).toEqual({ id: "review-1", rating: 4 });
    expect(prismaMock.review.aggregate).toHaveBeenCalledWith({
      where: { listingId: "listing-1" },
      _avg: { rating: true },
      _count: true
    });
    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: "listing-1" },
      data: { averageRating: 4, reviewCount: 1 }
    });
  });
});

describe("updateReview", () => {
  it("throws 403 if the reviewer doesn't own the review", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-1",
      userId: "someone-else",
      listingId: "listing-1"
    });

    await expect(updateReview("review-1", "user-1", { rating: 3 })).rejects.toMatchObject({
      status: 403
    });
  });

  it("skips rating recomputation when only text changes, not the rating", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-1",
      userId: "user-1",
      listingId: "listing-1"
    });
    prismaMock.review.update.mockResolvedValue({ id: "review-1", title: "Updated title" });

    await updateReview("review-1", "user-1", { title: "Updated title" });

    expect(prismaMock.review.aggregate).not.toHaveBeenCalled();
    expect(prismaMock.listing.update).not.toHaveBeenCalled();
  });

  it("recomputes the rating when the rating itself changes", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-1",
      userId: "user-1",
      listingId: "listing-1"
    });
    prismaMock.review.update.mockResolvedValue({ id: "review-1", rating: 2 });
    prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 2 }, _count: 1 });

    await updateReview("review-1", "user-1", { rating: 2 });

    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: "listing-1" },
      data: { averageRating: 2, reviewCount: 1 }
    });
  });
});

describe("deleteReview", () => {
  it("throws 404 if the review doesn't exist", async () => {
    prismaMock.review.findUnique.mockResolvedValue(null);
    await expect(deleteReview("missing", "user-1")).rejects.toMatchObject({ status: 404 });
  });

  it("throws 403 if the reviewer doesn't own the review", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-1",
      userId: "someone-else",
      listingId: "listing-1"
    });
    await expect(deleteReview("review-1", "user-1")).rejects.toMatchObject({ status: 403 });
  });

  it("deletes the review and recomputes the listing's rating", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-1",
      userId: "user-1",
      listingId: "listing-1"
    });
    prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: 0 });

    await deleteReview("review-1", "user-1");

    expect(prismaMock.review.delete).toHaveBeenCalledWith({ where: { id: "review-1" } });
    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: "listing-1" },
      data: { averageRating: 0, reviewCount: 0 }
    });
  });
});
