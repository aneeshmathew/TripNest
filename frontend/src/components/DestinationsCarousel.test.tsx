import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DestinationsCarousel from "./DestinationsCarousel";
import { natGeoDestinations } from "../data/natGeoDestinations";

describe("DestinationsCarousel", () => {
  it("renders a tile for all 25 Nat Geo destinations", () => {
    render(<DestinationsCarousel />);
    const tiles = screen.getAllByRole("link");
    expect(tiles).toHaveLength(25);
    expect(natGeoDestinations).toHaveLength(25);
  });

  it("links each tile to its real destination detail page", () => {
    render(<DestinationsCarousel />);
    expect(screen.getByTestId("destination-rio-de-janeiro-brazil")).toHaveAttribute(
      "href",
      "/destinations/rio-de-janeiro-brazil"
    );
  });
});
