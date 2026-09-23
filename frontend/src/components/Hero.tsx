import Image from "next/image";
import LocationAutosuggest from "./LocationAutosuggest";

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
        <h1 className="hero-title">Find the perfect place to relax and explore.</h1>
        <p className="hero-subtitle">
          Experience top attractions and adventures, and browse trusted, well reviewed apartments and vacation stays worldwide.
        </p>
        <form className="hero-search" method="GET" action="/plan" data-testid="hero-search-form">
          <LocationAutosuggest
            name="q"
            placeholder="Start with a destination or activity"
            aria-label="Describe the trip you want"
            testIdPrefix="hero-search"
            coordFieldNames={{ lat: "lat", lon: "lon" }}
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
