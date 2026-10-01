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

// Tags that suggest a good destination hero shot ...
const SCENIC_TERMS = [
  "skyline", "panorama", "landscape", "landmark", "aerial", "scenery", "scenic",
  "architecture", "mountains", "beach", "waterfall", "lake", "cityscape", "desert",
  "old town", "historic", "temple", "coast", "ancient", "view", "wildlife", "nature", "heritage" 
];
// ... and ones that suggest a close-up of a person, a meal or an object
// instead of the place itself. These demote a photo; they never reject it.
const OFF_TOPIC_TERMS = [
  "woman", "man", "girl", "boy", "people", "person", "portrait", "couple", "model", "selfie",
  "food", "dish", "meal", "coffee", "drink", "cocktail", "mask", "costume", "car", "truck", "bridge", "plant", "parking",
  "sign", "text", "logo", "icon", "product", "object", "furniture", "fog", "rain", "storm", "statue", "sunset", "sunrise"
];

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

/**
 * Very light stemmer so "surf" matches the tags "surfer" / "surfing" and
 * "falls" matches "fall". Applied to both the query and the tag words, so
 * it only needs to be consistent, not linguistically correct.
 */
export function stem(word: string): string {
  for (const suffix of ["ing", "ers", "er", "ed", "es", "s"]) {
    if (word.length - suffix.length >= 4 && word.endsWith(suffix)) return word.slice(0, -suffix.length);
  }
  return word;
}

function wordSet(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(/[\s-]+/)
      .filter(Boolean)
      .map(stem)
  );
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
  /** Override the share of `subject` keywords the tags must cover (default MIN_MATCH_RATIO). */
  minMatchRatio?: number;
  /** Send `subject` to Pixabay verbatim (no region/hint added) — region/hint still rank results. */
  literal?: boolean;
  /** Queries to try, in order, if this one finds no acceptable photo. */
  alternates?: PhotoQuery[];
  /**
   * Groups of acceptable tag words. A photo is rejected unless its tags
   * contain at least one word from EVERY group — e.g. [activity words, place
   * words] guarantees the photo shows both the activity and the place.
   */
  mustMatch?: string[][];
  /** Tag words/phrases that earn a ranking bonus (e.g. the exact city rather than just the country). */
  focus?: string[];
  /**
   * Rank for use as a destination hero image: prefer skylines, landmarks and
   * landscapes; demote close-ups of people, food and objects. (Off for
   * activities, where a person doing the activity is exactly what we want.)
   */
  scenic?: boolean;
}

function asPhotoQuery(q: string | PhotoQuery): PhotoQuery {
  return typeof q === "string" ? { subject: q } : q;
}

/**
 * Photo query for a destination, e.g. {name: "Iguazu Falls", location:
 * "Argentina/Brazil"}: the NAME must match the photo's tags (country only
 * ranks), then photos that read as a hero shot of the place are preferred —
 * see `scenic`. Searches "<name> <country>" first, then the plain name.
 */
export function destinationPhotoQuery(d: { name: string; location: string }): PhotoQuery {
  return { subject: d.name, region: d.location, scenic: true };
}

/**
 * Photo query for an activity card, e.g. {activity: "Surfing", title: "Sunset
 * Surf on Mexico's Coast", location: "Coastal Oaxaca, Mexico"}.
 *
 * 1. Search the card's own TITLE, verbatim — it already describes the picture
 *    we want (activity + scenery + place), and it is what returns the right
 *    photos when typed into pixabay.com. Country/activity only rank results.
 * 2. If nothing acceptable, fall back to "<activity> <location>" with the
 *    stricter 60% tag match (the previous behaviour).
 * 3. If that fails too, the card keeps its curated image.
 */
