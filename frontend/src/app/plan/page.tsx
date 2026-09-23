import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { allDestinations } from "../../data/allDestinations";
import type { NatGeoDestination } from "../../data/natGeoDestinations";
import { activityHighlights, type ActivityHighlight } from "../../data/activityHighlights";
import { destinationActivitySlugs } from "../../data/destinationActivities";
import { parseTripQuery } from "../../lib/parseTripQuery";
import { getDestinationPhotoUrl } from "../../lib/unsplash";

export const metadata: Metadata = {
  title: "Plan your trip",
  description: "Tell us where you want to go or what you want to do."
};

interface PlanPageProps {
  searchParams: Promise<{ q?: string }>;
}

interface PlanGroup {
  destination: NatGeoDestination;
  activities: ActivityHighlight[];
  requestedIncluded: boolean;
}

function activitiesFor(slug: string): ActivityHighlight[] {
  const slugs = destinationActivitySlugs[slug] ?? [];
  return activityHighlights.filter((a) => slugs.includes(a.slug));
}

// The Hero's "Start planning" search lands here now instead of the plain
// keyword listings search (see Hero.tsx) — this page understands a
// destination and/or an activity in the same free-text query (see
// lib/parseTripQuery.ts) and groups results by destination, using the
// curated destination <-> activity associations in
// data/destinationActivities.ts. There's no live query happening here
// (no backend call) — everything on this page comes from three static,
// curated data files, so results are instant and don't depend on the
// backend being up.
//
// Deliberately separate from both /destinations/[slug] (pure location,
// reached only by clicking a tile in the destinations carousel) and
// /activities/[slug] (pure activity, reached only by clicking a tile in
// the activities carousel) — this is a third, distinct entry point for
// when someone wants to describe both at once, not a merger of the other
// two. The "Apartment/Hotel + Find" control on each group hands off to
// exactly one of those two existing pages (with the type of stay as the
// starting tab) rather than duplicating their own search/results UI here.
export default async function PlanPage({ searchParams }: PlanPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { destination, activity } = query ? parseTripQuery(query) : { destination: null, activity: null };

  let groups: PlanGroup[] = [];

  if (destination) {
    const activities = activitiesFor(destination.slug);
    groups = [
      {
        destination,
        activities,
        requestedIncluded: activity ? activities.some((a) => a.slug === activity.slug) : true
      }
    ];
  } else if (activity) {
    groups = allDestinations
      .filter((d) => (destinationActivitySlugs[d.slug] ?? []).includes(activity.slug))
      .map((d) => ({ destination: d, activities: activitiesFor(d.slug), requestedIncluded: true }));
  }

  return (
    <section className="plan-page">
      <h1 className="page-title">Plan your trip</h1>

      {!query ? (
        <p className="subtitle">Tell us where you want to go or what you want to do.</p>
      ) : groups.length === 0 ? (
        <>
          <p className="subtitle">
            &quot;{query}&quot; didn&apos;t match a destination or activity we cover yet.
          </p>
          <p className="status-text">
            Try browsing <Link href="/">destinations</Link> or <Link href="/activities">activities</Link>{" "}
            instead.
          </p>
        </>
      ) : (
        <>
          <p className="subtitle">
            Showing results for &quot;{query}&quot;
            {destination && !activity ? ` — ${destination.name}` : null}
            {activity && !destination ? ` — ${activity.activity}` : null}
            {destination && activity ? ` — ${activity.activity} near ${destination.name}` : null}
          </p>

          <div className="plan-groups">
            {groups.map((group) => (
              <PlanGroupCard key={group.destination.slug} group={group} requestedActivity={activity} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

async function PlanGroupCard({
  group,
  requestedActivity
}: {
  group: PlanGroup;
  requestedActivity: ActivityHighlight | null;
}) {
  const { destination, activities, requestedIncluded } = group;
  const photoUrl = await getDestinationPhotoUrl(
    `${destination.name} ${destination.location}`,
    destination.imageUrl
  );

  return (
    <article className="plan-group">
      <div className="plan-group-photo-wrap">
        <Image src={photoUrl} alt={destination.name} fill sizes="120px" style={{ objectFit: "cover" }} />
      </div>
      <div className="plan-group-body">
        <h2 className="plan-group-title">{destination.name}</h2>
        <p className="plan-group-location">{destination.location}</p>

        {requestedActivity && !requestedIncluded && (
          <p className="plan-unavailable-note">
            Requested activity not available — these are the available activities in {destination.name}:
          </p>
        )}

        {activities.length === 0 ? (
          <p className="status-text">No curated activities for this destination yet.</p>
        ) : (
          <ul className="plan-activity-list">
            {activities.map((a) => (
              <li
                key={a.slug}
                className={
                  requestedActivity && a.slug === requestedActivity.slug
                    ? "plan-activity-chip plan-activity-chip-requested"
                    : "plan-activity-chip"
                }
              >
                {a.activity}
              </li>
            ))}
          </ul>
        )}

        <form
          className="plan-find-form"
          method="GET"
          action={`/destinations/${destination.slug}`}
          data-testid={`plan-find-form-${destination.slug}`}
        >
          <div className="plan-find-select-wrap">
            <select name="tab" aria-label="Stay type" data-testid={`plan-find-select-${destination.slug}`}>
              <option value="apartments">Apartment</option>
              <option value="hotels">Hotel</option>
            </select>
            <ChevronDown size={16} className="plan-find-select-icon" aria-hidden="true" />
          </div>
          <button type="submit" className="primary-btn" data-testid={`plan-find-btn-${destination.slug}`}>
            Find
          </button>
        </form>
      </div>
    </article>
  );
}
