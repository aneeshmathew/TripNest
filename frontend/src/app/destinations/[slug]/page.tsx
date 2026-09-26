import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allDestinations } from "../../../data/allDestinations";
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
  getThingsToDoNear,
  getHotelsNear,
  getApartmentsNear,
  getRestaurantsNear
} from "../../../lib/geoapify";
import { getDestinationPhotoUrl } from "../../../lib/unsplash";

type TabKey = "apartments" | "hotels" | "restaurants" | "things-to-do" | "attractions" | "reviews";
const TABS: { key: TabKey; label: string }[] = [
  { key: "apartments", label: "Apartments" },
  { key: "hotels", label: "Hotels" },
  { key: "restaurants", label: "Restaurants" },
  { key: "things-to-do", label: "Things to Do" },
  { key: "attractions", label: "Attractions" },
  { key: "reviews", label: "Reviews" }
];

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; q?: string }>;
}

export async function generateStaticParams() {
  return allDestinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = allDestinations.find((d) => d.slug === slug);

  if (!destination) {
    return { title: "Destination not found" };
  }

  return {
    title: `${destination.name}, ${destination.location}`,
    description: `Apartments, hotels, restaurants, and reviews in ${destination.name}, ${destination.location} on TripNest.`
  };
}

export default async function DestinationPage({ params, searchParams }: DestinationPageProps) {
  const { slug } = await params;
  const { tab: rawTab, q: rawQuery } = await searchParams;
  const destination = allDestinations.find((d) => d.slug === slug);

  if (!destination) {
    notFound();
  }

  const heroImageUrl = await getDestinationPhotoUrl(
    `${destination.name} ${destination.location}`,
    destination.imageUrl
  );

  const activeTab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : "apartments";
  const trimmedQuery = rawQuery?.trim();
  // Apartments/Hotels/Restaurants each have their own search box below
  // that replaces this destination's name with whatever the visitor
  // types — Reviews has no search box and always uses destination.name.
  const effectiveKeyword = trimmedQuery || destination.name;

  // All four tabs filter OUR real data by this keyword — none of this is
  // National Geographic content. Empty tabs are expected and honest for
  // destinations (or searches) we don't have listings/hotels/restaurants
  // for yet, rather than showing fabricated inventory.
  let tabContent;
  try {
    if (activeTab === "apartments") {
      // Our own seeded Listing table only covers a handful of
      // destinations and is matched with a loose substring search, so it
      // regularly comes back empty or off-target. Geoapify's apartment/
      // chalet/gite categories (same Places API as Attractions/Things to
      // Do) supplement it with real, live nearby results — shown as a
      // second "more nearby" section underneath rather than replacing our
      // own listings, since only our own have real prices/reviews.
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
      // Same rationale as apartments above: supplement our thin seeded
      // Hotel table with live Geoapify hotel/motel/hostel/guest-house
      // results near the destination.
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
      // Same rationale as apartments/hotels above: supplement our thin
      // seeded Restaurant table with live Geoapify restaurant/cafe/fast
      // food/pub/bar results near the destination.
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
    } else if (activeTab === "things-to-do") {
      // Live third-party data (Geoapify Places, entertainment/leisure/
      // sport/natural categories) — replaces the old curated Activities
      // tab entirely. Geocodes the destination's name/location on the fly
      // since curated destinations don't have stored coordinates yet.
      const thingsToDo = await getThingsToDoNear(`${destination.name}, ${destination.location}`);
      tabContent = (
        <AttractionsGrid
          attractions={thingsToDo}
          placeName={destination.name}
          emptyMessage={`No things to do found near ${destination.name} yet.`}
          testIdPrefix="thing-to-do"
          gridTestId="things-to-do-grid"
        />
      );
    } else if (activeTab === "attractions") {
      // Live third-party data (Geoapify Places, sights/attraction
      // categories) — distinct from Things to Do above (different
      // category set, same underlying API). Geocodes the destination's
      // name/location on the fly since curated destinations don't have
      // stored coordinates yet.
      const attractions = await getAttractionsNear(`${destination.name}, ${destination.location}`);
      tabContent = <AttractionsGrid attractions={attractions} placeName={destination.name} />;
    } else {
      // Reviews tab: reviews of OUR apartment listings that match this
      // destination — there's no separate hotel/restaurant review system
      // yet (see README.md), so this only ever reflects Listing reviews.
      const listings = await getListings({ search: destination.name });
      const reviewLists = await Promise.all(listings.map((listing) => getReviews(listing.id)));
      const reviews = reviewLists.flat();
      tabContent =
        reviews.length === 0 ? (
          <p className="status-text">No reviews for {destination.name} yet.</p>
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
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, 1080px"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <h1>{destination.name}</h1>
      <p className="destination-location">{destination.location}</p>
      <p>{destination.blurb}</p>

      <nav className="destination-tabs">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/destinations/${slug}?tab=${t.key}`}
            className={`destination-tab${activeTab === t.key ? " active" : ""}`}
            data-testid={`destination-tab-${t.key}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* No search box on Things to Do, Attractions, or Reviews — both
          Things to Do and Attractions are live data already scoped to
          this destination (different Geoapify categories, same
          geocoded point), and Reviews is looked up by the destination
          itself, not by free-text keyword. */}
      {activeTab !== "reviews" && activeTab !== "things-to-do" && activeTab !== "attractions" && (
        <form
          className="tab-search-form"
          method="GET"
          action={`/destinations/${slug}`}
          data-testid="destination-tab-search-form"
        >
          <input type="hidden" name="tab" value={activeTab} />
          <LocationAutosuggest
            name="q"
            defaultValue={trimmedQuery ?? ""}
            placeholder={`Search for ${TABS.find((t) => t.key === activeTab)!.label.toLowerCase()} nearby`}
            aria-label={`Search ${activeTab}`}
            testIdPrefix="destination-tab-search"
          />
          <button type="submit" className="primary-btn" data-testid="destination-tab-search-btn">
            Search
          </button>
          {trimmedQuery && (
            <Link
              href={`/destinations/${slug}?tab=${activeTab}`}
              className="secondary-btn clear-filters-link"
              data-testid="destination-tab-search-clear"
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
