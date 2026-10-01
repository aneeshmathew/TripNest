import { describe, expect, it } from "vitest";
import {
  containsBlockedTerm,
  pickBestPhoto,
  queryKeywords,
  scorePhoto,
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
  it("rejects a photo that only matches a generic word of the query", () => {
    // 1 of 2 keywords = 0.5, below the 0.6 bar.
    expect(scorePhoto(hit({ tags: "italy, pizza, food" }), "Dolomites Italy")).toBe(-1);
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
