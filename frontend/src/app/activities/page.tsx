import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { activityHighlights } from "../../data/activityHighlights";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "Activities",
  description: "Browse and search activities on TripNest."
};

interface ActivitiesPageProps {
  searchParams: Promise<{ q?: string }>;
}

// Mirrors /hotels/page.tsx and /restaurants/page.tsx — this is
// ExploreCategories' "Activities" tile's real destination (previously it
// just anchor-scrolled to the homepage's activity carousel rather than
// landing on a search-ready page of its own). Unlike those two, this
// filters the static curated set in data/activityHighlights.ts (see that
// file's own comment on why activities aren't backend data yet) rather
// than calling the backend — same keyword-replaces-default search
// pattern regardless.
export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const { q } = await searchParams;
  const trimmedQuery = q?.trim();
  const lowerQuery = trimmedQuery?.toLowerCase();

  const activities = lowerQuery
    ? activityHighlights.filter(
        (a) => a.activity.toLowerCase().includes(lowerQuery) || a.title.toLowerCase().includes(lowerQuery)
      )
    : activityHighlights;

  return (
    <section>
      <BackButton />
      <h1 className="page-title">Activities</h1>
      <p className="subtitle">Browse every curated activity on TripNest.</p>

      <form
        className="tab-search-form"
        method="GET"
        action="/activities"
        data-testid="activities-search-form"
      >
        <input
          type="text"
          name="q"
          placeholder="Search for activities nearby location"
          defaultValue={trimmedQuery ?? ""}
          aria-label="Search activities"
          data-testid="activities-search-input"
        />
        <button type="submit" className="primary-btn" data-testid="activities-search-btn">
          Search
        </button>
        {trimmedQuery && (
          <Link
            href="/activities"
            className="secondary-btn clear-filters-link"
            data-testid="activities-search-clear"
          >
            Clear
          </Link>
        )}
      </form>

      {activities.length === 0 ? (
        <p className="status-text">
          {trimmedQuery ? `No activities match "${trimmedQuery}" yet.` : "No activities listed yet."}
        </p>
      ) : (
        <div className="grid">
          {activities.map((activity) => (
            <Link
              key={activity.slug}
              href={`/activities/${activity.slug}`}
              className="card"
              data-testid={`activities-page-${activity.slug}`}
            >
              <div className="card-image-wrap">
                <Image
                  src={activity.imageUrl}
                  alt={activity.activity}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="card-content">
                <h3>{activity.activity}</h3>
                <p>{activity.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
