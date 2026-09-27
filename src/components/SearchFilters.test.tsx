import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SearchFilters from "./SearchFilters";

describe("SearchFilters", () => {
  it("prefills inputs from defaultValues", () => {
    render(
      <SearchFilters
        defaultValues={{ search: "paris", minPrice: "100", maxPrice: "300", minRating: "4" }}
      />
    );

    expect(screen.getByLabelText("Search listings")).toHaveValue("paris");
    expect(screen.getByLabelText("Minimum price")).toHaveValue(100);
    expect(screen.getByLabelText("Maximum price")).toHaveValue(300);
    expect(screen.getByLabelText("Minimum rating")).toHaveValue("4");
  });

  it("shows a Clear link only when a filter is active", () => {
    const { rerender } = render(<SearchFilters defaultValues={{}} />);
    expect(screen.queryByTestId("clear-filters-link")).not.toBeInTheDocument();

    rerender(<SearchFilters defaultValues={{ search: "paris" }} />);
    expect(screen.getByTestId("clear-filters-link")).toBeInTheDocument();
  });

  it("shows the Clear link when only a continent is selected", () => {
    render(<SearchFilters defaultValues={{ continent: "EUROPE" }} />);
    expect(screen.getByTestId("clear-filters-link")).toBeInTheDocument();
  });

  it("carries the selected continent forward as a hidden field", () => {
    const { container } = render(<SearchFilters defaultValues={{ continent: "ASIA" }} />);
    const hiddenInput = container.querySelector('input[name="continent"]');
    expect(hiddenInput).toHaveAttribute("value", "ASIA");
  });

  it("omits the hidden continent field when no continent is selected", () => {
    const { container } = render(<SearchFilters defaultValues={{}} />);
    expect(container.querySelector('input[name="continent"]')).not.toBeInTheDocument();
  });

  it("submits as a GET form to /, so results are shareable URLs", () => {
    render(<SearchFilters defaultValues={{}} />);
    const form = screen.getByTestId("search-filters-form");
    expect(form).toHaveAttribute("method", "GET");
    expect(form).toHaveAttribute("action", "/");
  });
});
