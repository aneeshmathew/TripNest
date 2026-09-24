"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

export interface DestinationTileData {
  slug: string;
  name: string;
  location: string;
  imageUrl: string;
}

const AUTO_ADVANCE_MS = 5000;
const TILES_PER_PAGE = 6;

function DestinationTile({ destination }: { destination: DestinationTileData }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
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
// Paginated (not continuous-scroll) carousel: TILES_PER_PAGE (6) tiles
// per page, prev/next and the dots below all jump a full page at once,
// matching the design reference's page-dot pattern rather than the
// smooth one-tile-at-a-time drift this used to do. Auto-advances one page
// every 5s, wrapping from the last page back to the first; pauses on
// hover/focus so it doesn't yank a page out from under someone mid-click.
function DestinationsCarousel({ destinations }: { destinations: DestinationTileData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(destinations.length / TILES_PER_PAGE));

  const scrollToPage = (page: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    if (!track) return;
    // One page = the track's own visible width (it's stretched to fill
    // the space between the two nav buttons — see .destinations-carousel
    // { flex: 1 } — so clientWidth here is exactly 6 tiles wide).
    track.scrollTo({ left: page * track.clientWidth, behavior });
  };

  const goToPage = (page: number, behavior: ScrollBehavior = "smooth") => {
    const wrapped = (page + totalPages) % totalPages;
    setActivePage(wrapped);
    scrollToPage(wrapped, behavior);
  };

  useEffect(() => {
    if (isPaused || totalPages <= 1) return;

    const interval = setInterval(() => {
      setActivePage((current) => {
        const next = (current + 1) % totalPages;
        scrollToPage(next);
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [isPaused, totalPages]);

  if (destinations.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="destinations-carousel-wrap"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
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
