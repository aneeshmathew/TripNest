import Link from "next/link";
import StarRating from "./StarRating";
import type { FeaturedReview } from "../types/review";

interface TestimonialSectionProps {
  reviews: FeaturedReview[];
}

// Real reviews pulled from the database (see lib/reviews.ts:getFeaturedReviews
// and the backend's GET /api/reviews/featured), not fabricated marketing
// quotes with stock photos.
function TestimonialSection({ reviews }: TestimonialSectionProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="section testimonial-section" id="testimonials">
      <h2 className="section-title">What our guests are saying</h2>
      <div className="testimonial-list">
        {reviews.map((review) => (
          <figure className="testimonial-card" key={review.id}>
            <StarRating rating={review.rating} />
            <blockquote>
              <p>&ldquo;{review.body}&rdquo;</p>
            </blockquote>
            <figcaption>
              <span className="testimonial-author">{review.user.name}</span>
              <span className="testimonial-context">
                on{" "}
                <Link href={`/apartments/${review.listing.id}`} className="details-link">
                  {review.listing.title}
                </Link>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default TestimonialSection;
