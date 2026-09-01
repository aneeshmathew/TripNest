// Illustrative only — TripNest has no recommendation engine yet (see
// README.md, Feature Gaps: "Personalized recommendations").
function RecommendationsSection() {
  return (
    <section className="section split-section">
      <div className="split-visual recommendations-visual" aria-hidden="true">
        <div className="recommendations-mock-card">
          <span className="recommendations-mock-line recommendations-mock-line-title" />
          <span className="recommendations-mock-line" />
          <span className="recommendations-mock-line recommendations-mock-line-short" />
        </div>
      </div>
      <div className="split-text">
        <p className="eyebrow">Coming soon</p>
        <h2 className="section-title split-title">Get recommendations tailored to you</h2>
        <p>
          As you search and save places you like, TripNest will start surfacing stays that match
          your taste — personalized recommendations are on the roadmap.
        </p>
      </div>
    </section>
  );
}

export default RecommendationsSection;
