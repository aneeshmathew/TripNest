"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";
import StarRatingInput from "./StarRatingInput";
import { deleteReview, updateReview } from "../api/reviews";
import { ApiError } from "../api/client";
import type { Review } from "../types/review";

interface ReviewItemProps {
  review: Review;
  isOwn: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function ReviewItem({ review, isOwn }: ReviewItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title);
  const [body, setBody] = useState(review.body);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await updateReview(review.id, { rating, title, body });
      setIsEditing(false);
      // Reviews are fetched with cache: "no-store" (see lib/reviews.ts),
      // so this re-run of the Server Component tree picks up the edit
      // immediately.
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    setIsSubmitting(true);
    setError("");
    try {
      await deleteReview(review.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete review");
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <article className="review-card" data-testid={`review-${review.id}`}>
        <StarRatingInput label="Rating" value={rating} onChange={setRating} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="review-title-input"
          maxLength={120}
        />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={4000} />
        {error ? <p className="error-text">{error}</p> : null}
        <div className="modal-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setIsEditing(false)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="button" className="primary-btn" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="review-card" data-testid={`review-${review.id}`}>
      <div className="review-header">
        <StarRating rating={review.rating} />
        <span className="review-author">{review.user.name}</span>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>
      <h4>{review.title}</h4>
      <p>{review.body}</p>
      {error ? <p className="error-text">{error}</p> : null}
      {isOwn && (
        <div className="review-owner-actions">
          <button type="button" className="secondary-btn" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <button type="button" className="secondary-btn" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </article>
  );
}

export default ReviewItem;
