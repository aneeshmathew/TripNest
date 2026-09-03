import Image from "next/image";
import Link from "next/link";
import { natGeoDestinations } from "../data/natGeoDestinations";

// Each tile links straight to /destinations/[slug] — a real page built
// from our own listings/hotels/restaurants/reviews for that location, not
// National Geographic content. See data/natGeoDestinations.ts for the
// source attribution.
function DestinationsCarousel() {
  return (
    <div className="destinations-carousel">
      {natGeoDestinations.map((destination) => (
        <Link
          href={`/destinations/${destination.slug}`}
          key={destination.slug}
          className="destination-tile"
          data-testid={`destination-${destination.slug}`}
        >
          <div className="destination-tile-image-wrap">
            <Image
              src={destination.imageUrl}
              alt={destination.name}
              fill
              sizes="220px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="destination-tile-content">
            <h3 className="destination-tile-name">{destination.name}</h3>
            <p className="destination-tile-location">{destination.location}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default DestinationsCarousel;
