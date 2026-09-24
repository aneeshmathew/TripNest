// Combines every curated destination list into one, so any page that
// needs to resolve a /destinations/[slug] route works regardless of
// which list a destination came from (see app/destinations/[slug]/page.tsx),
// and so the homepage's "Explore more destinations" gallery can show the
// full breadth rather than just one set.
//
// Three sources: the 25 Nat Geo "Best of the World 2026" picks, 50
// household-name world destinations, and the 30 popular destinations
// shown in the homepage's top carousel (see popularDestinations.ts).
// Some names inevitably overlap across lists (e.g. "Rome" appears in both
// worldDestinations as "rome-italy" and popularDestinations as "rome") —
// left as separate destination pages for now rather than merged, since
// each list has its own slug scheme and merging them is a bigger change
// than adding the new carousel.
import { natGeoDestinations, type NatGeoDestination } from "./natGeoDestinations";
import { worldDestinations } from "./worldDestinations";
import { popularDestinationSeeds } from "./popularDestinations";

const popularDestinationsAsNatGeoShape: NatGeoDestination[] = popularDestinationSeeds.map((d) => ({
  slug: d.slug,
  name: d.name,
  location: d.location,
  blurb: `Discover ${d.name}, ${d.location}.`,
  imageUrl: d.imageUrl
}));

export const allDestinations: NatGeoDestination[] = [
  ...natGeoDestinations,
  ...worldDestinations,
  ...popularDestinationsAsNatGeoShape
];
