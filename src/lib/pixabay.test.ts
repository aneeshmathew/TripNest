import { describe, expect, it } from "vitest";
import {
  activityPhotoQuery,
  cleanTags,
  placeTerms,
  activityTerms,
  containsBlockedTerm,
  getDestinationPhotoUrl,
  pickBestPhoto,
  queryKeywords,
  scorePhoto,
  searchLadder,
  stem,
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
  it("searches an activity by its card title, verbatim, then by activity + location, then activity + country", () => {
    const q = activityPhotoQuery({
      activity: "Surfing",
      title: "Sunset Surf on Mexico's Coast",
      location: "Coastal Oaxaca, Mexico"
    });
    expect(searchLadder(q)).toEqual(["Sunset Surf on Mexico's Coast"]); // literal: nothing appended
    expect((q.alternates ?? []).map((a) => searchLadder(a)[0])).toEqual([
      "Surfing Coastal Oaxaca, Mexico",
      "surfing Mexico"
    ]);
  });
});

describe("activity cards must show BOTH the activity and the place", () => {
  const surf = activityPhotoQuery({ activity: "Surfing", title: "Sunset Surf on Mexico's Coast", location: "Coastal Oaxaca, Mexico" });
  const khiva = activityPhotoQuery({ activity: "History & Culture", title: "Silk Road Walk Through Khiva", location: "Khiva, Uzbekistan" });
  const hike = activityPhotoQuery({ activity: "Hiking", title: "Ultimate Ireland Hiking Journey", location: "Dublin, Ireland" });
  it("rejects a beach photo with no surfing", () => {
    expect(scorePhoto(hit({ tags: "beach, sea, mexico, sunset" }), surf)).toBe(-1);
  });
  it("rejects surfing in the wrong country", () => {
    expect(scorePhoto(hit({ tags: "surfer, wave, california, sunset" }), surf)).toBe(-1);
  });
  it("accepts surfing in the right country, whatever the word form", () => {
    expect(scorePhoto(hit({ tags: "surfer, wave, mexico" }), surf)).toBeGreaterThan(0);
  });
  it("is not thrown off by filler words in the title (only 'khiva' appears)", () => {
    expect(scorePhoto(hit({ tags: "khiva, uzbekistan, architecture" }), khiva)).toBeGreaterThan(0);
  });
  it("rejects the right place without the activity, and vice versa", () => {
    expect(scorePhoto(hit({ tags: "ireland, castle, green" }), hike)).toBe(-1);
    expect(scorePhoto(hit({ tags: "hiking, mountains, nepal" }), hike)).toBe(-1);
    expect(scorePhoto(hit({ tags: "hiking, trail, ireland" }), hike)).toBeGreaterThan(0);
  });
  it("maps activities to the words photographers use", () => {
    expect(activityTerms("Animal Watching")).toEqual(expectedSafari());
    expect(activityTerms("Something New")).toEqual(["something", "new"].filter((w) => w.length >= 3));
  });
});

function expectedSafari() {
  return ["wildlife", "safari", "animal", "zebra", "elephant", "giraffe", "lion", "gorilla", "antelope", "buffalo", "hippo", "rhino"];
}

describe("cleanTags / placeTerms", () => {
  it("drops Pixabay's auto-generated colour tags", () => {
    expect(cleanTags("sea, whale, gray ocean, gray boat, brown path, grey sky")).toBe("sea, whale");
  });
  it("keeps multi-word places as phrases and ignores 3-letter words", () => {
    expect(placeTerms("New Zealand")).toEqual(["new zealand", "zealand"]);
    expect(placeTerms("Rio de Janeiro, Brazil")).toEqual(["rio de janeiro", "janeiro", "brazil"]);
    expect(placeTerms("Coastal Oaxaca, Mexico")).toEqual(["coastal oaxaca", "oaxaca", "mexico"]);
  });
});

