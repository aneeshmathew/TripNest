import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StarRating from "./StarRating";

describe("StarRating", () => {
  it("fills the number of stars matching the rounded rating", () => {
    const { container } = render(<StarRating rating={4.2} />);
    expect(container.querySelectorAll(".star.filled")).toHaveLength(4);
  });

  it("rounds up when the rating is closer to the next star", () => {
    const { container } = render(<StarRating rating={4.6} />);
    expect(container.querySelectorAll(".star.filled")).toHaveLength(5);
  });

  it("exposes the rating in an accessible label", () => {
    render(<StarRating rating={3.5} />);
    expect(screen.getByLabelText("3.5 out of 5 stars")).toBeInTheDocument();
  });
});
