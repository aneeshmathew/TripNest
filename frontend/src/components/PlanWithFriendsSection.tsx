// Illustrative only — TripNest has no group-planning feature yet. Avatar
// initials are generic placeholders, not real users.
const placeholderInitials = ["AJ", "MK", "RS", "TL", "PN", "CV"];

function PlanWithFriendsSection() {
  return (
    <section className="section split-section split-reverse">
      <div className="split-text">
        <p className="eyebrow">Coming soon</p>
        <h2 className="section-title split-title">Plan trips together</h2>
        <p>
          Share a shortlist with friends or family, vote on favorites, and land on a place
          everyone's happy with — group trip planning is on the roadmap.
        </p>
      </div>
      <div className="avatar-cluster" aria-hidden="true">
        {placeholderInitials.map((initials) => (
          <span key={initials} className="avatar-circle">
            {initials}
          </span>
        ))}
      </div>
    </section>
  );
}

export default PlanWithFriendsSection;
