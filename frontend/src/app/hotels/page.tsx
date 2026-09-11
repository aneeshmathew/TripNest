import Link from "next/link";
import type { Metadata } from "next";
import { getHotels } from "../../lib/hotels";
import HotelCard from "../../components/HotelCard";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Browse and search hotels on TripNest."
};

interface HotelsPageProps {
  searchParams: Promise<{ q?: string }>;
}

// Previously there was no standalone way to browse hotels at all — only
// per-destination or per-activity tabs (see /destinations/[slug] and
// /activities/[slug]). This gives ExploreCategories' "Hotels" tile
// somewhere real to link to: every hotel, with the same tab-search-form
// pattern (a keyword search that replaces, not adds to, the default —
// see those pages' comments for why) rather than a destination/activity
// keyword baked in.
export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const { q } = await searchParams;
  const trimmedQuery = q?.trim();

  let hotels;
  try {
    hotels = await getHotels(trimmedQuery);
  } catch {
    hotels = null;
  }

  return (
    <section>
      <BackButton />
      <h1 className="page-title">Hotels</h1>
      <p className="subtitle">Browse every hotel on TripNest.</p>

      <form className="tab-search-form" method="GET" action="/hotels" data-testid="hotels-search-form">
        <input
          type="text"
          name="q"
          placeholder="Search for hotels nearby location"
          defaultValue={trimmedQuery ?? ""}
          aria-label="Search hotels"
          data-testid="hotels-search-input"
        />
        <button type="submit" className="primary-btn" data-testid="hotels-search-btn">
          Search
        </button>
        {trimmedQuery && (
          <Link href="/hotels" className="secondary-btn clear-filters-link" data-testid="hotels-search-clear">
            Clear
          </Link>
        )}
      </form>

      {hotels === null ? (
        <p className="status-text error-text">Couldn&apos;t load hotels. Is the backend running?</p>
      ) : hotels.length === 0 ? (
        <p className="status-text">
          {trimmedQuery ? `No hotels match "${trimmedQuery}" yet.` : "No hotels listed yet."}
        </p>
      ) : (
        <div className="grid">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </section>
  );
}
