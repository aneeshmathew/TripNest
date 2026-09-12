"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { worldDestinations } from "../data/worldDestinations";

const FALLBACK_TILE_STEP_PX = 216; // 200px tile + 16px (1rem) gap, if measurement fails
const DOT_COUNT = 5;
const DESTINATIONS_PER_DOT = Math.ceil(worldDestinations.length / DOT_COUNT);

// Every tile always links to /destinations/[slug] — a real page built from
// our own listings/hotels/restaurants/reviews for that location. Unlike
// the old listings-driven version of this section, there's no /apartments
// fallback: every entry here comes from a curated destination list (see
// data/worldDestinations.ts), so the destination page always exists.
function GalleryTile({ destination }: { destination: (typeof worldDestinations)[number] }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="destination-tile"
      data-testid={`gallery-destination-${destination.slug}`}
      aria-label={`Explore ${destination.name}`}
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
  );
}

// Browsable strip of 50 household-name world destinations — deliberately
// separate from the 25 curated Nat Geo picks in the homepage's top
// DestinationsCarousel (data/natGeoDestinations.ts), so nothing here is a
// repeat of what's already up top. Manual left/right scrolling, plus 5
// jump-to-section dots below the strip (each covering an equal slice of
// the 50 tiles) so a visitor can skip straight to roughly where they want
// without clicking "next" repeatedly. No auto-advance/infinite loop like
// the top carousel — this is a much larger "browse at your own pace" set.
function DestinationGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const getTileStep = () => {
    const track = trackRef.current;
    const firstTile = track?.querySelector<HTMLElement>(".destination-tile");
    return firstTile?.offsetWidth ? firstTile.offsetWidth + 16 : FALLBACK_TILE_STEP_PX;
  };

  const scrollByOneTile = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * getTileStep(), behavior: "smooth" });
  };

  const scrollToDot = (dotIndex: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: dotIndex * DESTINATIONS_PER_DOT * getTileStep(), behavior: "smooth" });
    setActiveDot(dotIndex);
  };

  // Keeps the dots in sync with manual scrolling/dragging too, not just
  // clicks on the dots or the prev/next buttons.
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const tileStep = getTileStep();
    const tilesScrolled = Math.round(track.scrollLeft / tileStep);
    const dotIndex = Math.min(
      DOT_COUNT - 1,
      Math.floor(tilesScrolled / DESTINATIONS_PER_DOT)
    );
    setActiveDot(dotIndex);
  };

  return (
    <section className="section gallery-section">
      <h2 className="section-title">Explore more destinations</h2>
      <div className="gallery-carousel-wrap">
        <button
          type="button"
          className="carousel-nav-btn carousel-nav-prev"
          onClick={() => scrollByOneTile(-1)}
          aria-label="Previous destination"
          data-testid="gallery-carousel-prev"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="gallery-carousel" ref={trackRef} onScroll={handleScroll}>
          {worldDestinations.map((destination) => (
            <GalleryTile key={destination.slug} destination={destination} />
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav-btn carousel-nav-next"
          onClick={() => scrollByOneTile(1)}
          aria-label="Next destination"
          data-testid="gallery-carousel-next"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="gallery-dots" role="tablist" aria-label="Jump to a section of destinations">
        {Array.from({ length: DOT_COUNT }, (_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            className={`gallery-dot${dotIndex === activeDot ? " active" : ""}`}
            onClick={() => scrollToDot(dotIndex)}
            role="tab"
            aria-selected={dotIndex === activeDot}
            aria-label={`Jump to destinations ${dotIndex * DESTINATIONS_PER_DOT + 1}-${Math.min(
              (dotIndex + 1) * DESTINATIONS_PER_DOT,
              worldDestinations.length
            )}`}
            data-testid={`gallery-dot-${dotIndex}`}
          />
        ))}
      </div>
    </section>
  );
}

export default DestinationGallery;
