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

type TabKey = "apartments" | "hotels" | "restaurants" | "reviews";
const TABS: { key: TabKey; label: string }[] = [
  { key: "apartments", label: "Apartments" },
  { key: "hotels", label: "Hotels" },
  { key: "restaurants", label: "Restaurants" },
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

  let tabContent;
  try {
    if (activeTab === "apartments") {
      const listings = await getListings({ search: effectiveKeyword });
      tabContent =
        listings.length === 0 ? (
          <p className="status-text">No apartments match &quot;{effectiveKeyword}&quot; yet.</p>
        ) : (
          <ApartmentList apartments={listings} />
        );
    } else if (activeTab === "hotels") {
      const hotels = await getHotels(effectiveKeyword);
      tabContent =
        hotels.length === 0 ? (
          <p className="status-text">No hotels match &quot;{effectiveKeyword}&quot; yet.</p>
        ) : (
          <div className="grid">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        );
    } else if (activeTab === "restaurants") {
      const restaurants = await getRestaurants(effectiveKeyword);
      tabContent =
        restaurants.length === 0 ? (
          <p className="status-text">No restaurants match &quot;{effectiveKeyword}&quot; yet.</p>
        ) : (
          <div className="grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        );
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
          src={highlight.imageUrl}
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

      {/* No search box on Reviews — reviews are looked up by the activity
          itself, not by free-text keyword, same as the destination page. */}
      {activeTab !== "reviews" && (
        <form
          className="tab-search-form"
          method="GET"
          action={`/activities/${slug}`}
          data-testid="activity-tab-search-form"
        >
          <input type="hidden" name="tab" value={activeTab} />
          <input
            type="text"
            name="q"
            placeholder={`Search for ${TABS.find((t) => t.key === activeTab)!.label.toLowerCase()} nearby`}
            defaultValue={trimmedQuery ?? ""}
            aria-label={`Search ${activeTab}`}
            data-testid="activity-tab-search-input"
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
