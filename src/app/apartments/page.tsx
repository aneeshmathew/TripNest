import Link from "next/link";
import type { Metadata } from "next";
import { getListings } from "../../lib/listings";
import ApartmentCard from "../../components/ApartmentCard";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "Apartments",
  description: "Browse and search apartments on TripNest."
};

interface ApartmentsPageProps {
  searchParams: Promise<{ q?: string }>;
}

// Mirrors /hotels/page.tsx and /restaurants/page.tsx — this is
// ExploreCategories' "Apartments" tile's real destination (previously it
// just linked to "/", the marketing homepage, rather than anywhere
// search-ready). Same tab-search-form pattern as those two and as each
// tab on /destinations/[slug] — a keyword search that replaces, not
// adds to, the default.
export default async function ApartmentsPage({ searchParams }: ApartmentsPageProps) {
  const { q } = await searchParams;
  const trimmedQuery = q?.trim();

  let apartments;
  try {
    apartments = await getListings({ search: trimmedQuery });
  } catch {
    apartments = null;
  }

  return (
    <section>
      <BackButton />
      <h1 className="page-title">Apartments</h1>
      <p className="subtitle">Browse every apartment on TripNest.</p>

      <form
        className="tab-search-form"
        method="GET"
        action="/apartments"
        data-testid="apartments-search-form"
      >
        <input
          type="text"
          name="q"
          placeholder="Search for apartments nearby location"
          defaultValue={trimmedQuery ?? ""}
          aria-label="Search apartments"
          data-testid="apartments-search-input"
        />
        <button type="submit" className="primary-btn" data-testid="apartments-search-btn">
          Search
        </button>
        {trimmedQuery && (
          <Link
            href="/apartments"
            className="secondary-btn clear-filters-link"
            data-testid="apartments-search-clear"
          >
            Clear
          </Link>
        )}
      </form>

      {apartments === null ? (
        <p className="status-text error-text">Couldn&apos;t load apartments. Is the backend running?</p>
      ) : apartments.length === 0 ? (
        <p className="status-text">
          {trimmedQuery ? `No apartments match "${trimmedQuery}" yet.` : "No apartments listed yet."}
        </p>
      ) : (
        <div className="grid">
          {apartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>
      )}
    </section>
  );
}
