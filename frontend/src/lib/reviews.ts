import type { FeaturedReview, Review } from "../types/review";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

// Unlike listings.ts (60s ISR), reviews are fetched with no caching.
// Reviews are the whole point of this page and correctness right after a
// submit/edit/delete matters more than shaving a request — a stale review
// list right after you post a review would look broken. The trade-off:
// the listing's averageRating/reviewCount shown elsewhere on the page
// (from getListing, which IS cached for 60s) can lag a new review by up
// to that window. Revisit with on-demand revalidation (revalidatePath via
// a Route Handler/Server Action) if that lag becomes a real complaint.
export async function getReviews(listingId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}/reviews`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to load reviews for listing ${listingId} (${response.status})`);
  }

  return response.json() as Promise<Review[]>;
}

// Homepage testimonials — unlike getReviews above, staleness isn't a big
// deal here (it's marketing content, not "did my review save"), so this
// uses the same 5-minute ISR window as getFeaturedListings.
export async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  const response = await fetch(`${API_BASE_URL}/api/reviews/featured`, {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`Failed to load featured reviews (${response.status})`);
  }

  return response.json() as Promise<FeaturedReview[]>;
}
