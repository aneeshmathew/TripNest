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
