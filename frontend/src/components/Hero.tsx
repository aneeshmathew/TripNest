import Image from "next/image";

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
            placeholder="Start with a destination or activity"
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
