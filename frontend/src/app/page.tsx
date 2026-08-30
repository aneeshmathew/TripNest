import ListingsBrowser from "../components/ListingsBrowser";
import { getListings } from "../lib/listings";

// Browsing listings is public — no login required. This page is a Server
// Component so the listing titles/prices/ratings are present in the
// initial HTML response, not fetched client-side after hydration.
export default async function HomePage() {
  let listings;

  try {
    listings = await getListings();
  } catch {
    return (
      <p className="status-text error-text">
        Couldn&apos;t load apartments. Is the backend running?
      </p>
    );
  }

  return <ListingsBrowser initialListings={listings} />;
}