export function activityPhotoQuery(h: { activity: string; title: string; location: string }): PhotoQuery {
  const country = regionTail(h.location);
  // Accuracy comes from this rule, not from how many title words match
  // (titles contain filler like "Ultimate", "Journey", "Walk Through"): the
  // tags must name the ACTIVITY and the PLACE.
  const firstSegment = h.location.split(",")[0] ?? h.location;
  const mustMatch = [activityTerms(h.activity), placeTerms(h.location)];
  const common = { literal: true, minMatchRatio: 0, mustMatch, focus: placeTerms(firstSegment) };
  return {
    ...common,
    subject: h.title,
    region: country || undefined,
    hint: h.activity,
    alternates: [
      { ...common, subject: `${h.activity} ${h.location}` },
      // Broader pool for places with rare names (Oaxaca, Khiva): activity + country.
      ...(country ? [{ ...common, subject: `${queryKeywords(h.activity).join(" ")} ${country}` }] : [])
    ]
  };
}

/** Words photographers use for each activity (the card says "Surfing", tags say "surfer"). */
const ACTIVITY_TERMS: Record<string, string[]> = {
  hiking: ["hiking", "hike", "hiker", "trekking", "trek", "trail", "walking"],
  "animal watching": ["wildlife", "safari", "animal", "zebra", "elephant", "giraffe", "lion", "gorilla", "antelope", "buffalo", "hippo", "rhino"],
  surfing: ["surf", "surfing", "surfer", "surfboard", "longboard", "bodyboard"],
  cycling: ["cycling", "cyclist", "bicycle", "bike", "biking"],
  kayaking: ["kayak", "kayaking", "kayaker", "canoe", "paddle", "paddling"],
  "whale watching": ["whale", "humpback", "orca"],
  party: ["party", "nightlife", "carnival", "festival", "club", "samba", "parade", "dance", "celebration"],
  "rock climbing": ["climbing", "climber", "climb", "bouldering", "ferrata", "cliff"],
  skydiving: ["skydiving", "skydiver", "skydive", "parachute", "parachuting", "freefall"],
  "history & culture": ["history", "historic", "historical", "culture", "cultural", "heritage", "ancient", "temple", "monument", "architecture", "palace", "fortress", "mosque", "madrasa", "courtyard", "landmark", "tradition"],
  "scuba diving": ["scuba", "diving", "diver", "underwater", "reef", "snorkel", "snorkeling", "coral", "marine"],
  skiing: ["ski", "skiing", "skier", "snowboard", "snowboarding", "slope", "piste", "powder"],
  mountaineering: ["mountaineering", "mountaineer", "alpinist", "climbing", "climber", "summit", "peak", "alpine", "mountain", "glacier"]
};

/** Tag words that count as "this photo shows <activity>". Unknown activities use their own words. */
export function activityTerms(activity: string): string[] {
  return ACTIVITY_TERMS[activity.trim().toLowerCase()] ?? queryKeywords(activity);
}

/** "British Columbia, Canada" -> "Canada" (last, broadest segment). */
function regionTail(region?: string): string {
  if (!region) return "";
  const parts = region.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * Pixabay appends auto-generated colour tags to many photos ("gray ocean",
 * "brown mountain", "gray wallpaper"). They are noise — "gray" would
 * otherwise match the "Gray" in "Baja's Gray Whale Migration" — so drop them.
 */
export function cleanTags(tags: string): string {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t && !/^(gray|grey|brown)\s/i.test(t))
    .join(", ");
}

/**
 * Place terms for a location such as "Rio de Janeiro, Brazil" or "New
 * Zealand": the whole name as a phrase (so "new zealand" cannot be satisfied
 * by "new york") plus each distinctive word of 4+ letters ("new" alone is
 * deliberately excluded).
 */
export function placeTerms(location: string): string[] {
  const terms: string[] = [];
  for (const segment of location.split(",").map((s) => s.trim()).filter(Boolean)) {
    const phrase = normalize(segment).replace(/^the /, "");
    if (phrase.includes(" ")) terms.push(phrase);
    terms.push(...queryKeywords(segment).filter((w) => w.length >= 4));
  }
  return Array.from(new Set(terms));
}

