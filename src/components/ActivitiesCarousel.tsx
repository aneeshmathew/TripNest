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
  Music,
  Sparkles,
  Waves,
  Zap
} from "lucide-react";
import { ACTIVITY_CATEGORY_FILTERS, type ActivityCategoryFilter } from "../data/activityHighlights";

export interface ResolvedActivityHighlight {
  slug: string;
  title: string;
  categories: ActivityCategoryFilter["id"][];
  location: string;
  durationLabel: string;
  imageUrl: string;
  /** Local static fallback — swapped in client-side if imageUrl (the real
      Unsplash photo) fails to load. See ActivityTile below. */
  fallbackImageUrl: string;
}

const FALLBACK_TILE_STEP_PX = 236; // 220px tile + 16px (1rem) gap, if measurement fails

// Icon + readable label shown on each card's colored badge, and next to
// each filter pill — same six categories the data groups activities into
// (ACTIVITY_CATEGORY_FILTERS), just given an icon here for the pill-row
// look.
const CATEGORY_META: Record<ActivityCategoryFilter["id"], { icon: typeof Compass; badgeLabel: string }> = {
  all: { icon: LayoutGrid, badgeLabel: "All" },
  adventure: { icon: Mountain, badgeLabel: "Adventure" },
  "high-adrenaline": { icon: Zap, badgeLabel: "High Adrenaline" },
  "water-sports": { icon: Waves, badgeLabel: "Water Sports" },
  "history-culture": { icon: Landmark, badgeLabel: "History & Culture" },
  nightlife: { icon: Music, badgeLabel: "Nightlife" },
  "other-activities": { icon: Sparkles, badgeLabel: "Other" }
};

// Every tile links to /activities/[slug], a tabbed page (Apartments/
// Hotels/Restaurants/Reviews) built from our own real data, the same
// pattern as DestinationsCarousel's tiles linking to /destinations/[slug].
//
// Falls back to a local placeholder if the real Unsplash photo fails to
// load client-side (same resilience as DestinationTile in
// DestinationsCarousel.tsx — a search succeeding server-side doesn't
// guarantee the CDN hotlink itself always loads).
function ActivityTile({ highlight }: { highlight: ResolvedActivityHighlight }) {
  const [imageFailed, setImageFailed] = useState(false);
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
          src={imageFailed ? highlight.fallbackImageUrl : highlight.imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 45vw, 260px"
          style={{ objectFit: "cover" }}
          onError={() => setImageFailed(true)}
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
          <span>{highlight.location}</span>
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
function ActivitiesCarousel({ highlights }: { highlights: ResolvedActivityHighlight[] }) {
  const [activeFilter, setActiveFilter] = useState<ActivityCategoryFilter["id"]>("all");
  const trackRef = useRef<HTMLDivElement>(null);

  const visibleHighlights = useMemo(
    () =>
      activeFilter === "all"
        ? highlights
        : highlights.filter((highlight) => highlight.categories.includes(activeFilter)),
    [activeFilter, highlights]
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
    <>
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
    </>
  );
}

export default ActivitiesCarousel;
