// Server-only Pixabay integration — only ever called from Server
// Components/route handlers, never from "use client" code, since
// PIXABAY_API_KEY is not a NEXT_PUBLIC_ var (the key should not be exposed
// client-side).
//
// Docs: https://pixabay.com/api/docs/
//
// SAFETY MODEL — we never trust Pixabay's top search hit blindly:
//   1. Ask Pixabay for its safe-search filter (safesearch=true), photos only,
//      horizontal, and a minimum width.
//   2. Pull several candidates (not just one) and reject any whose tags
//      contain a blocklisted term.
//   3. Require a candidate to actually mention the place we searched for
//      (relevance score on its tags) — otherwise treat it as "no match".
//   4. On "no match" (or any error) return null so callers fall back to the
//      hand-curated imageUrl in data/*.ts. A curated image is always
//      better than a wrong or unsafe one.
//
// Pixabay API terms worth knowing (https://pixabay.com/api/docs/):
//   - Responses must be cached for 24h (we do, via `revalidate` below).
//   - Rate limit is 100 requests / 60s per key.
//   - Permanent hotlinking of image URLs is not allowed. We pass the URL to
//     next/image, which fetches and serves the image from our own domain
//     (and caches it), so the browser never hotlinks pixabay directly.
//   - Attribution isn't required but is appreciated; we still return it.

const PIXABAY_API_URL = process.env.PIXABAY_API_URL ?? "https://pixabay.com/api/";

// Pixabay requires API responses be cached for 24 hours, and it also keeps
// a page of 20+ destinations well under the 100 req/min limit.
const REVALIDATE_SECONDS = 60 * 60 * 24;

/** How many candidates to request so there is something to choose from. */
const CANDIDATES_PER_QUERY = 40;

/**
 * Minimum fraction of the *subject's* keywords (the place name — never the
 * country or activity) that a photo's tags must cover. 0.5 means "1 of 2",
 * "2 of 3"... For a one-word subject ("Dublin") the word itself must match.
 */
const MIN_MATCH_RATIO = 0.5;

/** Reject tiny images — they look bad stretched across a hero banner. */
const MIN_WIDTH = 1200;

/**
 * Terms that disqualify a photo outright if they appear in its tags.
 * Matched as whole words (see `containsBlockedTerm`), so "Sussex" or
 * "Gunnison" are fine while "gun" / "naked" are caught. Extend freely — a
 * false positive only costs us one candidate, a false negative could cost
 * us trust.
 */
export const BLOCKED_TERMS: readonly string[] = [
  // nudity / sexual
  "nude", "nudity", "naked", "topless", "nsfw", "erotic", "sexy", "sensual",
  "lingerie", "underwear", "bikini model", "porn", "sex", "fetish", "stripper",
  // violence / weapons
  "gun", "guns", "rifle", "pistol", "firearm", "weapon", "weapons", "knife",
  "bomb", "explosion", "blood", "bloody", "gore", "corpse", "dead body",
  "murder", "violence", "soldier", "terror", "terrorist", "execution",
  // drugs / vice
  "drug", "drugs", "cocaine", "heroin", "marijuana", "cannabis", "weed",
  "syringe", "needle", "overdose", "addict", "alcoholic", "drunk",
  // self-harm / distress
  "suicide", "self harm", "self-harm", "noose",
  // hate symbols / extremism
  "nazi", "swastika", "kkk", "isis", "extremist", "racist",
  // misc risky
  "protest", "riot", "arrest", "police brutality", "funeral", "coffin",
  "cemetery",
  // identifiable minors (privacy) — hero banners should be about the place
  "child", "children", "kid", "kids", "baby", "toddler"
];

// Words that carry no place information and shouldn't count toward (or
// against) the relevance match.
const STOPWORDS = new Set([
  "the", "and", "of", "in", "on", "at", "to", "for", "a", "an", "with", "de",
  "la", "le", "el", "del", "du", "des",
  // Generic descriptors: "Akagera National Park" is matched by "akagera"
  // alone — photographers rarely tag "national" / "park" / "coastal".
  "national", "park", "reserve", "city", "coastal", "region", "province",
  "county", "town", "village"
]);

/** The subset of Pixabay's image object that we use. */
export interface PixabayHit {
  id?: number;
  pageURL?: string;
  /** Comma-separated, e.g. "dolomites, mountains, italy". */
  tags?: string;
  type?: string;
  webformatURL?: string;
  /** 1280px-wide version — what we show in hero banners. */
  largeImageURL?: string;
  imageWidth?: number;
  imageHeight?: number;
  likes?: number;
  downloads?: number;
  user?: string;
  user_id?: number;
}

