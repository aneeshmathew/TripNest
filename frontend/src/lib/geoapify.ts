// Server-only Geoapify integration. Never import this from a "use client"
// component — GEOAPIFY_API_KEY is a plain (non NEXT_PUBLIC_) env var on
// purpose, so it never ends up in the browser bundle. Client code that
// needs autosuggest/attractions goes through the same-origin proxy routes
// in app/api/autosuggest and app/api/attractions instead.
//
// Docs: https://apidocs.geoapify.com/docs/geocoding/autocomplete/ and
// https://apidocs.geoapify.com/docs/places/

const GEOAPIFY_BASE_URL = "https://api.geoapify.com";

export interface GeoSuggestion {
  /** Short label, e.g. "Paris" */
  name: string;
  /** Full formatted address/place string, e.g. "Paris, France" */
  formatted: string;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
  /** Geoapify's place_id — stable-ish identifier for this result */
  placeId?: string;
  /** e.g. "city", "county", "tourism" — Geoapify's `result_type`/category */
  resultType?: string;
}

export interface GeoAttraction {
  name: string;
  formatted: string;
  lat: number;
  lon: number;
  categories: string[];
  placeId?: string;
}

function getApiKey(): string {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) {
    throw new Error(
      "GEOAPIFY_API_KEY is not set — add it to frontend/.env.local (see frontend/.env.example)."
    );
  }
  return key;
}

// Autocomplete is meant for fast-typing UI, so cache lightly (or not at
// all) rather than Unsplash's day-long cache — 5 minutes keeps repeat
// keystrokes on a popular query cheap without serving stale-for-long data.
const AUTOCOMPLETE_REVALIDATE_SECONDS = 300;

/**
 * Autocomplete suggestions for a destination/attraction search box.
 * `type` narrows results — pass "city" for the destination search boxes,
 * omit it for a broader (attraction/POI-friendly) search.
 */
export async function geoapifyAutocomplete(
  text: string,
  opts: { type?: "city" | "country"; limit?: number } = {}
): Promise<GeoSuggestion[]> {
  const trimmed = text.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    text: trimmed,
    format: "json",
    limit: String(opts.limit ?? 6),
    apiKey: getApiKey()
  });
  if (opts.type) params.set("type", opts.type);

  const res = await fetch(`${GEOAPIFY_BASE_URL}/v1/geocode/autocomplete?${params.toString()}`, {
    next: { revalidate: AUTOCOMPLETE_REVALIDATE_SECONDS }
  });

  if (!res.ok) {
    throw new Error(`Geoapify autocomplete failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    results?: Array<{
      name?: string;
      city?: string;
      country?: string;
      formatted: string;
      lat: number;
      lon: number;
      place_id?: string;
      result_type?: string;
    }>;
  };

  return (data.results ?? []).map((r) => ({
    name: r.name ?? r.city ?? r.formatted.split(",")[0],
    formatted: r.formatted,
    city: r.city,
    country: r.country,
    lat: r.lat,
    lon: r.lon,
    placeId: r.place_id,
    resultType: r.result_type
  }));
}

/**
 * Resolves a free-text place name (e.g. a curated destination's
 * "name, location" string) to coordinates, so pages that only have a
 * hardcoded destination name can still look up nearby attractions.
 * Returns null if nothing matches rather than throwing, since this backs
 * a "nice to have" section that shouldn't break the page.
 */
export async function geocodePlace(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const [first] = await geoapifyAutocomplete(query, { limit: 1 });
    return first ? { lat: first.lat, lon: first.lon } : null;
  } catch {
    return null;
  }
}

// Attractions change slowly — cache for a day, same rationale as Unsplash.
const PLACES_REVALIDATE_SECONDS = 60 * 60 * 24;

/**
 * Nearby tourist attractions/sights around a point, via Geoapify's Places
 * API. Used to power the "Attractions" tab/section — this is live data,
 * distinct from TripNest's own curated "Activities" catalog.
 */
export async function geoapifyAttractions(
  lat: number,
  lon: number,
  opts: { radiusMeters?: number; limit?: number } = {}
): Promise<GeoAttraction[]> {
  const params = new URLSearchParams({
    categories: "tourism.sights,tourism.attraction",
    filter: `circle:${lon},${lat},${opts.radiusMeters ?? 15000}`,
    bias: `proximity:${lon},${lat}`,
    limit: String(opts.limit ?? 12),
    apiKey: getApiKey()
  });

  const res = await fetch(`${GEOAPIFY_BASE_URL}/v2/places?${params.toString()}`, {
    next: { revalidate: PLACES_REVALIDATE_SECONDS }
  });

  if (!res.ok) {
    throw new Error(`Geoapify places failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    features?: Array<{
      properties: {
        name?: string;
        formatted: string;
        lat: number;
        lon: number;
        categories?: string[];
        place_id?: string;
      };
    }>;
  };

  return (data.features ?? [])
    .filter((f) => f.properties.name) // unnamed POIs aren't useful in a list of "attractions"
    .map((f) => ({
      name: f.properties.name as string,
      formatted: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
      categories: f.properties.categories ?? [],
      placeId: f.properties.place_id
    }));
}

/**
 * Convenience wrapper for pages that only have a destination/activity name
 * (no stored coordinates): geocodes the name, then fetches attractions
 * around it. Returns an empty list — never throws — so a geocoding miss or
 * an API hiccup just means an empty section, not a broken page.
 */
export async function getAttractionsNear(placeQuery: string): Promise<GeoAttraction[]> {
  try {
    const point = await geocodePlace(placeQuery);
    if (!point) return [];
    return await geoapifyAttractions(point.lat, point.lon);
  } catch {
    return [];
  }
}
