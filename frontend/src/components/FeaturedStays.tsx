"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedStayCard from "./FeaturedStayCard";
import type { Listing } from "../types/listing";

interface FeaturedStaysProps {
  listings: Listing[];
}

const FALLBACK_TILE_STEP_PX = 276; // 260px card + 16px (1rem) gap, if measurement fails

function FeaturedStays({ listings }: FeaturedStaysProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (listings.length === 0) {
    return null;
  }

  const getCardStep = () => {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>(".featured-stay-item");
    return firstCard?.offsetWidth ? firstCard.offsetWidth + 16 : FALLBACK_TILE_STEP_PX;
  };

  const scrollByOneCard = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * getCardStep(), behavior: "smooth" });
  };

  return (
    <section className="section featured-stays-section" id="featured-stays">
      <h2 className="section-title">Featured stays</h2>
      <p className="section-subtitle">Handpicked accommodations for every kind of traveler.</p>
      <div className="featured-stays-carousel-wrap">
        <button
          type="button"
          className="carousel-nav-btn carousel-nav-prev"
          onClick={() => scrollByOneCard(-1)}
          aria-label="Previous stay"
          data-testid="featured-stays-prev"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="featured-stays-row" ref={trackRef}>
          {listings.map((listing) => (
            <div className="featured-stay-item" key={listing.id}>
              <FeaturedStayCard apartment={listing} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav-btn carousel-nav-next"
          onClick={() => scrollByOneCard(1)}
          aria-label="Next stay"
          data-testid="featured-stays-next"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default FeaturedStays;
