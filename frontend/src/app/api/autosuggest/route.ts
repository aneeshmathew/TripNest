import { NextRequest, NextResponse } from "next/server";
import { geoapifyAutocomplete } from "../../../lib/geoapify";

// GET /api/autosuggest?q=par&type=city
//
// Same-origin proxy in front of Geoapify's Autocomplete API, so
// GEOAPIFY_API_KEY never reaches the browser. Used by
// components/LocationAutosuggest.tsx for every destination/attraction
// search box (Hero, SearchFilters, destination & activity tab search).
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const type = request.nextUrl.searchParams.get("type");

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await geoapifyAutocomplete(q, {
      type: type === "city" ? "city" : undefined
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[/api/autosuggest]", error);
    // Degrade to "no suggestions" rather than a hard error — the search
    // box still works as a plain text field either way.
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
