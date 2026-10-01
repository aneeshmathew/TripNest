import ActivitiesCarousel from "./ActivitiesCarousel";
import { activityHighlights } from "../data/activityHighlights";
import { activityPhotoQuery, getDestinationPhotoUrl } from "../lib/pixabay";

// Server Component (no "use client") so it can call the Pixabay search
// API directly — same integration as DestinationsSection.tsx. Searching
// for the card's real place (e.g. "Queenstown", with "New Zealand" and
// "Skydiving" as ranking hints — see activityPhotoQuery) gets a photo of the
// right place instead of a generic shot of the activity from anywhere.
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
