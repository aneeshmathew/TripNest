import { describe, expect, it } from "vitest";
import { parseTripQuery } from "./parseTripQuery";

describe("parseTripQuery", () => {
  it("matches a known destination by exact name", () => {
    const result = parseTripQuery("I want to visit Vancouver");
    expect(result.destination?.slug).toBe("vancouver-canada");
  });

  it("matches an activity by its own label", () => {
    const result = parseTripQuery("Looking for surfing spots");
    expect(result.activity?.slug).toBe("surfing");
  });

  it("matches an activity via a synonym not in its own label", () => {
    // "trekking" isn't activityHighlights' label ("Hiking"), but should
    // still resolve to the hiking activity.
    const result = parseTripQuery("trekking in french alps");
    expect(result.activity?.slug).toBe("hiking");
  });

  it("does not fuzzy-match an unknown place to a similar-sounding known one", () => {
    // "French Alps" must NOT match "The Dolomites" (Italian Alps) — an
    // honest miss beats a wrong destination.
    const result = parseTripQuery("trekking in french alps");
    expect(result.destination).toBeNull();
  });

  it("returns no destination for a place we don't have curated (Chile)", () => {
    const result = parseTripQuery("I would like to go to Chile for surfing");
    expect(result.destination).toBeNull();
    expect(result.activity?.slug).toBe("surfing");
  });

  it("matches both destination and activity when both are present", () => {
    const result = parseTripQuery("Kayaking near Vancouver please");
    expect(result.destination?.slug).toBe("vancouver-canada");
    expect(result.activity?.slug).toBe("kayaking");
  });

  it("returns nulls for a query matching neither vocabulary", () => {
    const result = parseTripQuery("somewhere quiet and cheap");
    expect(result.destination).toBeNull();
    expect(result.activity).toBeNull();
  });

  it("is case-insensitive", () => {
    const result = parseTripQuery("SURFING IN MAUI");
    expect(result.destination?.slug).toBe("maui-usa");
    expect(result.activity?.slug).toBe("surfing");
  });

  it("matches skiing, including near the Dolomites where it's actually curated", () => {
    const result = parseTripQuery("skiing in the dolomites");
    expect(result.activity?.slug).toBe("skiing");
    expect(result.destination?.slug).toBe("dolomites-italy");
  });

  it("matches mountaineering via a synonym (alpinism)", () => {
    const result = parseTripQuery("interested in alpinism");
    expect(result.activity?.slug).toBe("mountaineering");
  });

  it("doesn't confuse 'mountaineering' with rock-climbing's 'climbing' keyword", () => {
    // "mountaineering" doesn't contain the substring "climbing", so this
    // should resolve to mountaineering specifically, not rock-climbing.
    const result = parseTripQuery("mountaineering trip");
    expect(result.activity?.slug).toBe("mountaineering");
  });

  it("matches a world destination (not just the 25 curated Nat Geo picks)", () => {
    // Regression test: Paris lives in data/worldDestinations.ts, not
    // data/natGeoDestinations.ts, but should still resolve here since the
    // homepage search promises to cover it.
    const result = parseTripQuery("Paris");
    expect(result.destination?.slug).toBe("paris-france");
  });
});
