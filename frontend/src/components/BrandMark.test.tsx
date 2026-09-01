import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BrandMark from "./BrandMark";

describe("BrandMark", () => {
  it("renders Trip and Nest as separately colored spans", () => {
    render(<BrandMark />);
    const trip = screen.getByText("Trip");
    const nest = screen.getByText("Nest");
    expect(trip).toHaveClass("brand-word-primary");
    expect(nest).toHaveClass("brand-word-secondary");
  });
});
