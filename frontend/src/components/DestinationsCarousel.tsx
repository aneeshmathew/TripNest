"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { natGeoDestinations } from "../data/natGeoDestinations";

const AUTO_ADVANCE_MS = 2000;
const FALLBACK_TILE_STEP_PX = 216; // 200px tile + 16px (1rem) gap, if measurement fails

type Destination = (typeof natGeoDestinations)[number];

// `hidden` renders the loop-clone copy: aria-hidden + unfocusable, so
// screen readers and keyboard users only ever see the 25 real
// destinations, not a confusing doubled list. It's still a real,
// clickable link for mouse/touch — that's fine, it goes to the exact
// same destination page either way.
function DestinationTile({ destination, hidden }: { destination: Destination; hidden?: boolean }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="destination-tile"
      data-testid={hidden ? undefined : `destination-${destination.slug}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <div className="destination-tile-image-wrap">
        <Image
          src={destination.imageUrl}
          alt={hidden ? "" : destination.name}
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
  );
}

// Each tile links straight to /destinations/[slug] — a real page built
// from our own listings/hotels/restaurants/reviews for that location, not
// National Geographic content. See data/natGeoDestinations.ts for the
// source attribution.
//
// Auto-advances one tile every 2s — the one piece of the destinations UI
// that genuinely needs client JS, unlike the rest of the app's
// URL-driven interactions. Pauses on hover/focus so it doesn't yank a
// tile out from under someone mid-click or mid-tab.
//
// True circular looping, not a jump-back-to-start reset: the tile set is
// rendered TWICE (the second copy is the aria-hidden clone above — purely
// visual filler for the loop). Scrolling forward continues seamlessly
// into the second copy; once scrollLeft passes one full set's width, we
// instantly (no animation) subtract that width, landing back on the
// pixel-identical first copy. Because that snap happens between
// animations (at rest, not mid-scroll) and the two copies are visually
// identical, it's imperceptible — the carousel just appears to loop
// forever instead of visibly rewinding to the start.
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

      const originalSetWidth = getTileStep() * natGeoDestinations.length;
      // Snap back BEFORE starting the next scroll, while at rest — doing
      // it after/during the smooth-scroll animation would cause a visible
      // stutter.
      if (track.scrollLeft >= originalSetWidth) {
        track.scrollLeft -= originalSetWidth;
      }

      track.scrollTo({ left: track.scrollLeft + getTileStep(), behavior: "smooth" });
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
          <DestinationTile key={destination.slug} destination={destination} />
        ))}
        {natGeoDestinations.map((destination) => (
          <DestinationTile key={`${destination.slug}-loop-clone`} destination={destination} hidden />
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
