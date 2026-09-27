"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import StarRatingInput from "./StarRatingInput";
import { createReview } from "../api/reviews";
import { ApiError } from "../api/client";

interface ReviewFormProps {
  listingId: string;
}

function ReviewForm({ listingId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createReview(listingId, { rating, title, body });
      setTitle("");
      setBody("");
      setRating(5);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>
      <StarRatingInput label="Rating" value={rating} onChange={setRating} />

      <label htmlFor="review-title">Title</label>
      <input
        id="review-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={120}
        data-testid="review-title-input"
      />

      <label htmlFor="review-body">Review</label>
      <textarea
        id="review-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={4}
        maxLength={4000}
        data-testid="review-body-input"
      />

      {error ? <p className="error-text">{error}</p> : null}

      <button type="submit" className="primary-btn" disabled={isSubmitting} data-testid="submit-review-btn">
        {isSubmitting ? "Posting..." : "Post Review"}
      </button>
    </form>
  );
}

export default ReviewForm;
