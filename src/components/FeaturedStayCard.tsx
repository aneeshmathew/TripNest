import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";
import type { Listing } from "../types/listing";

interface FeaturedStayCardProps {
  apartment: Listing;
}

// Homepage-only card for the "Featured stays" strip, styled to match the
// mockup exactly (heart icon + rating badge overlaid on the photo, price
// in brand teal, pill "View details" button). Deliberately a separate
// component from ApartmentCard rather than changing it in place —
// ApartmentCard is also used on /apartments and other listing grids that
// aren't part of this redesign, so this keeps that markup/styling
// untouched everywhere else.
function FeaturedStayCard({ apartment }: FeaturedStayCardProps) {
  return (
    <Link
      href={`/apartments/${apartment.id}`}
      className="featured-stay-card"
      data-testid={`apartment-card-${apartment.id}`}
    >
      <div className="featured-stay-card-image-wrap">
        <Image
          src={apartment.imageUrl}
          alt={apartment.title}
          fill
          sizes="(max-width: 768px) 100vw, 280px"
          style={{ objectFit: "cover" }}
        />
        <span className="featured-stay-card-heart" aria-hidden="true">
          <Heart size={16} />
        </span>
        <span className="featured-stay-card-rating">
          <Star size={13} fill="currentColor" aria-hidden="true" />
          {apartment.averageRating.toFixed(1)} ({apartment.reviewCount})
        </span>
      </div>
      <div className="featured-stay-card-content">
        <h3 className="featured-stay-card-title">{apartment.title}</h3>
        <p className="featured-stay-card-location">
          <MapPin size={13} aria-hidden="true" />
          {apartment.location}
        </p>
        <p className="featured-stay-card-price">
          ${apartment.price} <span>/night</span>
        </p>
        <span className="featured-stay-card-btn">
          View details
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export default FeaturedStayCard;
