import Image from "next/image";
import Link from "next/link";
import type { Listing } from "../types/listing";

interface DestinationGalleryProps {
  listings: Listing[];
}

// Repurposes the reference design's Instagram-style photo gallery — real
// listing photos linking to real listing pages, instead of a social feed
// TripNest doesn't have.
function DestinationGallery({ listings }: DestinationGalleryProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="section gallery-section">
      <h2 className="section-title">Explore more destinations</h2>
      <div className="gallery-grid">
        {listings.map((listing) => (
          <Link
            href={`/apartments/${listing.id}`}
            key={listing.id}
            className="gallery-item"
            aria-label={`View ${listing.title} in ${listing.location}`}
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
        ))}
      </div>
    </section>
  );
}

export default DestinationGallery;
