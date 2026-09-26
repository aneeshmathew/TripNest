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
            Find the perfect place to make your next trip.
          </h1>
          <p className="hero-subtitle">
            Discover beautiful destinations, handpicked stays, and unforgettable experiences — all in one place.
          </p>
          <HeroSearchBar />
        </div>
        <DestinationsSection />
       {/*  <svg
          className="hero-wave"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="hero-wave-dots" width="46" height="46" patternUnits="userSpaceOnUse">
              <rect width="46" height="46" fill="var(--color-bg)" />
              <circle cx="6" cy="8" r="2.8" fill="var(--color-border)" fillOpacity="0.55" />
              <circle cx="28" cy="26" r="1.6" fill="var(--color-border)" fillOpacity="0.4" />
              <circle cx="38" cy="10" r="1.6" fill="var(--color-border)" fillOpacity="0.4" />
            </pattern>
          </defs>
          <path
            d="M0,32 C240,90 480,90 720,55 C960,20 1200,20 1440,50 L1440,90 L0,90 Z"
            fill="url(#hero-wave-dots)"
          />
        </svg> */}
      </div>
    </section>
  );
}

export default Hero;
