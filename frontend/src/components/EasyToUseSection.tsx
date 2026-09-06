import Link from "next/link";
import ExploreCategories from "./ExploreCategories";

function EasyToUseSection() {
  return (
    <section className="section split-section">
      <div className="split-visual">
        <ExploreCategories />
      </div>
      <div className="split-text">
        <p className="eyebrow">Search, compare, book</p>
        <h2 className="section-title split-title">Ridiculously easy to find your next stay</h2>
        <p>
          Search by destination, filter by price and rating, or just click a region on the map.
          Every listing shows real reviews from real guests, so you know what you&apos;re booking
          before you book it.
        </p>
        <Link href="/" className="primary-btn">
          Start exploring
        </Link>
      </div>
    </section>
  );
}

export default EasyToUseSection;
