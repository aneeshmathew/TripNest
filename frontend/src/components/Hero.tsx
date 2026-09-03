import Image from "next/image";
import { natGeoDestinations } from "../data/natGeoDestinations";

// A plain GET form, same pattern as SearchFilters — submitting navigates
// to /?search=... and the home page (Server Component) re-renders with
// results. No client JS needed. The <datalist> offers the Nat Geo
// destinations as native browser autocomplete suggestions, but the input
// still accepts any free-text location — the datalist doesn't restrict
// what can be typed/submitted, it's a helper, not a strict enum.
function Hero() {
  return (
    <section className="hero">
      <div className="hero-image-wrap">
        <Image
          src="https://images.unsplash.com/photo-1747597197470-08ddb13a160f?auto=format&fit=crop&w=2000&q=80"
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
        <form className="hero-search" method="GET" action="/" data-testid="hero-search-form">
          <input
            type="text"
            name="search"
            placeholder="Where would you like to go?"
            aria-label="Search listings"
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
