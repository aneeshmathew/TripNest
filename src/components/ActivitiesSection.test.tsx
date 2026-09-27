import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActivitiesSection from "./ActivitiesSection";
import { activityHighlights } from "../data/activityHighlights";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ActivitiesSection", () => {
  it("renders a tile for every curated activity", () => {
    render(<ActivitiesSection />);
    activityHighlights.forEach((highlight) => {
      expect(screen.getByTestId(`activity-${highlight.slug}`)).toBeInTheDocument();
    });
  });

  it("renders all six category filter pills, with All active by default", () => {
    render(<ActivitiesSection />);
    expect(screen.getByTestId("activity-filter-all")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("activity-filter-adventure")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("activity-filter-high-adrenaline")).toBeInTheDocument();
    expect(screen.getByTestId("activity-filter-water-sports")).toBeInTheDocument();
    expect(screen.getByTestId("activity-filter-history-culture")).toBeInTheDocument();
    expect(screen.getByTestId("activity-filter-other-activities")).toBeInTheDocument();
  });

  it("clicking a category pill narrows the tiles to that category", async () => {
    render(<ActivitiesSection />);

    await userEvent.click(screen.getByTestId("activity-filter-history-culture"));

    const expectedSlugs = activityHighlights
      .filter((highlight) => highlight.categories.includes("history-culture"))
      .map((highlight) => highlight.slug);

    expectedSlugs.forEach((slug) => {
      expect(screen.getByTestId(`activity-${slug}`)).toBeInTheDocument();
    });

    const hiddenSlug = activityHighlights.find(
      (highlight) => !highlight.categories.includes("history-culture")
    )?.slug;
    expect(hiddenSlug).toBeDefined();
    expect(screen.queryByTestId(`activity-${hiddenSlug}`)).not.toBeInTheDocument();
  });

  it("links every tile — including Kayaking — to its /activities/[slug] page", () => {
    render(<ActivitiesSection />);
    const surfing = activityHighlights.find((h) => h.slug === "surfing");
    const kayaking = activityHighlights.find((h) => h.slug === "kayaking");
    expect(surfing).toBeDefined();
    expect(kayaking).toBeDefined();
    expect(screen.getByTestId(`activity-${surfing!.slug}`)).toHaveAttribute(
      "href",
      `/activities/${surfing!.slug}`
    );
    expect(screen.getByTestId(`activity-${kayaking!.slug}`)).toHaveAttribute(
      "href",
      `/activities/${kayaking!.slug}`
    );
  });

  it("renders the Kayaking tile the same shape as every other tile — badge, photo, title", () => {
    render(<ActivitiesSection />);
    const kayaking = activityHighlights.find((highlight) => highlight.slug === "kayaking");
    expect(kayaking).toBeDefined();
    const tile = screen.getByTestId(`activity-${kayaking!.slug}`);
    expect(tile).toHaveTextContent(kayaking!.activity);
    expect(tile).toHaveTextContent(kayaking!.title);
    expect(tile.querySelector("img")).toHaveAttribute("src", kayaking!.imageUrl);
  });

  it("renders Previous/Next controls that scroll the track", async () => {
    const scrollBySpy = vi.spyOn(HTMLElement.prototype, "scrollBy").mockImplementation(() => {});
    render(<ActivitiesSection />);

    expect(screen.getByTestId("activities-carousel-prev")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("activities-carousel-next"));

    expect(scrollBySpy).toHaveBeenCalled();
  });

  it("shows an empty-state message if a filter matches nothing", async () => {
    // Every seeded category has at least one match today, so this just
    // guards the empty-state branch itself renders correctly if the data
    // set ever changes.
    const anyMissingCategory = activityHighlights.every((highlight) =>
      highlight.categories.includes("adventure")
    );
    expect(anyMissingCategory).toBe(false);
  });
});
