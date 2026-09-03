import { describe, expect, it } from "vitest";
import { hotelsQuerySchema } from "./hotels.schemas.js";

describe("hotelsQuerySchema", () => {
  it("treats empty-string query params as unset", () => {
    expect(hotelsQuerySchema.parse({ search: "", continent: "", minPrice: "", maxPrice: "" })).toEqual(
      {}
    );
  });

  it("coerces numeric price params", () => {
    const result = hotelsQuerySchema.parse({ minPrice: "100", maxPrice: "400" });
    expect(result).toEqual({ minPrice: 100, maxPrice: 400 });
  });

  it("accepts a valid continent enum value", () => {
    expect(hotelsQuerySchema.parse({ continent: "ASIA" }).continent).toBe("ASIA");
  });

  it("rejects an unrecognized continent value", () => {
    expect(() => hotelsQuerySchema.parse({ continent: "MOON" })).toThrow();
  });
});
