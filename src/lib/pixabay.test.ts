import { describe, expect, it } from "vitest";
import {
  activityPhotoQuery,
  containsBlockedTerm,
  getDestinationPhotoUrl,
  pickBestPhoto,
  queryKeywords,
  scorePhoto,
  searchLadder,
  type PixabayHit
} from "./pixabay";

function hit(over: Partial<PixabayHit> = {}): PixabayHit {
  return {
    id: 1,
    type: "photo",
    tags: "dolomites, italy, mountains",
    imageWidth: 4000,
    imageHeight: 2667,
    likes: 100,
    largeImageURL: "https://pixabay.com/get/x_1280.jpg",
    pageURL: "https://pixabay.com/photos/x-1/",
    user: "someone",
    user_id: 42,
    ...over
  };
}

describe("queryKeywords", () => {
  it("drops stopwords and diacritics", () => {
    expect(queryKeywords("The Dolomites, Italy")).toEqual(["dolomites", "italy"]);
    expect(queryKeywords("São Paulo")).toEqual(["sao", "paulo"]);
  });
});

describe("containsBlockedTerm", () => {
  it("matches whole words only", () => {
    expect(containsBlockedTerm("a man with a gun")).toBe(true);
    expect(containsBlockedTerm("Sussex coast")).toBe(false);
    expect(containsBlockedTerm("Gunnison river")).toBe(false);
    expect(containsBlockedTerm("naked, woman, beach")).toBe(true);
  });
});

describe("scorePhoto", () => {
  it("accepts a relevant, safe photo", () => {
    expect(scorePhoto(hit(), "Dolomites Italy")).toBeGreaterThan(0);
  });
  it("rejects a photo of the wrong place", () => {
    expect(scorePhoto(hit({ tags: "city, skyline, night" }), "Dolomites Italy")).toBe(-1);
  });
  it("rejects a photo that only matches the country, not the place", () => {
    expect(scorePhoto(hit({ tags: "italy, pizza, food" }), { subject: "Dolomites", region: "Italy" })).toBe(-1);
  });
  it("does not require the country in the tags (Iguazu Falls)", () => {
    const iguazu = hit({ tags: "iguazu falls, waterfall, nature" });
    expect(scorePhoto(iguazu, { subject: "Iguazu Falls", region: "Argentina" })).toBeGreaterThan(0);
  });
  it("accepts a partial name match but ranks the full name higher", () => {
    const partial = hit({ tags: "iguazu, river" });
    const full = hit({ tags: "iguazu falls, waterfall" });
    const q = { subject: "Iguazu Falls" };
    expect(scorePhoto(partial, q)).toBeGreaterThan(0);
    expect(scorePhoto(full, q)).toBeGreaterThan(scorePhoto(partial, q));
  });
  it("ignores generic words like National Park", () => {
    expect(scorePhoto(hit({ tags: "akagera, safari, zebra" }), { subject: "Akagera National Park" })).toBeGreaterThan(0);
  });
  it("ranks region and hint matches higher", () => {
    const q = { subject: "Dublin", region: "Ireland", hint: "Hiking" };
    const plain = hit({ tags: "dublin, city" });
    const better = hit({ tags: "dublin, ireland, hiking" });
    expect(scorePhoto(better, q)).toBeGreaterThan(scorePhoto(plain, q));
  });
  it("rejects blocklisted content even if the place matches", () => {
    expect(scorePhoto(hit({ tags: "dolomites, italy, weapon" }), "Dolomites Italy")).toBe(-1);
  });
  it("rejects non-photos, small and portrait images, and hits without a URL", () => {
    expect(scorePhoto(hit({ type: "illustration" }), "Dolomites Italy")).toBe(-1);
    expect(scorePhoto(hit({ imageWidth: 800, imageHeight: 600 }), "Dolomites Italy")).toBe(-1);
    expect(scorePhoto(hit({ imageWidth: 2000, imageHeight: 3000 }), "Dolomites Italy")).toBe(-1);
    expect(scorePhoto(hit({ largeImageURL: undefined }), "Dolomites Italy")).toBe(-1);
  });
  it("handles diacritics in tags", () => {
    expect(scorePhoto(hit({ tags: "são paulo, brazil" }), "Sao Paulo Brazil")).toBeGreaterThan(0);
  });
});

