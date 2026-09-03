import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DestinationsCarousel from "./DestinationsCarousel";
import { natGeoDestinations } from "../data/natGeoDestinations";

// jsdom has no real layout engine, so scrollTo/scrollBy are stubbed
// no-ops there already — these spies just let us assert the component
// *calls* them (and how often), not that scroll position actually moves.
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

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

  it("renders Previous/Next controls", () => {
    render(<DestinationsCarousel />);
    expect(screen.getByTestId("destinations-carousel-prev")).toBeInTheDocument();
    expect(screen.getByTestId("destinations-carousel-next")).toBeInTheDocument();
  });

  it("clicking Next scrolls the track forward", async () => {
    const scrollBySpy = vi.spyOn(HTMLElement.prototype, "scrollBy").mockImplementation(() => {});
    render(<DestinationsCarousel />);

    await userEvent.click(screen.getByTestId("destinations-carousel-next"));

    expect(scrollBySpy).toHaveBeenCalled();
  });

  it("auto-advances every 2 seconds", () => {
    vi.useFakeTimers();
    const scrollToSpy = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => {});
    render(<DestinationsCarousel />);

    vi.advanceTimersByTime(2000);
    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(scrollToSpy).toHaveBeenCalledTimes(2);
  });
});
