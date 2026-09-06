import Link from "next/link";
import type { Metadata } from "next";
import { getRestaurants } from "../../lib/restaurants";
import RestaurantCard from "../../components/RestaurantCard";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Browse and search restaurants on TripNest."
};

interface RestaurantsPageProps {
  searchParams: Promise<{ q?: string }>;
}

// Mirrors /hotels/page.tsx — see that file's comment for why this exists
// (ExploreCategories needed a real, general destination to link to,
// which didn't exist before).
export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  const { q } = await searchParams;
  const trimmedQuery = q?.trim();

  let restaurants;
  try {
    restaurants = await getRestaurants(trimmedQuery);
  } catch {
    restaurants = null;
  }

  return (
    <section>
      <h1 className="page-title">Restaurants</h1>
      <p className="subtitle">Browse every restaurant on TripNest.</p>

      <form
        className="tab-search-form"
        method="GET"
        action="/restaurants"
        data-testid="restaurants-search-form"
      >
        <input
          type="text"
          name="q"
          placeholder="Search restaurants by name, cuisine, or location"
          defaultValue={trimmedQuery ?? ""}
          aria-label="Search restaurants"
          data-testid="restaurants-search-input"
        />
        <button type="submit" className="primary-btn" data-testid="restaurants-search-btn">
          Search
        </button>
        {trimmedQuery && (
          <Link
            href="/restaurants"
            className="secondary-btn clear-filters-link"
            data-testid="restaurants-search-clear"
          >
            Clear
          </Link>
        )}
      </form>

      {restaurants === null ? (
        <p className="status-text error-text">Couldn&apos;t load restaurants. Is the backend running?</p>
      ) : restaurants.length === 0 ? (
        <p className="status-text">
          {trimmedQuery ? `No restaurants match "${trimmedQuery}" yet.` : "No restaurants listed yet."}
        </p>
      ) : (
        <div className="grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </section>
  );
}
