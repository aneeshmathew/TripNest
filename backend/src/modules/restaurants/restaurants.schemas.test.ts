import { describe, expect, it } from "vitest";
import { restaurantsQuerySchema } from "./restaurants.schemas.js";

describe("restaurantsQuerySchema", () => {
  it("treats empty-string query params as unset", () => {
    expect(restaurantsQuerySchema.parse({ search: "", continent: "", cuisine: "" })).toEqual({});
  });

  it("trims a non-empty cuisine filter", () => {
    expect(restaurantsQuerySchema.parse({ cuisine: "  Japanese  " }).cuisine).toBe("Japanese");
  });

  it("rejects an unrecognized continent value", () => {
    expect(() => restaurantsQuerySchema.parse({ continent: "MOON" })).toThrow();
  });
});
