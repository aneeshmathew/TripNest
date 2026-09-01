import ApartmentList from "../components/ApartmentList";
import ContinentMap from "../components/ContinentMap";
import DestinationGallery from "../components/DestinationGallery";
import EasyToUseSection from "../components/EasyToUseSection";
import FaqSection from "../components/FaqSection";
import FeaturedStays from "../components/FeaturedStays";
import Hero from "../components/Hero";
import MapSection from "../components/MapSection";
import PlanWithFriendsSection from "../components/PlanWithFriendsSection";
import RecommendationsSection from "../components/RecommendationsSection";
import SearchFilters from "../components/SearchFilters";
import TestimonialSection from "../components/TestimonialSection";
import { getFeaturedListings, getListings, type ListingFilters } from "../lib/listings";
import { getFeaturedReviews } from "../lib/reviews";

interface HomePageProps {
  searchParams: Promise<ListingFilters>;
}

function hasActiveFilters(filters: ListingFilters): boolean {
  return Boolean(
    filters.search || filters.minPrice || filters.maxPrice || filters.minRating || filters.continent
  );
}

// Browsing/searching listings is public — no login required. This page is
// a Server Component so listing content is present in the initial HTML
// response for SEO.
//
// Two distinct states, deliberately not layered on top of each other:
// - No search yet: the full marketing front door (hero, map, featured
//   stays, etc.) — no listing dump, no duplicate search UI.
// - A search/filter/continent is active: a focused results view
//   (SearchFilters + map + results), with the marketing sections dropped
//   so the results aren't buried under them.
export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = await searchParams;

  if (!hasActiveFilters(filters)) {
    let featuredListings: Awaited<ReturnType<typeof getFeaturedListings>> = [];
    let featuredReviews: Awaited<ReturnType<typeof getFeaturedReviews>> = [];

    try {
      [featuredListings, featuredReviews] = await Promise.all([
        getFeaturedListings(6),
        getFeaturedReviews()
      ]);
    } catch {
      // Featured content is a nice-to-have on the front door — if the
      // backend's unreachable, still render the page (sections that need
      // data just render nothing) rather than showing a hard error before
      // the visitor has even searched for anything.
    }

    const galleryListings = featuredListings.slice(0, 6);
    const visualListing = featuredListings[0] ?? null;

    return (
      <>
        <Hero />
        <MapSection />
        <FeaturedStays listings={featuredListings} />
        <EasyToUseSection visualListing={visualListing} />
        <PlanWithFriendsSection />
        <RecommendationsSection />
        <FaqSection />
        <TestimonialSection reviews={featuredReviews} />
        <DestinationGallery listings={galleryListings} />
      </>
    );
  }

  let listings;
  try {
    listings = await getListings(filters);
  } catch {
    return (
      <>
        <SearchFilters defaultValues={filters} />
        <ContinentMap selected={filters.continent} />
        <p className="status-text error-text">
          Couldn&apos;t load apartments. Is the backend running?
        </p>
      </>
    );
  }

  return (
    <>
      <SearchFilters defaultValues={filters} />
      <ContinentMap selected={filters.continent} />
      {listings.length === 0 ? (
        <p className="status-text">No apartments match your search — try adjusting the filters.</p>
      ) : (
        <ApartmentList apartments={listings} />
      )}
    </>
  );
}
