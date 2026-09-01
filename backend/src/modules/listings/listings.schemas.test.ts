import { describe, expect, it } from "vitest";
import { listingsQuerySchema } from "./listings.schemas.js";

describe("listingsQuerySchema", () => {
  it("treats empty-string query params as unset", () => {
    const result = listingsQuerySchema.parse({
      search: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      continent: ""
    });
    expect(result).toEqual({});
  });

  it("coerces numeric strings from the query string", () => {
    const result = listingsQuerySchema.parse({ minPrice: "100", maxPrice: "250", minRating: "4" });
    expect(result).toEqual({ minPrice: 100, maxPrice: 250, minRating: 4 });
  });

  it("trims a non-empty search term", () => {
    const result = listingsQuerySchema.parse({ search: "  paris  " });
    expect(result.search).toBe("paris");
  });

  it("rejects a minRating above 5", () => {
    expect(() => listingsQuerySchema.parse({ minRating: "6" })).toThrow();
  });

  it("rejects a negative minPrice", () => {
    expect(() => listingsQuerySchema.parse({ minPrice: "-10" })).toThrow();
  });

  it("accepts a valid continent enum value", () => {
    const result = listingsQuerySchema.parse({ continent: "EUROPE" });
    expect(result.continent).toBe("EUROPE");
  });

  it("rejects an unrecognized continent value", () => {
    expect(() => listingsQuerySchema.parse({ continent: "ANTARCTICA" })).toThrow();
  });
});
