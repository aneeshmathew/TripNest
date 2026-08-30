"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";
import type { Review } from "../types/review";

interface ReviewsSectionProps {
  listingId: string;
  reviews: Review[];
}

function ReviewsSection({ listingId, reviews }: ReviewsSectionProps) {
  const { user, isAuthenticated, authChecked } = useAuth();
  const ownReview = user ? reviews.find((review) => review.userId === user.id) : undefined;

  return (
    <section className="reviews-section">
      <h3 className="reviews-heading">Reviews{reviews.length > 0 ? ` (${reviews.length})` : ""}</h3>

      {reviews.length === 0 ? (
        <p className="status-text">No reviews yet — be the first to share your stay.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} isOwn={review.userId === user?.id} />
          ))}
        </div>
      )}

      {authChecked && !isAuthenticated && (
        <p className="status-text">
          <Link href="/login" className="details-link">
            Log in
          </Link>{" "}
          to write a review.
        </p>
      )}

      {authChecked && isAuthenticated && !ownReview && <ReviewForm listingId={listingId} />}
    </section>
  );
}

export default ReviewsSection;
