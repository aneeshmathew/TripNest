import Image from "next/image";
import { Calendar, ChevronDown, MapPin, Search, Users } from "lucide-react";
import LocationAutosuggest from "./LocationAutosuggest";
import DestinationsSection from "./DestinationsSection";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-image-wrap">
        <Image
          src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2400&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-eyebrow">Plan &bull; Explore &bull; Travel</p>
          <h1 className="hero-title">
            Find the perfect place
            <br />
            to make your next trip.
          </h1>
          <p className="hero-subtitle">
            Discover beautiful destinations, handpicked stays, and unforgettable experiences —
            all in one place.
          </p>

          <form className="hero-search" method="GET" action="/plan" data-testid="hero-search-form">
            <div className="hero-search-field hero-search-field-location">
              <MapPin size={18} className="hero-search-field-icon" aria-hidden="true" />
              <LocationAutosuggest
                name="q"
                placeholder="Where do you want to go?"
                aria-label="Describe the trip you want"
                testIdPrefix="hero-search"
                coordFieldNames={{ lat: "lat", lon: "lon" }}
              />
            </div>

            <div className="hero-search-divider" aria-hidden="true" />

            {/* Dates/travelers aren't wired to real search yet (TripNest has
                no booking-dates or party-size filter today) — shown as a
                static, non-interactive segment purely to match the search
                bar's shape, the same "honest about not-yet-built features"
                approach as EasyToUseSection/RecommendationsSection. */}
            <div className="hero-search-field hero-search-field-static" aria-hidden="true">
              <Calendar size={18} className="hero-search-field-icon" />
              <span>Any dates</span>
              <ChevronDown size={14} className="hero-search-field-chevron" />
            </div>

            <div className="hero-search-divider" aria-hidden="true" />

            <div className="hero-search-field hero-search-field-static" aria-hidden="true">
              <Users size={18} className="hero-search-field-icon" />
              <span>2 travelers</span>
              <ChevronDown size={14} className="hero-search-field-chevron" />
            </div>

            <button
              type="submit"
              className="hero-search-submit"
              aria-label="Start planning"
              data-testid="hero-search-btn"
            >
              <Search size={18} aria-hidden="true" />
            </button>
          </form>
        </div>

        <DestinationsSection />

        <svg
          className="hero-wave"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C240,90 480,90 720,55 C960,20 1200,20 1440,50 L1440,90 L0,90 Z"
            fill="var(--color-bg)"
          />
        </svg>
      </div>
    </section>
  );
}

export default Hero;
