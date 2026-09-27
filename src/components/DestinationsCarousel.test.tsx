import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DestinationsCarousel, { type DestinationTileData } from "./DestinationsCarousel";

// jsdom has no real layout engine, so scrollTo is stubbed a no-op already
// (see vitest.setup.tsx) and clientWidth is always 0 — these spies let us
// assert the component *calls* scrollTo (and how often/with what page
// math), not that scroll position visibly moves.
afterEach(() => {
  vi.restoreAllMocks();
});

// A small synthetic dataset (8 destinations, so 8/6 = 2 pages with one
// partial page) rather than a real curated data file — this component
// takes destinations as a plain prop, so unit-testing it against a fixed
// fixture keeps these tests from breaking again the next time the real
// destinations list (or which curated list feeds the homepage) changes.
function makeDestinations(count: number): DestinationTileData[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `destination-${i}`,
    name: `Destination ${i}`,
    location: `Country ${i}`,
    imageUrl: `https://example.com/${i}.jpg`,
    fallbackImageUrl: `https://example.com/${i}-fallback.jpg`
  }));
}

describe("DestinationsCarousel", () => {
  it("renders a tile for every destination provided", () => {
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);
    expect(screen.getAllByRole("link")).toHaveLength(8);
  });

  it("links each tile to its real destination detail page", () => {
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);
    expect(screen.getByTestId("destination-destination-3")).toHaveAttribute(
      "href",
      "/destinations/destination-3"
    );
  });

  it("renders Previous/Next controls", () => {
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);
    expect(screen.getByTestId("destinations-carousel-prev")).toBeInTheDocument();
    expect(screen.getByTestId("destinations-carousel-next")).toBeInTheDocument();
  });

  it("clicking Next scrolls the track to the next page", async () => {
    const scrollToSpy = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => {});
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);

    await userEvent.click(screen.getByTestId("destinations-carousel-next"));

    expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  it("clicking Previous on the first page wraps around to the last page", async () => {
    const scrollToSpy = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => {});
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);

    // 8 destinations / 6 per page = 2 pages; wrapping back from page 0
    // should land on page 1 (the last page), not go negative.
    await userEvent.click(screen.getByTestId("destinations-carousel-prev"));

    expect(screen.getByTestId("destinations-dot-1")).toHaveAttribute("aria-selected", "true");
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it("renders one dot per page, with the first page active by default", () => {
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);
    expect(screen.getByTestId("destinations-dot-0")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("destinations-dot-1")).toHaveAttribute("aria-selected", "false");
    expect(screen.queryByTestId("destinations-dot-2")).not.toBeInTheDocument();
  });

  it("clicking a dot jumps straight to that page", async () => {
    const scrollToSpy = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => {});
    render(<DestinationsCarousel destinations={makeDestinations(8)} />);

    await userEvent.click(screen.getByTestId("destinations-dot-1"));

    expect(screen.getByTestId("destinations-dot-1")).toHaveAttribute("aria-selected", "true");
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it("renders no page dots at all when everything fits on one page", () => {
    render(<DestinationsCarousel destinations={makeDestinations(6)} />);
    expect(screen.queryByTestId("destinations-dot-0")).not.toBeInTheDocument();
  });

  it("renders nothing when given an empty destinations list", () => {
    const { container } = render(<DestinationsCarousel destinations={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});