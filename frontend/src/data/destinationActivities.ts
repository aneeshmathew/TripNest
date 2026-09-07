// Curated destination -> activity associations, used by the "plan my
// trip" natural-language search (lib/parseTripQuery.ts + app/plan). There
// is no real backend relationship between destinations and activities —
// this is authored content, same spirit as activityHighlights.ts and
// natGeoDestinations.ts's own blurbs, not a live query result. Activity
// slugs here must match data/activityHighlights.ts's `slug` field.
//
// A caveat worth being upfront about: activityHighlights.ts's own
// title/description for a given activity slug was often written with a
// *different* place in mind (e.g. "temple-trail" describes Imperial
// Beijing specifically). Reusing that slug for another destination here
// only claims "this kind of activity is plausible here" — not that the
// activity page's own narrative is literally about this destination.
export const destinationActivitySlugs: Record<string, string[]> = {
  "dolomites-italy": ["hiking", "rock-climbing"],
  "vancouver-canada": ["hiking", "kayaking", "cycling"],
  "beijing-china": ["temple-trail", "ancient-ruins"],
  "rabat-morocco": ["ancient-ruins"],
  "hull-england": ["cycling"],
  "manila-philippines": ["nightlife"],
  "akagera-rwanda": ["animal-watching"],
  "oulu-finland": ["hiking", "kayaking"],
  "route-66-oklahoma": ["nightlife"],
  "oaxaca-coast-mexico": ["surfing"],
  "medellin-colombia": ["nightlife", "hiking"],
  "north-dakota-badlands": ["hiking", "animal-watching", "skydiving"],
  "pittsburgh-usa": ["nightlife", "cycling"],
  "quebec-canada": ["ancient-ruins", "cycling"],
  "rio-de-janeiro-brazil": ["surfing", "nightlife"],
  "dongseo-trail-south-korea": ["hiking", "rock-climbing"],
  "uluru-australia": ["hiking", "skydiving"],
  "yamagata-japan": ["hiking", "rock-climbing"],
  dominica: ["hiking", "scuba-diving"],
  "basque-country-spain": ["surfing", "nightlife"],
  "black-sea-coast-turkiye": ["hiking", "scuba-diving"],
  fiji: ["scuba-diving", "kayaking", "whale-watching"],
  "guimaraes-portugal": ["ancient-ruins"],
  "khiva-uzbekistan": ["ancient-ruins"],
  "maui-usa": ["surfing", "scuba-diving", "whale-watching"]
};
