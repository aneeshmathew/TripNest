import Image from "next/image";
import { Star } from "lucide-react";
import type { Hotel } from "../types/hospitality";

interface HotelCardProps {
  hotel: Hotel;
}

function HotelCard({ hotel }: HotelCardProps) {
  return (
    <article className="card" data-testid={`hotel-card-${hotel.id}`}>
      <div className="card-image-wrap">
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="card-content">
        <h3>{hotel.name}</h3>
        <p>{hotel.location}</p>
        <p>${hotel.price} / night</p>
        <p className="star-rating" aria-label={`${hotel.starClass}-star hotel`}>
          {Array.from({ length: hotel.starClass }, (_, i) => (
            <Star key={i} size={16} className="star filled" fill="currentColor" aria-hidden="true" />
          ))}{" "}
          hotel
        </p>
      </div>
    </article>
  );
}

export default HotelCard;
