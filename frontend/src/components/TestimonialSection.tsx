"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StarRating from "./StarRating";
import type { FeaturedReview } from "../types/review";

interface TestimonialSectionProps {
  reviews: FeaturedReview[];
}

const FALLBACK_CARD_STEP_PX = 356; // 340px card + 16px (1rem) gap, if measurement fails

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Real reviews pulled from the database (see lib/reviews.ts:getFeaturedReviews
// and the backend's GET /api/reviews/featured), not fabricated marketing
// quotes with stock photos. The avatar is a colored initials badge rather
// than a stock photo — there's no avatar field on a real reviewer today,
// so a photo here would misrepresent an actual guest.
function TestimonialSection({ reviews }: TestimonialSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (reviews.length === 0) {
    return null;
  }

  const getCardStep = () => {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>(".testimonial-card");
    return firstCard?.offsetWidth ? firstCard.offsetWidth + 16 : FALLBACK_CARD_STEP_PX;
  };

  const scrollByOneCard = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * getCardStep(), behavior: "smooth" });
  };

  return (
    <section className="section testimonial-section" id="testimonials">
      <h2 className="section-title">What our guests are saying</h2>
      <p className="section-subtitle">Real stories. Real travelers. Real experiences.</p>

      <div className="testimonial-carousel-wrap">
        <button
          type="button"
          className="carousel-nav-btn carousel-nav-prev"
          onClick={() => scrollByOneCard(-1)}
          aria-label="Previous review"
          data-testid="testimonials-prev"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="testimonial-list" ref={trackRef}>
          {reviews.map((review) => (
            <figure className="testimonial-card" key={review.id}>
              <div className="testimonial-card-header">
                <span className="testimonial-avatar" aria-hidden="true">
                  {initials(review.user.name)}
                </span>
                <div>
                  <span className="testimonial-author">{review.user.name}</span>
                  <span className="testimonial-context">
                    on{" "}
                    <Link href={`/apartments/${review.listing.id}`} className="details-link">
                      {review.listing.title}
                    </Link>
                  </span>
                </div>
              </div>
              <StarRating rating={review.rating} />
              <blockquote>
                <p>&ldquo;{review.body}&rdquo;</p>
              </blockquote>
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav-btn carousel-nav-next"
          onClick={() => scrollByOneCard(1)}
          aria-label="Next review"
          data-testid="testimonials-next"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default TestimonialSection;
