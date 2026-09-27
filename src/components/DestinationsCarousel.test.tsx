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

  it("renders a hidden duplicate set of tiles for seamless looping, excluded from the accessibility tree", () => {
    const { container } = render(<DestinationsCarousel />);
    // 25 real + 25 hidden clones = 50 in the DOM...
    expect(container.querySelectorAll(".destination-tile")).toHaveLength(50);
    // ...but role queries (what screen readers/testing-library see) only
    // find the 25 real ones, since the clones are aria-hidden.
    expect(screen.getAllByRole("link")).toHaveLength(25);
  });

  it("snaps back seamlessly once scrolled past one full set width, instead of visibly resetting to the start", () => {
    vi.useFakeTimers();
    const scrollToSpy = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => {});
    const { container } = render(<DestinationsCarousel />);

    const track = container.querySelector(".destinations-carousel") as HTMLDivElement;
    const fallbackStep = 216; // jsdom has no layout, so offsetWidth is always 0 and the fallback kicks in
    // Simulate having scrolled exactly one full set's width into the
    // (visually identical) cloned second copy.
    track.scrollLeft = fallbackStep * natGeoDestinations.length;

    vi.advanceTimersByTime(2000);

    // Snapped back to the equivalent position in the real first copy...
    expect(track.scrollLeft).toBe(0);
    // ...then continued the normal forward step from there, rather than
    // stopping dead at the reset point.
    expect(scrollToSpy).toHaveBeenCalledWith({ left: fallbackStep, behavior: "smooth" });
  });
});
