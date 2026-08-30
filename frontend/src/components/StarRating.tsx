interface StarRatingProps {
  rating: number;
  outOf?: number;
}

function StarRating({ rating, outOf = 5 }: StarRatingProps) {
  const rounded = Math.round(rating);

  return (
    <span className="star-rating" aria-label={`${rating} out of ${outOf} stars`}>
      {Array.from({ length: outOf }, (_, i) => (
        <span key={i} className={i < rounded ? "star filled" : "star"} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export default StarRating;
