import ActivitiesCarousel from "./ActivitiesCarousel";
import { activityHighlights } from "../data/activityHighlights";
import { getDestinationPhotoUrl } from "../lib/unsplash";

// Server Component (no "use client") so it can call the Unsplash search
// API directly — same integration as DestinationsSection.tsx. Searching
// "<activity> <real location>" (e.g. "Skydiving Queenstown, New Zealand")
// rather than just the activity name gets a photo that actually matches
// both the activity and the place, replacing the earlier static/reused
// image pool that didn't always match what a card claimed to show.
async function ActivitiesSection() {
  const highlights = await Promise.all(
    activityHighlights.map(async (highlight) => ({
      slug: highlight.slug,
      title: highlight.title,
      categories: highlight.categories,
      location: highlight.location,
      durationLabel: highlight.durationLabel,
      imageUrl: await getDestinationPhotoUrl(`${highlight.activity} ${highlight.location}`, highlight.imageUrl),
      fallbackImageUrl: highlight.imageUrl
    }))
  );

  return (
    <section className="section activities-section" id="trip-inspiration">
      <h2 className="section-title">Trip inspiration</h2>
      <p className="section-subtitle">Handpicked experiences and activities for every kind of traveler.</p>
      <ActivitiesCarousel highlights={highlights} />
    </section>
  );
}

export default ActivitiesSection;
