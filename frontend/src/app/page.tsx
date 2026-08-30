import ApartmentList from "../components/ApartmentList";
import { getListings } from "../lib/listings";

// Browsing listings is public — no login required. This page is a Server
// Component so the listing titles/prices/ratings are present in the
// initial HTML response, not fetched client-side after hydration. No
// client boundary needed here now that sorting has been removed —
// ApartmentList is server-renderable end to end.
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

  return <ApartmentList apartments={listings} />;
}