// Regression tests built from REAL Pixabay tags (scripts/pixabay-debug.ts output).
describe("real-data regressions", () => {
  const khivaQ = activityPhotoQuery({ activity: "History & Culture", title: "Silk Road Walk Through Khiva", location: "Khiva, Uzbekistan" });
  const whaleQ = activityPhotoQuery({ activity: "Whale Watching", title: "Baja's Gray Whale Migration", location: "Reykjavík, Iceland" });
  const skyQ = activityPhotoQuery({ activity: "Skydiving", title: "Skydiving Over the Southern Alps", location: "Queenstown, New Zealand" });
  const surfQ = activityPhotoQuery({ activity: "Surfing", title: "Sunset Surf on Mexico's Coast", location: "Coastal Oaxaca, Mexico" });

  it("Khiva card: the Khiva photo beats a Tashkent mosque that only shares the country", () => {
    const tashkent = hit({ id: 1, tags: "tashkent, mosque, uzbekistan, islam, central asia, tile, building, ceramic, historical, silk road, dome, silk road, silk road" });
    const khiva = hit({ id: 2, tags: "khiva, kihva, unesco world heritage, museum city, evening atmosphere, uzbekistan" });
    expect(pickBestPhoto([tashkent, khiva], khivaQ)?.id).toBe(2);
  });
  it("Whale card: 'gray ocean' no longer matches 'Gray' in the title", () => {
    const bw = hit({ id: 1, tags: "sea, ocean, whale, ship, boat, fins, black and white, nature, iceland, gray ocean, gray boat" });
    const humpback = hit({ id: 2, tags: "whale, the humpback whale, humpback whales, mammal, iceland, the fjord, tourism, travel, tail, sea, nature, whale watching" });
    expect(pickBestPhoto([bw, humpback], whaleQ)?.id).toBe(2);
  });
  it("Skydiving Queenstown (New Zealand): a New York photo cannot pass on the word 'new'", () => {
    expect(scorePhoto(hit({ tags: "skydiving, new york, usa, skydiver" }), skyQ)).toBe(-1);
    expect(scorePhoto(hit({ tags: "skydiving, skydiver, new zealand" }), skyQ)).toBeGreaterThan(0);
  });
  it("Surfing card: surfing photos without 'mexico' in the tags are rejected; the Mexico one is accepted", () => {
    expect(scorePhoto(hit({ tags: "surf, beach, sand, sports, waves, sunset, costa, coast, landscape, nature, paradise, surfer" }), surfQ)).toBe(-1);
    expect(scorePhoto(hit({ tags: "mexico, nature, surfing, water, ocean, beach, wave" }), surfQ)).toBeGreaterThan(0);
  });
});

describe("stem", () => {
  it("lets 'surf' match surfer / surfing", () => {
    expect(stem("surfing")).toBe(stem("surf"));
    expect(stem("surfer")).toBe(stem("surf"));
    expect(stem("falls")).toBe(stem("fall"));
    expect(stem("mexico")).toBe("mexico");
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

  it("activity card: finds the photo via the title query, no need for the fallback query", async () => {
    process.env.PIXABAY_API_KEY = "test";
    const title = "Sunset Surf on Mexico's Coast";
    const calls = mockPixabay({
      [title]: [hit({ id: 3, tags: "surfer, sunset, mexico", largeImageURL: "https://pixabay.com/get/surf_1280.jpg" })]
    });
    try {
      const url = await getDestinationPhotoUrl(
        activityPhotoQuery({ activity: "Surfing", title, location: "Coastal Oaxaca, Mexico" }),
        "fallback.jpg"
      );
      expect(url).toBe("https://pixabay.com/get/surf_1280.jpg");
      expect(calls).toEqual([title]);
    } finally {
      restore();
    }
  });

  it("activity card: tries '<activity> <location>' when the title query has no acceptable photo", async () => {
    process.env.PIXABAY_API_KEY = "test";
    const title = "Skydiving Over the Southern Alps";
    const alt = "Skydiving Queenstown, New Zealand";
    const calls = mockPixabay({
      [title]: [hit({ tags: "cat, pet" })],
      [alt]: [hit({ id: 4, tags: "skydiving, queenstown, new zealand", largeImageURL: "https://pixabay.com/get/sky_1280.jpg" })]
    });
    try {
      const url = await getDestinationPhotoUrl(
        activityPhotoQuery({ activity: "Skydiving", title, location: "Queenstown, New Zealand" }),
        "fallback.jpg"
      );
      expect(url).toBe("https://pixabay.com/get/sky_1280.jpg");
      expect(calls).toEqual([title, alt]);
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