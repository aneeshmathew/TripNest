import ActivitiesSection from "../components/ActivitiesSection";
import ApartmentList from "../components/ApartmentList";
import DestinationGallery from "../components/DestinationGallery";
import DestinationsSection from "../components/DestinationsSection";
import EasyToUseSection from "../components/EasyToUseSection";
import FaqSection from "../components/FaqSection";
import FeaturedStays from "../components/FeaturedStays";
import Hero from "../components/Hero";
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
// - No search yet: the full marketing front door (hero, destinations
//   carousel, featured stays, etc.) — no listing dump, no duplicate
//   search UI.
// - A search/filter is active: a focused results view (SearchFilters +
//   results), with the marketing sections dropped so the results aren't
//   buried under them.
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

    return (
      <>
        <Hero />
        <DestinationsSection />
        <ActivitiesSection />
        <FeaturedStays listings={featuredListings} />
        <EasyToUseSection />
        <RecommendationsSection />
        <FaqSection />
        <TestimonialSection reviews={featuredReviews} />
        <DestinationGallery />
      </>
    );
  }

  let listings;
  try {
    listings = await getListings(filters);
  } catch {
    return (
      <>
        <SearchResultsIntro />
        <SearchFilters defaultValues={filters} />
        <p className="status-text error-text">
          Couldn&apos;t load apartments. Is the backend running?
        </p>
      </>
    );
  }

  return (
    <>
      <SearchResultsIntro />
      <SearchFilters defaultValues={filters} />
      {listings.length === 0 ? (
        <p className="status-text">No apartments match your search — try adjusting the filters.</p>
      ) : (
        <ApartmentList apartments={listings} />
      )}
    </>
  );
}

// Real text (not the flat PNG this used to live inside — see
// AppShell.tsx) shown once, right above the search UI, only in the
// active-search state — the marketing front door already has Hero for
// this same "here's what TripNest is" role, so this would be redundant
// there.
function SearchResultsIntro() {
  return (
    <div className="search-results-intro">
      <h1 className="search-results-heading">The Value For Experience</h1>
      <p className="search-results-subheading">Relax&hellip; You&apos;re with us! We make it simple.</p>
    </div>
  );
}
