import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DestinationGallery from "./DestinationGallery";
import { worldDestinations } from "../data/worldDestinations";
import { natGeoDestinations } from "../data/natGeoDestinations";

describe("DestinationGallery", () => {
  it("renders exactly the 50 world destinations", () => {
    render(<DestinationGallery />);
    expect(worldDestinations.length).toBe(50);
    expect(screen.getAllByTestId(/^gallery-destination-/)).toHaveLength(50);
  });

  it("doesn't repeat any of the 25 curated Nat Geo destinations shown in the top carousel", () => {
    const natGeoSlugs = new Set(natGeoDestinations.map((d) => d.slug));
    const overlap = worldDestinations.filter((d) => natGeoSlugs.has(d.slug));
    expect(overlap).toHaveLength(0);
  });

  it("links every tile straight to its /destinations/[slug] page, never /apartments", () => {
    render(<DestinationGallery />);
    const links = screen.getAllByTestId(/^gallery-destination-/);
    for (const link of links) {
      const href = link.getAttribute("href") ?? "";
      expect(href.startsWith("/destinations/")).toBe(true);
    }
  });

  it("links a well-known world destination to its detail page", () => {
    render(<DestinationGallery />);
    expect(screen.getByRole("link", { name: /Explore Paris/i })).toHaveAttribute(
      "href",
      "/destinations/paris-france"
    );
  });

  it("shows each destination's location as a label", () => {
    render(<DestinationGallery />);
    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Peru")).toBeInTheDocument();
  });

  it("has previous/next navigation buttons for browsing the full list", () => {
    render(<DestinationGallery />);
    expect(screen.getByTestId("gallery-carousel-prev")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-carousel-next")).toBeInTheDocument();
  });

  it("has exactly 5 pagination dots for jumping to a section of the list", () => {
    render(<DestinationGallery />);
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`gallery-dot-${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId("gallery-dot-5")).not.toBeInTheDocument();
  });

  it("marks the first dot active by default", () => {
    render(<DestinationGallery />);
    expect(screen.getByTestId("gallery-dot-0")).toHaveAttribute("aria-selected", "true");
  });
});
