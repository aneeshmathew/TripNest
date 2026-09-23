// Server-only Unsplash integration — only ever called from Server
// Components/route handlers, never from "use client" code, since
// UNSPLASH_ACCESS_KEY is not a NEXT_PUBLIC_ var (Unsplash's API guidelines
// ask that the Access Key not be exposed client-side).
//
// Docs: https://unsplash.com/documentation#search-photos

const UNSPLASH_API_URL = process.env.UNSPLASH_API_URL ?? "https://api.unsplash.com/search/photos";

// Real destination/attraction photos don't change — cache for a day so a
// page of 20+ destinations doesn't burn through Unsplash's free-tier rate
// limit (50 req/hour on the Demo tier) on every render.
const REVALIDATE_SECONDS = 60 * 60 * 24;

interface UnsplashPhoto {
  urls: { regular: string; small: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

export interface DestinationPhoto {
  url: string;
  alt: string;
  /** Required by Unsplash's API guidelines whenever a photo is used. */
  attribution: { photographerName: string; photographerUrl: string; photoUrl: string };
}

/**
 * Searches Unsplash for a photo matching `query` (typically a destination
 * or attraction name, e.g. "Dolomites Italy"). Returns null on any miss —
 * no access key configured, no results, or a request failure — so callers
 * can fall back to a curated/static image instead. Never throws.
 */
export async function searchDestinationPhoto(query: string): Promise<DestinationPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || !query.trim()) return null;

  try {
    const params = new URLSearchParams({
      query,
      per_page: "1",
      orientation: "landscape"
    });

    const res = await fetch(`${UNSPLASH_API_URL}?${params.toString()}`, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: REVALIDATE_SECONDS }
    });

    if (!res.ok) return null;

    const data = (await res.json()) as UnsplashSearchResponse;
    const photo = data.results?.[0];
    if (!photo) return null;

    return {
      url: photo.urls.regular,
      alt: photo.alt_description ?? query,
      attribution: {
        photographerName: photo.user.name,
        photographerUrl: `${photo.user.links.html}?utm_source=tripnest&utm_medium=referral`,
        photoUrl: `${photo.links.html}?utm_source=tripnest&utm_medium=referral`
      }
    };
  } catch {
    return null;
  }
}

/**
 * Convenience helper for the common case: get an image URL for `query`,
 * falling back to `fallbackUrl` (a curated/static image) only when
 * Unsplash has nothing. Once the curated imageUrl fields are removed from
 * the destination/activity data files, drop the fallback param.
 */
export async function getDestinationPhotoUrl(query: string, fallbackUrl?: string): Promise<string> {
  const photo = await searchDestinationPhoto(query);
  return photo?.url ?? fallbackUrl ?? "";
}
