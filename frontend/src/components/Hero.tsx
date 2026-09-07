import Image from "next/image";
import { natGeoDestinations } from "../data/natGeoDestinations";

// A plain GET form, same no-JS pattern as SearchFilters — submitting
// navigates to /plan?q=... (see app/plan/page.tsx), which parses the
// free text for a destination and/or an activity rather than treating it
// as a plain listings keyword (that plain search still exists — see
// SearchFilters — this is a separate, richer entry point). The
// <datalist> offers the Nat Geo destinations as native browser
// autocomplete suggestions, but the input still accepts any free text —
// the datalist doesn't restrict what can be typed/submitted.
function Hero() {
  return (
    <section className="hero">
      <div className="hero-image-wrap">
        <Image
          src="https://images.unsplash.com/photo-1680013993151-696d40f1e0d3?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-overlay" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">Find the perfect place to stay</h1>
        <p className="hero-subtitle">
          Browse real, reviewed apartments and vacation rentals around the world.
        </p>
        <form className="hero-search" method="GET" action="/plan" data-testid="hero-search-form">
          <input
            type="text"
            name="q"
            placeholder="e.g. Start with a destination or activity."
            aria-label="Describe the trip you want"
            list="natgeo-destination-suggestions"
            data-testid="hero-search-input"
          />
          <datalist id="natgeo-destination-suggestions">
            {natGeoDestinations.map((destination) => (
              <option key={destination.slug} value={destination.name} />
            ))}
          </datalist>
          <button type="submit" className="primary-btn" data-testid="hero-search-btn">
            Start planning
          </button>
        </form>
      </div>
    </section>
  );
}

export default Hero;
