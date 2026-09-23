import { NextRequest, NextResponse } from "next/server";
import { geoapifyAttractions, getAttractionsNear } from "../../../lib/geoapify";

// GET /api/attractions?lat=41.9&lon=12.5
// GET /api/attractions?q=Rome,Italy
//
// Same-origin proxy in front of Geoapify's Places API. Prefer passing
// lat/lon (e.g. from a LocationAutosuggest pick) — it's one API call
// instead of two. `q` is the fallback path for curated destinations that
// don't have stored coordinates yet.
export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const q = request.nextUrl.searchParams.get("q");

  try {
    if (lat && lon) {
      const results = await geoapifyAttractions(Number(lat), Number(lon));
      return NextResponse.json({ results });
    }

    if (q && q.trim()) {
      const results = await getAttractionsNear(q);
      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("[/api/attractions]", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
