import { natGeoDestinations, type NatGeoDestination } from "../data/natGeoDestinations";
import { activityHighlights, type ActivityHighlight } from "../data/activityHighlights";

// Powers the Hero search ("Start planning") on app/plan. This is plain
// keyword matching against two small, known vocabularies (25 curated
// destinations, 12 curated activities) — not real NLP, no external
// service. That's a deliberate, honest limit: a query mentioning a real
// place we simply don't have curated (e.g. "Chile") will correctly find
// no destination match rather than guessing at one. Matching a *wrong*
// destination (e.g. treating "French Alps" as a match for "The
// Dolomites", which are Italian, not French) would be worse than an
// honest miss, so this never fuzzy-matches place names — only exact
// name/alias substrings.
interface ActivityKeywords {
  slug: string;
  keywords: string[];
}

// Extra match keywords per activity, beyond its own `activity` label —
// covers synonyms ("trekking" -> hiking) and cases where two activities
// share a label ("History & Culture" is both ancient-ruins and
// temple-trail; see activityHighlights.ts). Slugs here must exist in
// data/activityHighlights.ts.
const ACTIVITY_KEYWORDS: ActivityKeywords[] = [
  { slug: "hiking", keywords: ["hiking", "hike", "trekking", "trek"] },
  { slug: "animal-watching", keywords: ["animal watching", "wildlife", "safari"] },
  { slug: "surfing", keywords: ["surfing", "surf"] },
  { slug: "cycling", keywords: ["cycling", "biking", "bike", "bicycle"] },
  { slug: "kayaking", keywords: ["kayaking", "kayak"] },
  { slug: "whale-watching", keywords: ["whale watching", "whales", "whale"] },
  { slug: "nightlife", keywords: ["nightlife", "party", "clubbing", "clubs"] },
  { slug: "rock-climbing", keywords: ["rock climbing", "climbing"] },
  { slug: "skydiving", keywords: ["skydiving", "skydive"] },
  { slug: "ancient-ruins", keywords: ["ancient ruins", "ruins", "silk road", "history"] },
  { slug: "temple-trail", keywords: ["temple trail", "temples", "temple"] },
  { slug: "scuba-diving", keywords: ["scuba diving", "scuba", "diving", "reef diving"] }
];

export interface ParsedTripQuery {
  destination: NatGeoDestination | null;
  activity: ActivityHighlight | null;
}

function findDestination(lowerQuery: string): NatGeoDestination | null {
  return (
    natGeoDestinations.find((destination) => lowerQuery.includes(destination.name.toLowerCase())) ?? null
  );
}

function findActivity(lowerQuery: string): ActivityHighlight | null {
  for (const entry of ACTIVITY_KEYWORDS) {
    if (entry.keywords.some((keyword) => lowerQuery.includes(keyword))) {
      const match = activityHighlights.find((highlight) => highlight.slug === entry.slug);
      if (match) return match;
    }
  }
  return null;
}

export function parseTripQuery(query: string): ParsedTripQuery {
  const lowerQuery = query.toLowerCase();
  return {
    destination: findDestination(lowerQuery),
    activity: findActivity(lowerQuery)
  };
}
