// Combines the 25 curated Nat Geo picks with the 30 household-name world
// destinations into one list. Used wherever a page needs to resolve a
// /destinations/[slug] route regardless of which curated set it came
// from (see app/destinations/[slug]/page.tsx), and by the homepage
// "Explore more destinations" gallery, which wants the full breadth
// (55 destinations) rather than just one set or the other.
import { natGeoDestinations, type NatGeoDestination } from "./natGeoDestinations";
import { worldDestinations } from "./worldDestinations";

export const allDestinations: NatGeoDestination[] = [...natGeoDestinations, ...worldDestinations];
