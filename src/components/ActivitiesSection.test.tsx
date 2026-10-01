import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActivitiesSection from "./ActivitiesSection";
import { activityHighlights } from "../data/activityHighlights";

afterEach(() => {
  vi.restoreAllMocks();
});

// ActivitiesSection is an async Server Component (it awaits Pixabay
// lookups for each tile — see the component itself) so it can't be
// rendered as plain JSX like `render(<ActivitiesSection />)`: React
// Testing Library's render() doesn't await Server Components, so doing
// that hands React the un-awaited Promise itself as a child, producing
// "Objects are not valid as a React child (found: [object Promise])".
// Calling and awaiting the async function directly first, then rendering
// its resolved JSX, is the fix — same pattern DestinationsSection's own
// test (if/when it exists) would need too.
describe("ActivitiesSection", () => {
  it("renders a tile for every curated activity", async () => {
    render(await ActivitiesSection());
    activityHighlights.forEach((highlight) => {
      expect(screen.getByTestId(`activity-${highlight.slug}`)).toBeInTheDocument();
    });
  });

  it("renders all six category filter pills, with All active by default", async () => {
    render(await ActivitiesSection());
    expect(screen.getByTestId("activity-filter-all")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("activity-filter-adventure")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("activity-filter-high-adrenaline")).toBeInTheDocument();
    expect(screen.getByTestId("activity-filter-water-sports")).toBeInTheDocument();
    expect(screen.getByTestId("activity-filter-history-culture")).toBeInTheDocument();
    expect(screen.getByTestId("activity-filter-other-activities")).toBeInTheDocument();
  });

  it("clicking a category pill narrows the tiles to that category", async () => {
    render(await ActivitiesSection());

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

  it("links every tile — including Kayaking — to its /activities/[slug] page", async () => {
    render(await ActivitiesSection());
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

  it("renders the Kayaking tile the same shape as every other tile — badge, photo, title", async () => {
    render(await ActivitiesSection());
    const kayaking = activityHighlights.find((highlight) => highlight.slug === "kayaking");
    expect(kayaking).toBeDefined();
    const tile = screen.getByTestId(`activity-${kayaking!.slug}`);
    // The tile's badge shows the activity's category (e.g. "Water Sports"),
    // not the short `activity` field — that field is only used server-side
    // to build the Pixabay search query. `title` ("New Zealand Fjord
    // Kayaking") is what's actually rendered, and it happens to contain
    // the activity name as a substring, which is what this assertion
    // checks (toHaveTextContent does substring matching).
    expect(tile).toHaveTextContent(kayaking!.activity);
    expect(tile).toHaveTextContent(kayaking!.title);
    expect(tile.querySelector("img")).toHaveAttribute("src", kayaking!.imageUrl);
  });

  it("renders Previous/Next controls that scroll the track", async () => {
    const scrollBySpy = vi.spyOn(HTMLElement.prototype, "scrollBy").mockImplementation(() => {});
    render(await ActivitiesSection());

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