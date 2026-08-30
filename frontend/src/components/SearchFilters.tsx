import type { ListingFilters } from "../lib/listings";

interface SearchFiltersProps {
  defaultValues: ListingFilters;
}

const ratingOptions = [4, 3, 2, 1];

// Plain HTML GET form: submitting it navigates to `/?search=...&minPrice=...`
// and Next re-renders the (Server Component) home page with those
// searchParams — no "use client", no JS required for this to work, and the
// resulting URLs are shareable/bookmarkable search results.
function SearchFilters({ defaultValues }: SearchFiltersProps) {
  const hasActiveFilters = Boolean(
    defaultValues.search || defaultValues.minPrice || defaultValues.maxPrice || defaultValues.minRating
  );

  return (
    <form className="search-filters" method="GET" action="/" data-testid="search-filters-form">
      <input
        type="text"
        name="search"
        placeholder="Search by title or location"
        defaultValue={defaultValues.search ?? ""}
        aria-label="Search listings"
        data-testid="search-input"
      />
      <input
        type="number"
        name="minPrice"
        placeholder="Min price"
        defaultValue={defaultValues.minPrice ?? ""}
        min={0}
        aria-label="Minimum price"
        data-testid="min-price-input"
      />
      <input
        type="number"
        name="maxPrice"
        placeholder="Max price"
        defaultValue={defaultValues.maxPrice ?? ""}
        min={0}
        aria-label="Maximum price"
        data-testid="max-price-input"
      />
      <select
        name="minRating"
        defaultValue={defaultValues.minRating ?? ""}
        aria-label="Minimum rating"
        data-testid="min-rating-select"
      >
        <option value="">Any rating</option>
        {ratingOptions.map((rating) => (
          <option key={rating} value={rating}>
            {rating}+ stars
          </option>
        ))}
      </select>
      <button type="submit" className="primary-btn" data-testid="search-submit-btn">
        Search
      </button>
      {hasActiveFilters && (
        <a href="/" className="secondary-btn clear-filters-link" data-testid="clear-filters-link">
          Clear
        </a>
      )}
    </form>
  );
}

export default SearchFilters;
