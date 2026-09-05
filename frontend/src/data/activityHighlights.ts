// "Trip Inspiration" browse-by-activity strip. Like PlanWithFriendsSection/
// RecommendationsSection, this is curated illustrative content, not backend
// data — there's no Attraction/Activity model yet (see README, Feature Gaps
// 2.1: "an attractions/things to do type" is still open). Filtering here is
// a client-side taste-narrowing tool over this static set, not a live query
// against listings/hotels/restaurants. Images are reused from the same
// Unsplash pool already used in data/natGeoDestinations.ts.

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
   * When set, this tile renders as a "Search all <searchAllLabel>" card
   * instead of a photo + title — a placeholder for the real search-by-
   * activity flow that doesn't exist yet.
   */
  searchAllLabel?: string;
}

export const activityHighlights: ActivityHighlight[] = [
  {
    slug: "hiking",
    activity: "Hiking",
    title: "An Ultimate Luxury Ireland Journey",
    categories: ["adventure"],
    imageUrl:
      "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "animal-watching",
    activity: "Animal Watching",
    title: "Tracking Wildlife Through Rwanda's Savanna",
    categories: ["adventure", "other-activities"],
    imageUrl:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "surfing",
    activity: "Surfing",
    title: "Chasing Sunset Breaks on Mexico's Pacific Coast",
    categories: ["water-sports", "high-adrenaline"],
    imageUrl:
      "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "cycling",
    activity: "Cycling",
    title: "The Ultimate Croatian Epicurean Journey",
    categories: ["adventure"],
    imageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "kayaking",
    activity: "Kayaking",
    title: "Search All Kayaking",
    categories: ["water-sports"],
    imageUrl:
      "https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=600&q=80",
    searchAllLabel: "Kayaking"
  },
  {
    slug: "whale-watching",
    activity: "Whale Watching",
    title: "Best of Baja's Gray Whale Migration",
    categories: ["water-sports", "other-activities"],
    imageUrl:
      "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "nightlife",
    activity: "Party",
    title: "Best of Rio's Carnival Nights",
    categories: ["other-activities"],
    imageUrl:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "rock-climbing",
    activity: "Rock Climbing",
    title: "Scaling the Dolomites' Via Ferrata Routes",
    categories: ["high-adrenaline", "adventure"],
    imageUrl:
      "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "skydiving",
    activity: "Skydiving",
    title: "Freefall Over New Zealand's Southern Alps",
    categories: ["high-adrenaline"],
    imageUrl:
      "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "ancient-ruins",
    activity: "History & Culture",
    title: "Walking the Silk Road Through Khiva",
    categories: ["history-culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "temple-trail",
    activity: "History & Culture",
    title: "Imperial Beijing, One Courtyard at a Time",
    categories: ["history-culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=600&q=80"
  },
  {
    slug: "scuba-diving",
    activity: "Scuba Diving",
    title: "Reef Diving Off Maui's Volcanic Coastline",
    categories: ["water-sports"],
    imageUrl:
      "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=600&q=80"
  }
];