/** Does `term` (a word, or a multi-word phrase) appear in the photo's tags? */
function tagsHaveTerm(term: string, words: Set<string>, normalizedTags: string): boolean {
  const t = normalize(term);
  return t.includes(" ") ? ` ${normalizedTags} `.includes(` ${t} `) : words.has(stem(t));
}

/**
 * Scores how well `hit` matches the query.
 * Returns -1 if the photo must be rejected (unsafe / unusable / wrong
 * place), otherwise a number where higher is better.
 */
export function scorePhoto(hit: PixabayHit, query: string | PhotoQuery): number {
  const { subject, region, hint, mustMatch, focus, scenic, minMatchRatio = MIN_MATCH_RATIO } = asPhotoQuery(query);
  const rawTags = hit.tags ?? "";
  const tags = cleanTags(rawTags);

  // Safety check runs on the raw tags — never relax it for cleaned-up ones.
  if (containsBlockedTerm(rawTags)) return -1;
  // Only real photos — never illustrations, vectors or videos.
  if (hit.type && hit.type !== "photo") return -1;
  if (!hit.largeImageURL) return -1;
  if (typeof hit.imageWidth === "number" && hit.imageWidth < MIN_WIDTH) return -1;
  // Landscape only: hero banners crop badly from portrait shots.
  if (hit.imageWidth && hit.imageHeight && hit.imageHeight > hit.imageWidth) return -1;

  const keywords = queryKeywords(subject);
  if (keywords.length === 0) return -1;

  const words = wordSet(tags);
  const normalizedTags = normalize(tags);
  if (mustMatch?.some((group) => !group.some((term) => tagsHaveTerm(term, words, normalizedTags)))) return -1;
  const matched = keywords.filter((k) => words.has(stem(k))).length;
  const ratio = matched / keywords.length;
  if (matched === 0 || ratio < minMatchRatio) return -1;

  let score = ratio * 10;
  // The whole place name appearing as one tag ("iguazu falls") is the
  // strongest signal that the photo is of exactly this place.
  if (keywords.length > 1 && ` ${normalize(tags).replace(/\s*,\s*/g, " , ")} `.includes(` ${normalize(subject)} `)) {
    score += 3;
  }
  // More distinct activity/place words in the tags = stronger evidence (max 3 per group).
  for (const group of mustMatch ?? []) {
    score += Math.min(group.filter((term) => tagsHaveTerm(term, words, normalizedTags)).length, 3);
  }
  // The exact city/place beats a photo that only matches the country.
  if (focus?.some((term) => tagsHaveTerm(term, words, normalizedTags))) score += 4;
  // A tag that is exactly the place name ("paris") is a strong signal on its own.
  if (tags.split(",").some((t) => normalize(t) === normalize(subject))) score += 2;
  if (scenic) {
    score += Math.min(SCENIC_TERMS.filter((t) => tagsHaveTerm(t, words, normalizedTags)).length * 0.5, 2);
    score -= Math.min(OFF_TOPIC_TERMS.filter((t) => tagsHaveTerm(t, words, normalizedTags)).length * 2, 6);
    if ((hit.imageWidth ?? 0) >= 1920) score += 0.5;
  }
  // Tie-breakers: country/region and activity words found in the tags.
  const extra = (text?: string) => queryKeywords(text ?? "").filter((k) => words.has(stem(k))).length;
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
  const { subject, region, hint, literal } = asPhotoQuery(query);
  const base = subject.trim();
  if (literal) return base ? [base.slice(0, 100)] : [];
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

export async function fetchHits(apiKey: string, q: string): Promise<PixabayHit[] | null> {
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
    // Primary query first, then each alternate; every step has its own
    // narrow-to-broad ladder and its own relevance rules.
    for (const step of [pq, ...(pq.alternates ?? [])]) {
      for (const q of searchLadder(step)) {
        const hits = await fetchHits(apiKey, q);
        if (hits === null) return null; // transient failure: don't memoize
        hit = pickBestPhoto(hits, step);
        if (hit) break;
      }
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
