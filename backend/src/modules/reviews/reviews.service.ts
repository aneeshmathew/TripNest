import { prisma } from "../../db/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { CreateReviewInput, UpdateReviewInput } from "./reviews.schemas.js";

const reviewInclude = {
  user: { select: { id: true, name: true } },
  photos: true
} as const;

// The single place Listing.averageRating / reviewCount get written.
// Recomputed from the actual review rows rather than incremented/
// decremented in place — simpler to reason about and self-healing if
// anything ever drifts (a manual DB fix, a failed transaction, etc).
async function recomputeListingRating(listingId: string) {
  const stats = await prisma.review.aggregate({
    where: { listingId },
    _avg: { rating: true },
    _count: true
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
      reviewCount: stats._count
    }
  });
}

export async function listReviewsForListing(listingId: string) {
  return prisma.review.findMany({
    where: { listingId },
    include: reviewInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function createReview(listingId: string, userId: string, input: CreateReviewInput) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    throw new AppError(404, "Listing not found");
  }

  const existing = await prisma.review.findUnique({
    where: { listingId_userId: { listingId, userId } }
  });
  if (existing) {
    throw new AppError(409, "You've already reviewed this listing");
  }

  const review = await prisma.review.create({
    data: {
      listingId,
      userId,
      rating: input.rating,
      cleanliness: input.cleanliness,
      service: input.service,
      value: input.value,
      location: input.location,
      title: input.title,
      body: input.body,
      photos: input.photoUrls?.length
        ? { create: input.photoUrls.map((url) => ({ url })) }
        : undefined
    },
    include: reviewInclude
  });

  await recomputeListingRating(listingId);
  return review;
}

export async function updateReview(reviewId: string, userId: string, input: UpdateReviewInput) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError(404, "Review not found");
  }
  if (review.userId !== userId) {
    throw new AppError(403, "You can only edit your own review");
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: input.rating,
      cleanliness: input.cleanliness,
      service: input.service,
      value: input.value,
      location: input.location,
      title: input.title,
      body: input.body
    },
    include: reviewInclude
  });

  // Only re-aggregate if the overall rating could have changed — cheap
  // guard against unnecessary writes on text-only edits.
  if (input.rating !== undefined) {
    await recomputeListingRating(review.listingId);
  }

  return updated;
}

export async function deleteReview(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError(404, "Review not found");
  }
  if (review.userId !== userId) {
    throw new AppError(403, "You can only delete your own review");
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await recomputeListingRating(review.listingId);
}
