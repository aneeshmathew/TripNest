import ApartmentList from "../components/ApartmentList";
import SearchFilters from "../components/SearchFilters";
import { getListings, type ListingFilters } from "../lib/listings";

interface HomePageProps {
  searchParams: Promise<ListingFilters>;
}

// Browsing/searching listings is public — no login required. This page is
// a Server Component so listing content is present in the initial HTML
// response for SEO. Reading filters from `searchParams` means search
// results are also just URLs (/?search=paris&minRating=4) — shareable,
// bookmarkable, and crawlable, not hidden behind client-side state.
export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = await searchParams;

  let listings;
  try {
    listings = await getListings(filters);
  } catch {
    return (
      <>
        <SearchFilters defaultValues={filters} />
        <p className="status-text error-text">
          Couldn&apos;t load apartments. Is the backend running?
        </p>
      </>
    );
  }

  return (
    <>
      <SearchFilters defaultValues={filters} />
      {listings.length === 0 ? (
        <p className="status-text">No apartments match your search — try adjusting the filters.</p>
      ) : (
        <ApartmentList apartments={listings} />
      )}
    </>
  );
}
