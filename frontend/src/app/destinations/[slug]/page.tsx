import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { natGeoDestinations, NAT_GEO_SOURCE_URL } from "../../../data/natGeoDestinations";
import { getListings } from "../../../lib/listings";
import { getHotels } from "../../../lib/hotels";
import { getRestaurants } from "../../../lib/restaurants";
import { getReviews } from "../../../lib/reviews";
import ApartmentList from "../../../components/ApartmentList";
import HotelCard from "../../../components/HotelCard";
import RestaurantCard from "../../../components/RestaurantCard";
import ReviewItem from "../../../components/ReviewItem";

type TabKey = "apartments" | "hotels" | "restaurants" | "reviews";
const TABS: { key: TabKey; label: string }[] = [
  { key: "apartments", label: "Apartments" },
  { key: "hotels", label: "Hotels" },
  { key: "restaurants", label: "Restaurants" },
  { key: "reviews", label: "Reviews" }
];

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateStaticParams() {
  return natGeoDestinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = natGeoDestinations.find((d) => d.slug === slug);

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
  const { tab: rawTab } = await searchParams;
  const destination = natGeoDestinations.find((d) => d.slug === slug);

  if (!destination) {
    notFound();
  }

  const activeTab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : "apartments";

  // All four tabs filter OUR real data by this destination's name — none
  // of this is National Geographic content. Empty tabs are expected and
  // honest for destinations we don't have listings/hotels/restaurants
  // for yet, rather than showing fabricated inventory.
  let tabContent;
  try {
    if (activeTab === "apartments") {
      const listings = await getListings({ search: destination.name });
      tabContent =
        listings.length === 0 ? (
          <p className="status-text">No apartments listed in {destination.name} yet.</p>
        ) : (
          <ApartmentList apartments={listings} />
        );
    } else if (activeTab === "hotels") {
      const hotels = await getHotels(destination.name);
      tabContent =
        hotels.length === 0 ? (
          <p className="status-text">No hotels listed in {destination.name} yet.</p>
        ) : (
          <div className="grid">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        );
    } else if (activeTab === "restaurants") {
      const restaurants = await getRestaurants(destination.name);
      tabContent =
        restaurants.length === 0 ? (
          <p className="status-text">No restaurants listed in {destination.name} yet.</p>
        ) : (
          <div className="grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        );
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
      <div className="destination-hero-wrap">
        <Image
          src={destination.imageUrl}
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
      <p className="destinations-attribution">
        Featured in{" "}
        <a href={NAT_GEO_SOURCE_URL} target="_blank" rel="noopener noreferrer">
          National Geographic&apos;s Best of the World 2026
        </a>
      </p>

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

      <div className="destination-tab-content">{tabContent}</div>
    </section>
  );
}
