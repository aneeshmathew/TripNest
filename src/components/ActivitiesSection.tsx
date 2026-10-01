import ActivitiesCarousel from "./ActivitiesCarousel";
import { activityHighlights } from "../data/activityHighlights";
import { activityPhotoQuery, getDestinationPhotoUrl } from "../lib/pixabay";

// Server Component (no "use client") so it can call the Pixabay search
// API directly — same integration as DestinationsSection.tsx. Searching
// the card's own title (e.g. "Sunset Surf on Mexico's Coast") gets a photo
// matching both the activity and the place, with "<activity> <location>" as
// a second try; if Pixabay has no close match the card keeps its curated
// image (see activityPhotoQuery).
async function ActivitiesSection() {
  const highlights = await Promise.all(
    activityHighlights.map(async (highlight) => ({
      slug: highlight.slug,
      title: highlight.title,
      categories: highlight.categories,
      location: highlight.location,
      durationLabel: highlight.durationLabel,
      imageUrl: await getDestinationPhotoUrl(activityPhotoQuery(highlight), highlight.imageUrl),
      fallbackImageUrl: highlight.imageUrl
    }))
  );

  return (
    <section className="wide-section-breakout">
      <div className="wide-section-inner activities-section" id="trip-inspiration">
        <h2 className="section-title">Trip inspiration</h2>
        <p className="section-subtitle">Handpicked experiences and activities for every kind of traveler.</p>
        <ActivitiesCarousel highlights={highlights} />
      </div>
    </section>
  );
}

export default ActivitiesSection;