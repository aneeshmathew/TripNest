import { apiFetch } from "./client";
import type { CreateReviewInput, Review } from "../types/review";

export function createReview(listingId: string, input: CreateReviewInput): Promise<Review> {
  return apiFetch<Review>(`/api/listings/${listingId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateReview(reviewId: string, input: Partial<CreateReviewInput>): Promise<Review> {
  return apiFetch<Review>(`/api/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteReview(reviewId: string): Promise<void> {
  return apiFetch<void>(`/api/reviews/${reviewId}`, { method: "DELETE" });
}
