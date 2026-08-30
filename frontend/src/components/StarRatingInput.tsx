"use client";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function StarRatingInput({ value, onChange, label }: StarRatingInputProps) {
  return (
    <div className="star-rating-input">
      <span className="star-input-label">{label}</span>
      <div className="star-input-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= value ? "star-btn filled" : "star-btn"}
            onClick={() => onChange(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            data-testid={`star-input-${label.toLowerCase()}-${star}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default StarRatingInput;
