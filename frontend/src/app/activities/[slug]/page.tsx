import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activityHighlights } from "../../../data/activityHighlights";
import { getListings } from "../../../lib/listings";
import { getHotels } from "../../../lib/hotels";
import { getRestaurants } from "../../../lib/restaurants";
import { getReviews } from "../../../lib/reviews";
import ApartmentList from "../../../components/ApartmentList";
import HotelCard from "../../../components/HotelCard";
import RestaurantCard from "../../../components/RestaurantCard";
import ReviewItem from "../../../components/ReviewItem";
import BackButton from "../../../components/BackButton";
import LocationAutosuggest from "../../../components/LocationAutosuggest";
import AttractionsGrid from "../../../components/AttractionsGrid";
import {
  getAttractionsNear,
  getHotelsNear,
  getApartmentsNear,
  getRestaurantsNear
} from "../../../lib/geoapify";
import { getDestinationPhotoUrl } from "../../../lib/unsplash";

type TabKey = "apartments" | "hotels" | "restaurants" | "attractions" | "reviews";
const TABS: { key: TabKey; label: string }[] = [
  { key: "apartments", label: "Apartments" },
  { key: "hotels", label: "Hotels" },
  { key: "restaurants", label: "Restaurants" },
  { key: "attractions", label: "Attractions" },
  { key: "reviews", label: "Reviews" }
];

interface ActivityPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; q?: string }>;
}

export async function generateStaticParams() {
  return activityHighlights.map((highlight) => ({ slug: highlight.slug }));
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const highlight = activityHighlights.find((h) => h.slug === slug);

  if (!highlight) {
    return { title: "Activity not found" };
  }

  return {
    title: `${highlight.activity} trips`,
    description: `Apartments, hotels, restaurants, and reviews for ${highlight.activity.toLowerCase()} trips on TripNest.`
  };
}

