import Image from "next/image";

// A plain GET form, same pattern as SearchFilters — submitting navigates
// to /?search=... and the home page (Server Component) re-renders with
// results. No client JS needed.
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
