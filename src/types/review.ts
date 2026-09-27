export interface ReviewPhoto {
  id: string;
  url: string;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  cleanliness: number | null;
  service: number | null;
  value: number | null;
  location: number | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
  photos: ReviewPhoto[];
}

export interface CreateReviewInput {
  rating: number;
  title: string;
  body: string;
  cleanliness?: number;
  service?: number;
  value?: number;
  location?: number;
}

// Returned by GET /api/reviews/featured — a real review plus enough
// listing context to display as a homepage testimonial ("— Jane, about
// Eiffel View Loft"), not a fabricated marketing quote.
export interface FeaturedReview extends Review {
  listing: { id: string; title: string; location: string };
}