// Like /destinations/[slug], but keyed by activity instead of place. There's
// no Attraction/Activity model in the backend yet (see README, Feature Gaps
// 2.1), so "browsing by activity" here means running our existing keyword
// search (title/location/description ILIKE) against real listings, hotels,
// and restaurants — using the activity's real-world location
// (highlight.location, e.g. "Dublin, Ireland" for hiking) as the default
// keyword, or whatever the visitor types into a tab's own search box
// instead. Each activity is pinned to a location where we do have real
// seeded inventory (see data/activityHighlights.ts), so — unlike an
// earlier version of this page that defaulted to searching for the
// activity's own name (e.g. "Hiking"), which never matched anything — the
// tabs show genuine results by default, not an empty state.
export default async function ActivityPage({ params, searchParams }: ActivityPageProps) {
  const { slug } = await params;
  const { tab: rawTab, q: rawQuery } = await searchParams;
  const highlight = activityHighlights.find((h) => h.slug === slug);

  if (!highlight) {
    notFound();
  }

  const activeTab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : "apartments";
  const trimmedQuery = rawQuery?.trim();
  // Reviews has no search box of its own (see below) — it always follows
  // whatever the Apartments tab's effective keyword is.
  const effectiveKeyword = trimmedQuery || highlight.location;

  const heroImageUrl = await getDestinationPhotoUrl(
    `${highlight.activity} ${highlight.location}`,
    highlight.imageUrl
  );

  let tabContent;
  try {
    if (activeTab === "apartments") {
      // Same fix as the destination page's Apartments tab: our seeded
      // Listing table is thin and keyword-matched, so it's supplemented
      // with live Geoapify apartment/chalet/gite results near the
      // activity's pinned real-world location.
      const [listings, geoApartments] = await Promise.all([
        getListings({ search: effectiveKeyword }),
        getApartmentsNear(effectiveKeyword)
      ]);
      tabContent = (
        <>
          {listings.length === 0 ? (
            <p className="status-text">No apartments match &quot;{effectiveKeyword}&quot; yet.</p>
          ) : (
            <ApartmentList apartments={listings} />
          )}
          {geoApartments.length > 0 && (
            <div className="destination-tab-more-results">
              <h3 className="destination-tab-more-heading">More apartments nearby</h3>
              <AttractionsGrid
                attractions={geoApartments}
                placeName={effectiveKeyword}
                testIdPrefix="geo-apartment"
                gridTestId="geo-apartments-grid"
              />
            </div>
          )}
        </>
      );
    } else if (activeTab === "hotels") {
      // Same fix as the destination page's Hotels tab.
      const [hotels, geoHotels] = await Promise.all([
        getHotels(effectiveKeyword),
        getHotelsNear(effectiveKeyword)
      ]);
      tabContent = (
        <>
          {hotels.length === 0 ? (
            <p className="status-text">No hotels match &quot;{effectiveKeyword}&quot; yet.</p>
          ) : (
            <div className="grid">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
          {geoHotels.length > 0 && (
            <div className="destination-tab-more-results">
              <h3 className="destination-tab-more-heading">More hotels nearby</h3>
              <AttractionsGrid
                attractions={geoHotels}
                placeName={effectiveKeyword}
                testIdPrefix="geo-hotel"
                gridTestId="geo-hotels-grid"
              />
            </div>
          )}
        </>
      );
    } else if (activeTab === "restaurants") {
      // Same fix as the destination page's Restaurants tab.
      const [restaurants, geoRestaurants] = await Promise.all([
        getRestaurants(effectiveKeyword),
        getRestaurantsNear(effectiveKeyword)
      ]);
      tabContent = (
        <>
          {restaurants.length === 0 ? (
            <p className="status-text">No restaurants match &quot;{effectiveKeyword}&quot; yet.</p>
          ) : (
            <div className="grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          {geoRestaurants.length > 0 && (
            <div className="destination-tab-more-results">
              <h3 className="destination-tab-more-heading">More restaurants nearby</h3>
              <AttractionsGrid
                attractions={geoRestaurants}
                placeName={effectiveKeyword}
                testIdPrefix="geo-restaurant"
                gridTestId="geo-restaurants-grid"
              />
            </div>
          )}
        </>
      );
    } else if (activeTab === "attractions") {
      // Live third-party data (Geoapify Places), keyed off the activity's
      // pinned real-world location — same pattern as the destination
      // page's Attractions tab.
      const attractions = await getAttractionsNear(effectiveKeyword);
      tabContent = <AttractionsGrid attractions={attractions} placeName={effectiveKeyword} />;
    } else {
      // Reviews tab: reviews of OUR apartment listings that match this
      // activity's effective keyword (its real location, or the visitor's
      // own search from the Apartments tab) — no search box on this tab
      // (see the conditional render below), and no separate hotel/
      // restaurant review system yet (see README.md), same constraints as
      // the destination page's Reviews tab.
      const listings = await getListings({ search: effectiveKeyword });
      const reviewLists = await Promise.all(listings.map((listing) => getReviews(listing.id)));
      const reviews = reviewLists.flat();
      tabContent =
        reviews.length === 0 ? (
          <p className="status-text">No reviews for {highlight.activity.toLowerCase()} trips yet.</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} isOwn={false} />
            ))}
          </div>
        );
    }
  } catch {
    tabContent = (
      <p className="status-text error-text">Couldn&apos;t load this tab. Is the backend running?</p>
    );
  }

  return (
    <section className="destination-page">
      <BackButton />
      <div className="destination-hero-wrap">
        <Image
          src={heroImageUrl}
          alt={highlight.activity}
          fill
          sizes="(max-width: 768px) 100vw, 1080px"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <h1>{highlight.activity} trips</h1>
      <p className="destination-location">{highlight.title}</p>
      <p className="activity-highlight-location">Featured location: {highlight.location}</p>

      <nav className="destination-tabs">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/activities/${slug}?tab=${t.key}`}
            className={`destination-tab${activeTab === t.key ? " active" : ""}`}
            data-testid={`activity-tab-${t.key}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* No search box on Attractions or Reviews — Attractions is live
          data already scoped to this activity's location, and Reviews is
          looked up by the activity itself, not by free-text keyword, same
          as the destination page. */}
      {activeTab !== "reviews" && activeTab !== "attractions" && (
        <form
          className="tab-search-form"
          method="GET"
          action={`/activities/${slug}`}
          data-testid="activity-tab-search-form"
        >
          <input type="hidden" name="tab" value={activeTab} />
          <LocationAutosuggest
            name="q"
            defaultValue={trimmedQuery ?? ""}
            placeholder={`Search for ${TABS.find((t) => t.key === activeTab)!.label.toLowerCase()} nearby`}
            aria-label={`Search ${activeTab}`}
            testIdPrefix="activity-tab-search"
          />
          <button type="submit" className="primary-btn" data-testid="activity-tab-search-btn">
            Search
          </button>
          {trimmedQuery && (
            <Link
              href={`/activities/${slug}?tab=${activeTab}`}
              className="secondary-btn clear-filters-link"
              data-testid="activity-tab-search-clear"
            >
              Clear
            </Link>
          )}
        </form>
      )}

      <div className="destination-tab-content">{tabContent}</div>
    </section>
  );
}
