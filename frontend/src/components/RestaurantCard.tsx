import Image from "next/image";
import StarRating from "./StarRating";
import type { Restaurant } from "../types/hospitality";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function priceRangeLabel(priceRange: number): string {
  return "$".repeat(Math.max(1, Math.min(priceRange, 4)));
}

function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <article className="card" data-testid={`restaurant-card-${restaurant.id}`}>
      <div className="card-image-wrap">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="card-content">
        <h3>{restaurant.name}</h3>
        <p>{restaurant.location}</p>
        <p>
          {restaurant.cuisine} · {priceRangeLabel(restaurant.priceRange)}
        </p>
        <p className="rating-line" aria-label={`${restaurant.rating.toFixed(1)} out of 5 (curated rating)`}>
          <StarRating rating={restaurant.rating} />
          <span>{restaurant.rating.toFixed(1)}</span>
        </p>
      </div>
    </article>
  );
}

export default RestaurantCard;
