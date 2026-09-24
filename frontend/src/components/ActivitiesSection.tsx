"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Landmark,
  LayoutGrid,
  MapPin,
  Mountain,
  Sparkles,
  Waves,
  Zap
} from "lucide-react";
import {
  ACTIVITY_CATEGORY_FILTERS,
  activityHighlights,
  type ActivityCategoryFilter,
  type ActivityHighlight
} from "../data/activityHighlights";

const FALLBACK_TILE_STEP_PX = 236; // 220px tile + 16px (1rem) gap, if measurement fails

// Icon + readable label shown on each card's colored badge, and next to
// each filter pill — same five categories the data already groups
// activities into (ACTIVITY_CATEGORY_FILTERS), just given an icon here
// for the pill-row look.
const CATEGORY_META: Record<ActivityCategoryFilter["id"], { icon: typeof Compass; badgeLabel: string }> = {
  all: { icon: LayoutGrid, badgeLabel: "All" },
  adventure: { icon: Mountain, badgeLabel: "Adventure" },
  "high-adrenaline": { icon: Zap, badgeLabel: "High Adrenaline" },
  "water-sports": { icon: Waves, badgeLabel: "Water Sports" },
  "history-culture": { icon: Landmark, badgeLabel: "History & Culture" },
  "other-activities": { icon: Sparkles, badgeLabel: "Other" }
};

// Every tile links to /activities/[slug], a tabbed page (Apartments/
// Hotels/Restaurants/Reviews) built from our own real data, the same
// pattern as DestinationsCarousel's tiles linking to /destinations/[slug].
function ActivityTile({ highlight }: { highlight: ActivityHighlight }) {
  const primaryCategory = highlight.categories[0] ?? "other-activities";
  const badge = CATEGORY_META[primaryCategory];
  const BadgeIcon = badge.icon;

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
          sizes="260px"
          style={{ objectFit: "cover" }}
        />
        <span className={`activity-tile-badge activity-tile-badge-${primaryCategory}`}>
          <BadgeIcon size={12} aria-hidden="true" />
          {badge.badgeLabel}
        </span>
      </div>
      <div className="activity-tile-body">
        <p className="activity-tile-title">{highlight.title}</p>
        <p className="activity-tile-location">
          <MapPin size={13} aria-hidden="true" />
          {highlight.location}
        </p>
        <div className="activity-tile-footer">
          <span className="activity-tile-duration">
            <Clock size={13} aria-hidden="true" />
            {highlight.durationLabel}
          </span>
          <span className="activity-tile-arrow" aria-hidden="true">
            <ArrowRight size={15} />
          </span>
        </div>
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
    return firstTile?.offsetWidth ? firstTile.offsetWidth + 16 : FALLBACK_TILE_STEP_PX;
  };

  const scrollByOneTile = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * getTileStep(), behavior: "smooth" });
  };

  return (
    <section className="section activities-section" id="trip-inspiration">
      <h2 className="section-title">Trip inspiration</h2>
      <p className="section-subtitle">Handpicked experiences and activities for every kind of traveler.</p>

      <div className="activity-filter-pills" role="group" aria-label="Filter activities by category">
        {ACTIVITY_CATEGORY_FILTERS.map((filter) => {
          const Icon = CATEGORY_META[filter.id].icon;
          return (
            <button
              key={filter.id}
              type="button"
              className={`activity-filter-pill${activeFilter === filter.id ? " active" : ""}`}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
              data-testid={`activity-filter-${filter.id}`}
            >
              <Icon size={15} aria-hidden="true" />
              {filter.label}
            </button>
          );
        })}
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
