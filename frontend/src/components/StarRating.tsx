import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  outOf?: number;
}

function StarRating({ rating, outOf = 5 }: StarRatingProps) {
  const rounded = Math.round(rating);

  return (
    <span className="star-rating" aria-label={`${rating} out of ${outOf} stars`}>
      {Array.from({ length: outOf }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rounded ? "star filled" : "star"}
          fill={i < rounded ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default StarRating;
