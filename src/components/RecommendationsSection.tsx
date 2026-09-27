import Image from "next/image";

// Illustrative only — TripNest has no recommendation engine yet (see
// README.md, Feature Gaps: "Personalized recommendations"). No button
// links anywhere real, unlike the Discover panel next to it.
function RecommendationsSection() {
  return (
    <section className="discover-panel discover-panel-personalized">
      <div className="discover-panel-text">
        <p className="discover-panel-eyebrow discover-panel-eyebrow-alt">Personalized</p>
        <h2 className="discover-panel-title">Get tailored recommendations</h2>
        <p className="discover-panel-body">
          Let our smart recommendations suggest stays and experiences based on your interests,
          travel style, and past trips.
        </p>
        <span className="discover-panel-btn discover-panel-btn-dark">
          Learn more
        </span>
      </div>
      <div className="discover-panel-visual" aria-hidden="true">
        <div className="discover-panel-photo-card discover-panel-photo-card-tagged">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"
            alt=""
            fill
            sizes="220px"
            style={{ objectFit: "cover" }}
          />
          <span className="discover-panel-photo-label">Just for you</span>
          <span className="discover-panel-tag discover-panel-tag-1">Beaches</span>
          <span className="discover-panel-tag discover-panel-tag-2">Attractions</span>
          <span className="discover-panel-tag discover-panel-tag-3">Adventure</span>
        </div>
      </div>
    </section>
  );
}

export default RecommendationsSection;
