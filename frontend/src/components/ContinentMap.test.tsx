import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContinentMap from "./ContinentMap";

describe("ContinentMap", () => {
  it("renders a link for each of the 6 continents", () => {
    render(<ContinentMap />);
    expect(screen.getByTestId("continent-NORTH_AMERICA")).toHaveAttribute(
      "href",
      "/?continent=NORTH_AMERICA"
    );
    expect(screen.getByTestId("continent-SOUTH_AMERICA")).toHaveAttribute(
      "href",
      "/?continent=SOUTH_AMERICA"
    );
    expect(screen.getByTestId("continent-EUROPE")).toHaveAttribute("href", "/?continent=EUROPE");
    expect(screen.getByTestId("continent-AFRICA")).toHaveAttribute("href", "/?continent=AFRICA");
    expect(screen.getByTestId("continent-ASIA")).toHaveAttribute("href", "/?continent=ASIA");
    expect(screen.getByTestId("continent-OCEANIA")).toHaveAttribute("href", "/?continent=OCEANIA");
  });

  it("marks the selected continent and shows a clear-region link", () => {
    render(<ContinentMap selected="ASIA" />);
    expect(screen.getByTestId("continent-ASIA")).toHaveClass("selected");
    expect(screen.getByTestId("continent-NORTH_AMERICA")).not.toHaveClass("selected");
    expect(screen.getByTestId("clear-continent-link")).toBeInTheDocument();
  });

  it("hides the clear-region link when nothing is selected", () => {
    render(<ContinentMap />);
    expect(screen.queryByTestId("clear-continent-link")).not.toBeInTheDocument();
  });
});
