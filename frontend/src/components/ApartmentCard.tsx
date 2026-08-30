import Image from "next/image";
import Link from "next/link";
import StarRating from "./StarRating";
import type { Listing } from "../types/listing";

interface ApartmentCardProps {
  apartment: Listing;
}

function ApartmentCard({ apartment }: ApartmentCardProps) {
  return (
    <article className="card" data-testid={`apartment-card-${apartment.id}`}>
      <div className="card-image-wrap">
        <Image
          src={apartment.imageUrl}
          alt={apartment.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="card-content">
        <h3>{apartment.title}</h3>
        <p>{apartment.location}</p>
        <p>${apartment.price} / night</p>
        <p className="rating-line">
          <StarRating rating={apartment.averageRating} />
          <span>
            {apartment.averageRating.toFixed(1)} ({apartment.reviewCount})
          </span>
        </p>
        <Link href={`/apartments/${apartment.id}`} className="details-link">
          View details
        </Link>
      </div>
    </article>
  );
}

export default ApartmentCard;
