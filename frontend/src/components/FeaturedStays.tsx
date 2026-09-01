import ApartmentCard from "./ApartmentCard";
import type { Listing } from "../types/listing";

interface FeaturedStaysProps {
  listings: Listing[];
}

// Repurposes the reference design's "trip inspiration" card row to show
// real, highest-rated listings instead of fabricated activity categories
// TripNest doesn't have data for.
function FeaturedStays({ listings }: FeaturedStaysProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="section featured-stays" id="featured-stays">
      <h2 className="section-title">Featured stays</h2>
      <p className="section-subtitle">Our highest-rated apartments, picked by real guests</p>
      <div className="featured-stays-row">
        {listings.map((listing) => (
          <div className="featured-stay-item" key={listing.id}>
            <ApartmentCard apartment={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedStays;
