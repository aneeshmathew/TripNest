"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

export interface DestinationTileData {
  slug: string;
  name: string;
  location: string;
  imageUrl: string;
  /** Local picsum placeholder — swapped in client-side if imageUrl (the
      real Unsplash photo) fails to load. See DestinationTile below. */
  fallbackImageUrl: string;
}

const TILES_PER_PAGE = 6;

// Unsplash's CDN occasionally fails a hotlinked image request (rate
// limiting, a transient 5xx, a since-removed photo) even though the
// server-side search that found its URL succeeded — that's a client-side
// image-load failure, not something a server cache can prevent. This
// swaps to the stable local placeholder if that happens, so a bad request
// shows a plain placeholder instead of a broken-image icon.
function DestinationTile({ destination }: { destination: DestinationTileData }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="destination-tile"
      data-testid={`destination-${destination.slug}`}
    >
      <div className="destination-tile-image-wrap">
        <Image
          src={imageFailed ? destination.fallbackImageUrl : destination.imageUrl}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          style={{ objectFit: "cover" }}
          onError={() => setImageFailed(true)}
        />
        <div className="destination-tile-scrim" />
        <div className="destination-tile-content">
          <h3 className="destination-tile-name">
            <MapPin size={13} aria-hidden="true" />
            {destination.name}
          </h3>
          <p className="destination-tile-location">{destination.location}</p>
        </div>
      </div>
    </Link>
  );
}

// Each tile links straight to /destinations/[slug] — a real page built
// from our own listings/hotels/restaurants/reviews for that location.
//
// Paginated (not continuous-scroll, and no longer auto-advancing — removed
// per request) carousel: TILES_PER_PAGE (6) tiles per page, prev/next and
// the dots below all jump a full page at once. Purely user-driven now —
// nothing moves until a button or dot is clicked.
function DestinationsCarousel({ destinations }: { destinations: DestinationTileData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(destinations.length / TILES_PER_PAGE));

  const goToPage = (page: number) => {
    const wrapped = (page + totalPages) % totalPages;
    setActivePage(wrapped);
    const track = trackRef.current;
    if (!track) return;
    // One page = the track's own visible width (it's stretched to fill
    // the space between the two nav buttons — see .destinations-carousel
    // { flex: 1 } — so clientWidth here is exactly 6 tiles wide).
    track.scrollTo({ left: wrapped * track.clientWidth, behavior: "smooth" });
  };

  if (destinations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="destinations-carousel-wrap">
        <button
          type="button"
          className="carousel-nav-btn carousel-nav-prev"
          onClick={() => goToPage(activePage - 1)}
          aria-label="Previous destinations"
          data-testid="destinations-carousel-prev"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="destinations-carousel" ref={trackRef}>
          {destinations.map((destination) => (
            <DestinationTile key={destination.slug} destination={destination} />
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav-btn carousel-nav-next"
          onClick={() => goToPage(activePage + 1)}
          aria-label="Next destinations"
          data-testid="destinations-carousel-next"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {totalPages > 1 && (
        <div className="destinations-dots" role="tablist" aria-label="Destination pages">
          {Array.from({ length: totalPages }, (_, page) => (
            <button
              key={page}
              type="button"
              role="tab"
              aria-selected={page === activePage}
              aria-label={`Show destinations page ${page + 1}`}
              className={`destinations-dot${page === activePage ? " active" : ""}`}
              onClick={() => goToPage(page)}
              data-testid={`destinations-dot-${page}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default DestinationsCarousel;