describe("pickBestPhoto", () => {
  it("returns null when nothing qualifies (caller uses curated fallback)", () => {
    expect(pickBestPhoto([hit({ tags: "cat, pet" })], "Dolomites Italy")).toBeNull();
    expect(pickBestPhoto([], "Dolomites Italy")).toBeNull();
  });
  it("skips unsafe hits even when they are the most popular", () => {
    const unsafe = hit({ id: 9, tags: "dolomites, italy, naked", likes: 99999 });
    const ok = hit({ id: 2 });
    expect(pickBestPhoto([unsafe, ok], "Dolomites Italy")?.id).toBe(2);
  });
});

describe("searchLadder / activityPhotoQuery", () => {
  it("goes from specific to broad, de-duplicated", () => {
    expect(searchLadder({ subject: "Haida Gwaii", region: "British Columbia, Canada", hint: "Kayaking" })).toEqual([
      "Haida Gwaii Canada Kayaking",
      "Haida Gwaii Canada",
      "Haida Gwaii"
    ]);
    expect(searchLadder("Iguazu Falls")).toEqual(["Iguazu Falls"]);
  });
  it("splits an activity location into place / region / hint", () => {
    expect(activityPhotoQuery({ activity: "Skydiving", location: "Queenstown, New Zealand" })).toEqual({
      subject: "Queenstown",
      region: "New Zealand",
      hint: "Skydiving"
    });
  });
});

describe("getDestinationPhotoUrl (mocked Pixabay)", () => {
  const realFetch = globalThis.fetch;
  const realKey = process.env.PIXABAY_API_KEY;

  function mockPixabay(byQuery: Record<string, PixabayHit[]>) {
    const calls: string[] = [];
    globalThis.fetch = (async (url: string) => {
      const q = new URL(url).searchParams.get("q") ?? "";
      calls.push(q);
      return { ok: true, json: async () => ({ hits: byQuery[q] ?? [] }) } as Response;
    }) as typeof fetch;
    return calls;
  }
  function restore() {
    globalThis.fetch = realFetch;
    if (realKey === undefined) delete process.env.PIXABAY_API_KEY;
    else process.env.PIXABAY_API_KEY = realKey;
  }

  it("falls back from the narrow query to the plain place name", async () => {
    process.env.PIXABAY_API_KEY = "test";
    const calls = mockPixabay({
      "Iguazu Falls Argentina": [], // too narrow: no results
      "Iguazu Falls": [hit({ id: 7, tags: "iguazu falls, waterfall", largeImageURL: "https://pixabay.com/get/iguazu_1280.jpg" })]
    });
    try {
      const url = await getDestinationPhotoUrl({ subject: "Iguazu Falls", region: "Argentina" }, "fallback.jpg");
      expect(url).toBe("https://pixabay.com/get/iguazu_1280.jpg");
      expect(calls).toEqual(["Iguazu Falls Argentina", "Iguazu Falls"]);
    } finally {
      restore();
    }
  });

  it("uses the curated fallback when every result is off-topic or unsafe", async () => {
    process.env.PIXABAY_API_KEY = "test";
    mockPixabay({
      "Machu Picchu Peru": [hit({ tags: "beach, palm trees" }), hit({ tags: "machu picchu, naked" })],
      "Machu Picchu": [hit({ tags: "city, skyline" })]
    });
    try {
      const url = await getDestinationPhotoUrl({ subject: "Machu Picchu", region: "Peru" }, "fallback.jpg");
      expect(url).toBe("fallback.jpg");
    } finally {
      restore();
    }
  });
});
