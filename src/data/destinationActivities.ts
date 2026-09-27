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
  "dolomites-italy": ["hiking", "rock-climbing", "skiing", "mountaineering"],
  "vancouver-canada": ["hiking", "kayaking", "cycling"],
  "beijing-china": ["temple-trail", "ancient-ruins"],
  "rabat-morocco": ["ancient-ruins"],
  "hull-england": ["cycling"],
  "manila-philippines": ["nightlife"],
  "akagera-rwanda": ["animal-watching"],
  "oulu-finland": ["hiking", "kayaking", "skiing"],
  "route-66-oklahoma": ["nightlife"],
  "oaxaca-coast-mexico": ["surfing"],
  "medellin-colombia": ["nightlife", "hiking"],
  "north-dakota-badlands": ["hiking", "animal-watching", "skydiving"],
  "pittsburgh-usa": ["nightlife", "cycling"],
  "quebec-canada": ["ancient-ruins", "cycling"],
  "rio-de-janeiro-brazil": ["surfing", "nightlife"],
  "dongseo-trail-south-korea": ["hiking", "rock-climbing"],
  "uluru-australia": ["hiking", "skydiving"],
  "yamagata-japan": ["hiking", "rock-climbing", "skiing"],
  dominica: ["hiking", "scuba-diving"],
  "basque-country-spain": ["surfing", "nightlife"],
  "black-sea-coast-turkiye": ["hiking", "scuba-diving", "mountaineering"],
  fiji: ["scuba-diving", "kayaking", "whale-watching"],
  "guimaraes-portugal": ["ancient-ruins"],
  "khiva-uzbekistan": ["ancient-ruins"],
  "maui-usa": ["surfing", "scuba-diving", "whale-watching"],

  // 50 household-name destinations (data/worldDestinations.ts) shown in
  // the homepage "Explore more destinations" gallery.
  "paris-france": ["nightlife", "cycling"],
  "london-england": ["nightlife", "ancient-ruins"],
  "rome-italy": ["ancient-ruins", "temple-trail"],
  "new-york-usa": ["nightlife", "cycling"],
  "tokyo-japan": ["nightlife", "temple-trail"],
  "dubai-uae": ["skydiving", "nightlife"],
  "bangkok-thailand": ["temple-trail", "nightlife"],
  "singapore": ["nightlife", "cycling"],
  "istanbul-turkiye": ["ancient-ruins", "temple-trail"],
  "barcelona-spain": ["nightlife", "cycling"],
  "amsterdam-netherlands": ["cycling", "nightlife"],
  "prague-czechia": ["nightlife", "ancient-ruins"],
  "venice-italy": ["kayaking", "ancient-ruins"],
  "santorini-greece": ["scuba-diving", "whale-watching"],
  "bali-indonesia": ["surfing", "scuba-diving"],
  "sydney-australia": ["surfing", "kayaking"],
  "cairo-egypt": ["ancient-ruins", "temple-trail"],
  "marrakech-morocco": ["ancient-ruins", "nightlife"],
  "kyoto-japan": ["temple-trail", "hiking"],
  "seoul-south-korea": ["nightlife", "temple-trail"],
  "hong-kong": ["nightlife", "hiking"],
  "machu-picchu-peru": ["hiking", "ancient-ruins"],
  "cape-town-south-africa": ["hiking", "whale-watching"],
  "reykjavik-iceland": ["hiking", "whale-watching"],
  "vienna-austria": ["nightlife", "ancient-ruins"],
  "budapest-hungary": ["nightlife", "kayaking"],
  "florence-italy": ["ancient-ruins", "temple-trail"],
  "athens-greece": ["ancient-ruins", "temple-trail"],
  "lisbon-portugal": ["surfing", "nightlife"],
  "phuket-thailand": ["scuba-diving", "surfing"],
  "los-angeles-usa": ["surfing", "nightlife"],
  "san-francisco-usa": ["cycling", "nightlife"],
  "las-vegas-usa": ["nightlife", "skydiving"],
  "toronto-canada": ["cycling", "nightlife"],
  "cancun-mexico": ["scuba-diving", "surfing"],
  "buenos-aires-argentina": ["nightlife", "cycling"],
  "agra-india": ["ancient-ruins", "temple-trail"],
  "jaipur-india": ["ancient-ruins", "temple-trail"],
  "petra-jordan": ["ancient-ruins", "hiking"],
  "zurich-switzerland": ["hiking", "skiing"],
  "edinburgh-scotland": ["ancient-ruins", "hiking"],
  "dublin-ireland": ["nightlife", "cycling"],
  "copenhagen-denmark": ["cycling", "nightlife"],
  "stockholm-sweden": ["kayaking", "cycling"],
  "seville-spain": ["nightlife", "ancient-ruins"],
  "munich-germany": ["nightlife", "cycling"],
  "kuala-lumpur-malaysia": ["nightlife", "temple-trail"],
  "doha-qatar": ["nightlife", "skydiving"],
  "queenstown-new-zealand": ["skydiving", "mountaineering"],
  "dubrovnik-croatia": ["kayaking", "ancient-ruins"]
};
