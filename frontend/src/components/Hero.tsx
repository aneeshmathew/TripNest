import Image from "next/image";
import HeroSearchBar from "./HeroSearchBar";
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

          <HeroSearchBar />
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
