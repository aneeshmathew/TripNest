import Image from "next/image";
import Link from "next/link";
import { natGeoDestinations } from "../data/natGeoDestinations";
import type { Listing } from "../types/listing";

interface DestinationGalleryProps {
  listings: Listing[];
}
function findMatchingDestination(location: string) {
  const lowerLocation = location.toLowerCase();
  return natGeoDestinations.find((destination) => lowerLocation.includes(destination.name.toLowerCase()));
}

function DestinationGallery({ listings }: DestinationGalleryProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="section gallery-section">
      <h2 className="section-title">Explore more destinations</h2>
      <div className="gallery-grid">
        {listings.map((listing) => {
          const destination = findMatchingDestination(listing.location);
          const href = destination ? `/destinations/${destination.slug}` : `/apartments/${listing.id}`;

          return (
            <Link
              href={href}
              key={listing.id}
              className="gallery-item"
              aria-label={
                destination
                  ? `Explore ${destination.name}`
                  : `View ${listing.title} in ${listing.location}`
              }
            >
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                style={{ objectFit: "cover" }}
              />
              <span className="gallery-item-label">{listing.location}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default DestinationGallery;
