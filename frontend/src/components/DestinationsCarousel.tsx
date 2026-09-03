"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { natGeoDestinations } from "../data/natGeoDestinations";

const AUTO_ADVANCE_MS = 2000;
const FALLBACK_TILE_STEP_PX = 216; // 200px tile + 16px (1rem) gap, if measurement fails

// Each tile links straight to /destinations/[slug] — a real page built
// from our own listings/hotels/restaurants/reviews for that location, not
// National Geographic content. See data/natGeoDestinations.ts for the
// source attribution.
//
// Auto-advances one tile every 2s — the one piece of the destinations UI
// that genuinely needs client JS, unlike the rest of the app's
// URL-driven interactions. Pauses on hover/focus so it doesn't yank a
// tile out from under someone mid-click or mid-tab, and loops back to
// the start after the last tile. Prev/Next buttons give manual control
// too — an auto-only carousel with no way to pause or go back is a
// usability trap, especially for screen-reader or keyboard users.
function DestinationsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const getTileStep = () => {
    const track = trackRef.current;
    const firstTile = track?.querySelector<HTMLElement>(".destination-tile");
    return firstTile ? firstTile.offsetWidth + 16 : FALLBACK_TILE_STEP_PX;
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;

      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + getTileStep(),
        behavior: "smooth"
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollByOneTile = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * getTileStep(), behavior: "smooth" });
  };

  return (
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
        onClick={() => scrollByOneTile(-1)}
        aria-label="Previous destination"
        data-testid="destinations-carousel-prev"
      >
        ‹
      </button>

      <div className="destinations-carousel" ref={trackRef}>
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

      <button
        type="button"
        className="carousel-nav-btn carousel-nav-next"
        onClick={() => scrollByOneTile(1)}
        aria-label="Next destination"
        data-testid="destinations-carousel-next"
      >
        ›
      </button>
    </div>
  );
}

export default DestinationsCarousel;
