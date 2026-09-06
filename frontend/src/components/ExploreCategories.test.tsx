import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExploreCategories from "./ExploreCategories";

describe("ExploreCategories", () => {
  it("renders exactly the four real categories the app supports", () => {
    render(<ExploreCategories />);
    expect(screen.getByTestId("explore-apartments")).toBeInTheDocument();
    expect(screen.getByTestId("explore-hotels")).toBeInTheDocument();
    expect(screen.getByTestId("explore-restaurants")).toBeInTheDocument();
    expect(screen.getByTestId("explore-activities")).toBeInTheDocument();
    // No tiles for features TripNest doesn't have (driving, flights, meals).
    expect(screen.queryByText(/flights/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/driving/i)).not.toBeInTheDocument();
  });

  it("links each tile to a real, working route", () => {
    render(<ExploreCategories />);
    expect(screen.getByTestId("explore-apartments")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("explore-hotels")).toHaveAttribute("href", "/hotels");
    expect(screen.getByTestId("explore-restaurants")).toHaveAttribute("href", "/restaurants");
    expect(screen.getByTestId("explore-activities")).toHaveAttribute("href", "/#trip-inspiration");
  });
});
