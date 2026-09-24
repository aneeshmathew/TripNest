import DestinationsCarousel from "./DestinationsCarousel";
import { popularDestinationSeeds } from "../data/popularDestinations";
import { getDestinationPhotoUrl } from "../lib/unsplash";

// Server Component (no "use client") so it can call the Unsplash search
// API directly — see lib/unsplash.ts, the same server-only integration
// the /destinations/[slug] pages already use, with the same "<Name>
// <Location>" query shape and fallback-to-placeholder behavior. Results
// are cached 24h per query there, so this only actually hits Unsplash
// once a day per destination, not on every homepage load.
async function DestinationsSection() {
  const destinations = await Promise.all(
    popularDestinationSeeds.map(async (destination) => ({
      slug: destination.slug,
      name: destination.name,
      location: destination.location,
      imageUrl: await getDestinationPhotoUrl(
        `${destination.name} ${destination.location}`,
        destination.imageUrl
      )
    }))
  );

  return (
    <section className="destinations-section">
      <h2 className="destinations-heading">Popular Destinations</h2>
      <p className="destinations-subheading">Top places travelers love</p>
      <DestinationsCarousel destinations={destinations} />
    </section>
  );
}

export default DestinationsSection;
