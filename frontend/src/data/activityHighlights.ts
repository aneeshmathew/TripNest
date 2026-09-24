// "Trip Inspiration" browse-by-activity strip. Like RecommendationsSection,
// this is curated illustrative content, not backend
// data — there's no Attraction/Activity model yet (see README, Feature Gaps
// 2.1: "an attractions/things to do type" is still open). Filtering here is
// a client-side taste-narrowing tool over this static set, not a live query
// against listings/hotels/restaurants. Images are reused from the same
// Unsplash pool already used in data/natGeoDestinations.ts.
//
// Each activity is pinned to one real, already-seeded place (`location`)
// that its own title already points to (e.g. hiking's "Ireland Journey"
// title -> Dublin) — see app/activities/[slug]/page.tsx, which searches
// listings/hotels/restaurants by that location by default instead of by
// the activity's own name (searching listings for the word "Hiking" never
// matched anything real; searching for "Dublin" does).

export type ActivityCategoryId =
  | "adventure"
  | "high-adrenaline"
  | "water-sports"
  | "history-culture"
  | "other-activities";

export interface ActivityCategoryFilter {
  id: "all" | ActivityCategoryId;
  label: string;
}

export const ACTIVITY_CATEGORY_FILTERS: ActivityCategoryFilter[] = [
  { id: "all", label: "All" },
  { id: "adventure", label: "Adventure" },
  { id: "high-adrenaline", label: "High Adrenaline" },
  { id: "water-sports", label: "Water Sports" },
  { id: "history-culture", label: "History & Culture" },
  { id: "other-activities", label: "Other Activities" }
];

export interface ActivityHighlight {
  slug: string;
  /** Short badge label shown over the tile, e.g. "Hiking". */
  activity: string;
  title: string;
  categories: ActivityCategoryId[];
  imageUrl: string;
  /**
   * The real, already-seeded place this activity is set in (matches a
   * destination's exact seeded `location` string in
   * backend/prisma/seed.ts, e.g. "Dublin, Ireland") — used as the
   * activity detail page's default search keyword for its
   * Apartments/Hotels/Restaurants/Reviews tabs.
   */
  location: string;
  /** Illustrative rough visit length shown on the card, e.g. "3 hours". */
  durationLabel: string;
}

export const activityHighlights: ActivityHighlight[] = [
  {
    slug: "hiking",
    activity: "Hiking",
    title: "An Ultimate Luxury Ireland Journey",
    categories: ["adventure"],
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80",
    location: "Dublin, Ireland",
    durationLabel: "6 hours"
  },
  {
    slug: "animal-watching",
    activity: "Animal Watching",
    title: "Tracking Wildlife Through Rwanda's Savanna",
    categories: ["adventure", "other-activities"],
    imageUrl:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
    location: "Akagera National Park, Rwanda",
    durationLabel: "4 hours"
  },
  {
    slug: "surfing",
    activity: "Surfing",
    title: "Chasing Sunset Breaks on Mexico's Pacific Coast",
    categories: ["water-sports", "high-adrenaline"],
    imageUrl:
      "https://images.unsplash.com/photo-1671387572483-096ea6d3c069?auto=format&fit=crop&w=600&q=80",
    location: "Coastal Oaxaca, Mexico",
    durationLabel: "3 hours"
  },
  {
    slug: "cycling",
    activity: "Cycling",
    title: "The Ultimate Croatian Epicurean Journey",
    categories: ["adventure"],
    imageUrl:
      "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=600&q=80",
    location: "Dubrovnik, Croatia",
    durationLabel: "5 hours"
  },
  {
    slug: "kayaking",
    activity: "Kayaking",
    title: "New Zealand Kayaking Spots Ranging From Calm Coastal Marine Reserves to Dramatic Glacial Fjords",
    categories: ["water-sports"],
    imageUrl:
      "https://images.unsplash.com/photo-1696469014188-e6d7ea983c56?auto=format&fit=crop&w=600&q=80",
    location: "Queenstown, New Zealand",
    durationLabel: "3 hours"
  },
  {
    slug: "whale-watching",
    activity: "Whale Watching",
    title: "Best of Baja's Gray Whale Migration",
    categories: ["water-sports", "other-activities"],
    imageUrl:
      "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=600&q=80",
    // Baja California itself isn't a seeded destination — Reykjavík is
    // also a real, if different, whale-watching destination we do have
    // seeded inventory for, so the tabs show real results rather than
    // staying empty over a place we can't yet back up.
    location: "Reykjavík, Iceland",
    durationLabel: "3 hours"
  },
  {
    slug: "nightlife",
    activity: "Party",
    title: "Best of Rio's Carnival Nights",
    categories: ["other-activities"],
    imageUrl:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80",
    location: "Rio de Janeiro, Brazil",
    durationLabel: "4 hours"
  },
  {
    slug: "rock-climbing",
    activity: "Rock Climbing",
    title: "Scaling the Dolomites' Via Ferrata Routes",
    categories: ["high-adrenaline", "adventure"],
    imageUrl:
      "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=600&q=80",
    location: "The Dolomites, Italy",
    durationLabel: "5 hours"
  },
  {
    slug: "skydiving",
    activity: "Skydiving",
    title: "Freefall Over New Zealand's Southern Alps",
    categories: ["high-adrenaline"],
    imageUrl:
      "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=600&q=80",
    location: "Queenstown, New Zealand",
    durationLabel: "3 hours"
  },
  {
    slug: "ancient-ruins",
    activity: "History & Culture",
    title: "Walking the Silk Road Through Khiva",
    categories: ["history-culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?auto=format&fit=crop&w=600&q=80",
    location: "Khiva, Uzbekistan",
    durationLabel: "3 hours"
  },
  {
    slug: "temple-trail",
    activity: "History & Culture",
    title: "Imperial Beijing, One Courtyard at a Time",
    categories: ["history-culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=600&q=80",
    location: "Beijing, China",
    durationLabel: "3 hours"
  },
  {
    slug: "scuba-diving",
    activity: "Scuba Diving",
    title: "Reef Diving Off Maui's Volcanic Coastline",
    categories: ["water-sports"],
    imageUrl:
      "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=600&q=80",
    location: "Maui, Hawaii, USA",
    durationLabel: "2 hours"
  },
  {
    slug: "skiing",
    activity: "Skiing",
    title: "Carving Fresh Powder Across the Dolomites' Alpine Slopes",
    categories: ["adventure", "high-adrenaline"],
    imageUrl:
      "https://images.unsplash.com/photo-1708607487609-45758252b5ee?auto=format&fit=crop&w=600&q=80",
    location: "The Dolomites, Italy",
    durationLabel: "6 hours"
  },
  {
    slug: "mountaineering",
    activity: "Mountaineering",
    title: "Roped Ascents Along the Alps' Highest Ridgelines",
    categories: ["adventure", "high-adrenaline"],
    imageUrl:
      "https://images.unsplash.com/photo-1597250861267-429663f244a8?auto=format&fit=crop&w=600&q=80",
    // Zürich is the nearest seeded gateway city to "the Alps" generally —
    // the title doesn't name one country's stretch of the Alps
    // specifically, so this is the closest honest anchor we have.
    location: "Zürich, Switzerland",
    durationLabel: "8 hours"
  }
];