interface PixabaySearchResponse {
  hits?: PixabayHit[];
}

export interface DestinationPhoto {
  url: string;
  alt: string;
  /** Not required by Pixabay, but appreciated — shown if/when the UI wants it. */
  attribution: { photographerName: string; photographerUrl: string; photoUrl: string };
}

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/** Lowercase, strip diacritics ("São Paulo" -> "sao paulo"), collapse punctuation. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Significant keywords of a search query, e.g. "The Dolomites Italy" -> ["dolomites","italy"]. */
export function queryKeywords(query: string): string[] {
  const words = normalize(query).split(/[\s-]+/);
  return Array.from(new Set(words.filter((w) => w.length >= 3 && !STOPWORDS.has(w))));
}

function wordSet(text: string): Set<string> {
  return new Set(normalize(text).split(/[\s-]+/).filter(Boolean));
}

/** Whole-word / whole-phrase blocklist check. */
export function containsBlockedTerm(text: string): boolean {
  const haystack = ` ${normalize(text)} `;
  return BLOCKED_TERMS.some((term) => haystack.includes(` ${normalize(term)} `));
}

/**
 * What we are looking for. Only `subject` MUST match a photo's tags; `region`
 * and `hint` merely rank otherwise-acceptable photos higher. Pixabay tags
 * rarely include the country, so requiring it rejected perfectly good photos
 * (e.g. "Iguazu Falls" tagged "iguazu, waterfall, nature").
 */
export interface PhotoQuery {
  /** The place/attraction itself, e.g. "Iguazu Falls", "Dublin". Must match. */
  subject: string;
  /** Wider area, e.g. "Argentina" or "British Columbia, Canada". Ranking only. */
  region?: string;
  /** Extra flavour, e.g. the activity "Hiking". Ranking only. */
  hint?: string;
}

function asPhotoQuery(q: string | PhotoQuery): PhotoQuery {
  return typeof q === "string" ? { subject: q } : q;
}

/**
 * Photo query for an activity card such as {activity: "Hiking", location:
 * "Dublin, Ireland"}: the *place* ("Dublin") must match, the country and the
 * activity only rank photos — so we get a photo of the right place, ideally
 * showing the activity, rather than any photo of the activity anywhere.
 */
export function activityPhotoQuery(h: { activity: string; location: string }): PhotoQuery {
  const parts = h.location.split(",").map((p) => p.trim()).filter(Boolean);
  return {
    subject: parts[0] ?? h.location,
    region: parts.slice(1).join(", ") || undefined,
    hint: h.activity
  };
}

