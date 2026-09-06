"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import {
  ACTIVITY_CATEGORY_FILTERS,
  activityHighlights,
  type ActivityCategoryFilter,
  type ActivityHighlight
} from "../data/activityHighlights";

const FALLBACK_TILE_STEP_PX = 216; // 200px tile + 16px (1rem) gap, if measurement fails

// Every tile links to /activities/[slug], a tabbed page (Apartments/
// Hotels/Restaurants/Reviews) built from our own real data, the same
// pattern as DestinationsCarousel's tiles linking to /destinations/[slug].
function ActivityTile({ highlight }: { highlight: ActivityHighlight }) {
  return (
    <Link
      href={`/activities/${highlight.slug}`}
      className="activity-tile"
      data-testid={`activity-${highlight.slug}`}
    >
      <div className="activity-tile-image-wrap">
        <Image
          src={highlight.imageUrl}
          alt=""
          fill
          sizes="220px"
          style={{ objectFit: "cover" }}
        />
        <div className="activity-tile-scrim" />
        <div className="activity-tile-badge">
          <Compass size={18} className="activity-badge-icon" aria-hidden="true" />
          <span>{highlight.activity}</span>
        </div>
        <p className="activity-tile-title">{highlight.title}</p>
      </div>
    </Link>
  );
}

// Curated "browse by activity" strip — see data/activityHighlights.ts for
// why this is illustrative content rather than a live search. Filtering is
// plain client-side array filtering over the static set; the carousel is a
// simple scroll-by-one-tile track (no infinite loop like
// DestinationsCarousel, since the visible set changes with the active
// filter and looping a changing-length set adds complexity this static
// preview doesn't need yet).
function ActivitiesSection() {
  const [activeFilter, setActiveFilter] = useState<ActivityCategoryFilter["id"]>("all");
  const trackRef = useRef<HTMLDivElement>(null);

  const visibleHighlights = useMemo(
    () =>
      activeFilter === "all"
        ? activityHighlights
        : activityHighlights.filter((highlight) => highlight.categories.includes(activeFilter)),
    [activeFilter]
  );

  const getTileStep = () => {
    const track = trackRef.current;
    const firstTile = track?.querySelector<HTMLElement>(".activity-tile");
    return firstTile ? firstTile.offsetWidth + 16 : FALLBACK_TILE_STEP_PX;
  };

  const scrollByOneTile = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * getTileStep(), behavior: "smooth" });
  };

  return (
    <section className="section activities-section">
      <p className="eyebrow">Trip Inspiration</p>
      <h2 className="section-title">Find the perfect place to go — activities, hotels, and more</h2>

      <div className="activity-filter-pills" role="group" aria-label="Filter activities by category">
        {ACTIVITY_CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`activity-filter-pill${activeFilter === filter.id ? " active" : ""}`}
            onClick={() => setActiveFilter(filter.id)}
            aria-pressed={activeFilter === filter.id}
            data-testid={`activity-filter-${filter.id}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="activities-carousel-wrap">
        <button
          type="button"
          className="carousel-nav-btn carousel-nav-prev"
          onClick={() => scrollByOneTile(-1)}
          aria-label="Previous activity"
          data-testid="activities-carousel-prev"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="activities-carousel" ref={trackRef}>
          {visibleHighlights.length === 0 ? (
            <p className="status-text">No activities in this category yet — try another filter.</p>
          ) : (
            visibleHighlights.map((highlight) => (
              <ActivityTile key={highlight.slug} highlight={highlight} />
            ))
          )}
        </div>

        <button
          type="button"
          className="carousel-nav-btn carousel-nav-next"
          onClick={() => scrollByOneTile(1)}
          aria-label="Next activity"
          data-testid="activities-carousel-next"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default ActivitiesSection;
