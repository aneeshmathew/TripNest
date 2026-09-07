import Image from "next/image";

// A plain GET form, same no-JS pattern as SearchFilters — submitting
// navigates to /plan?q=... (see app/plan/page.tsx), which parses the
// free text for a destination and/or an activity rather than treating it
// as a plain listings keyword (that plain search still exists — see
// SearchFilters — this is a separate, richer entry point).
//
// No <datalist> here (there used to be one, suggesting the 25 Nat Geo
// destination names) — removed by request: /plan reads intent out of
// free text ("surfing in Fiji"), and a dropdown of exact destination
// names suggested the opposite, that only those specific names were
// valid input. The browser's own autocomplete-indicator arrow that came
// with the datalist is gone too, along with the datalist itself.
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
            data-testid="hero-search-input"
          />
          <button type="submit" className="primary-btn" data-testid="hero-search-btn">
            Start planning
          </button>
        </form>
      </div>
    </section>
  );
}

export default Hero;