/** "British Columbia, Canada" -> "Canada" (last, broadest segment). */
function regionTail(region?: string): string {
  if (!region) return "";
  const parts = region.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * Scores how well `hit` matches the query.
 * Returns -1 if the photo must be rejected (unsafe / unusable / wrong
 * place), otherwise a number where higher is better.
 */
export function scorePhoto(hit: PixabayHit, query: string | PhotoQuery): number {
  const { subject, region, hint } = asPhotoQuery(query);
  const tags = hit.tags ?? "";

  if (containsBlockedTerm(tags)) return -1;
  // Only real photos — never illustrations, vectors or videos.
  if (hit.type && hit.type !== "photo") return -1;
  if (!hit.largeImageURL) return -1;
  if (typeof hit.imageWidth === "number" && hit.imageWidth < MIN_WIDTH) return -1;
  // Landscape only: hero banners crop badly from portrait shots.
  if (hit.imageWidth && hit.imageHeight && hit.imageHeight > hit.imageWidth) return -1;

  const keywords = queryKeywords(subject);
  if (keywords.length === 0) return -1;

  const words = wordSet(tags);
  const matched = keywords.filter((k) => words.has(k)).length;
  const ratio = matched / keywords.length;
  if (matched === 0 || ratio < MIN_MATCH_RATIO) return -1;

  let score = ratio * 10;
  // The whole place name appearing as one tag ("iguazu falls") is the
  // strongest signal that the photo is of exactly this place.
  if (keywords.length > 1 && ` ${normalize(tags).replace(/\s*,\s*/g, " , ")} `.includes(` ${normalize(subject)} `)) {
    score += 3;
  }
  // Tie-breakers: country/region and activity words found in the tags.
  const extra = (text?: string) => queryKeywords(text ?? "").filter((k) => words.has(k)).length;
  score += extra(region) * 1.5 + extra(hint);
  // Mild nudge toward well-liked, high-resolution shots.
  score += Math.min((hit.likes ?? 0) / 500, 2);
  if ((hit.imageWidth ?? 0) >= 3000) score += 0.5;
  return score;
}

/** Highest-scoring acceptable photo, or null if none pass the safety/relevance bar. */
export function pickBestPhoto(hits: PixabayHit[], query: string | PhotoQuery): PixabayHit | null {
  let best: PixabayHit | null = null;
  let bestScore = -1;
  for (const hit of hits) {
    const s = scorePhoto(hit, query);
    if (s > bestScore) {
      best = hit;
      bestScore = s;
    }
  }
  return best;
}

/**
 * Search strings to try, most specific first. Pixabay ANDs every word, so
 * each extra word shrinks the result pool; if the narrow query yields no
 * acceptable photo we retry with just the place name.
 */
export function searchLadder(query: string | PhotoQuery): string[] {
  const { subject, region, hint } = asPhotoQuery(query);
  const base = subject.trim();
  const tail = regionTail(region);
  const ladder = [
    [base, tail, hint].filter(Boolean).join(" "),
    [base, tail].filter(Boolean).join(" "),
    base
  ].map((q) => q.slice(0, 100)); // Pixabay caps `q` at 100 characters
  return Array.from(new Set(ladder.filter(Boolean)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Per-process memo on top of Next's fetch cache: the selection is
// deterministic, so a given query always resolves to the same photo (no
// flip-flopping between renders) without re-scoring.
const resolved = new Map<string, DestinationPhoto | null>();

async function fetchHits(apiKey: string, q: string): Promise<PixabayHit[] | null> {
  const params = new URLSearchParams({
    key: apiKey,
    q,
    image_type: "photo",
    orientation: "horizontal",
    min_width: String(MIN_WIDTH),
    // Pixabay's safe-search filter: only content suitable for all ages.
    safesearch: "true",
    order: "popular",
    per_page: String(CANDIDATES_PER_QUERY)
  });
  const res = await fetch(`${PIXABAY_API_URL}?${params.toString()}`, {
    next: { revalidate: REVALIDATE_SECONDS }
  });
  // Transient failures (incl. 429 rate limiting) → null, so the caller does
  // not memoize them and retries on the next render.
  if (!res.ok) return null;
  const data = (await res.json()) as PixabaySearchResponse;
  return data.hits ?? [];
}

/**
 * Searches Pixabay for a photo of `query` (a place name, or a PhotoQuery with
 * region/hint for better ranking). Returns null on any miss — no API key, no
 * *safe and relevant* result, or a request failure — so callers can fall back
 * to a curated/static image instead. Never throws.
 */
export async function searchDestinationPhoto(query: string | PhotoQuery): Promise<DestinationPhoto | null> {
  const apiKey = process.env.PIXABAY_API_KEY;
  const pq = asPhotoQuery(query);
  const subject = pq.subject.trim();
  if (!apiKey || !subject) return null;

  const cacheKey = normalize([subject, pq.region, pq.hint].filter(Boolean).join("|"));
  if (resolved.has(cacheKey)) return resolved.get(cacheKey) ?? null;

  try {
    let hit: PixabayHit | null = null;
    for (const q of searchLadder(pq)) {
      const hits = await fetchHits(apiKey, q);
      if (hits === null) return null; // transient failure: don't memoize
      hit = pickBestPhoto(hits, pq);
      if (hit) break;
    }

    const result: DestinationPhoto | null =
      hit && hit.largeImageURL
        ? {
            url: hit.largeImageURL,
            alt: subject,
            attribution: {
              photographerName: hit.user ?? "Pixabay contributor",
              photographerUrl: hit.user && hit.user_id ? `https://pixabay.com/users/${hit.user}-${hit.user_id}/` : "https://pixabay.com",
              photoUrl: hit.pageURL ?? "https://pixabay.com"
            }
          }
        : null;

    resolved.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Convenience helper for the common case: get an image URL for `query`,
 * falling back to `fallbackUrl` (a curated/static image) whenever Pixabay
 * has nothing safe and relevant. Once the curated imageUrl fields are
 * removed from the destination/activity data files, drop the fallback param.
 */
export async function getDestinationPhotoUrl(query: string | PhotoQuery, fallbackUrl?: string): Promise<string> {
  const photo = await searchDestinationPhoto(query);
  return photo?.url ?? fallbackUrl ?? "";
}
