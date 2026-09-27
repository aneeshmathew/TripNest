import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TripIllustrationBanner from "./TripIllustrationBanner";

describe("TripIllustrationBanner", () => {
  it("renders the illustration from the local /public asset, decoratively", () => {
    const { container } = render(<TripIllustrationBanner />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/images/trip-illustration-banner.jpg");
    expect(img).toHaveAttribute("alt", "");
  });

  it("shows real, accessible heading text over the image (not baked into the image itself)", () => {
    render(<TripIllustrationBanner />);
    expect(screen.getByRole("heading", { name: "The Value For Experience" })).toBeInTheDocument();
    expect(screen.getByText(/Relax… You're with us! We make it simple\./)).toBeInTheDocument();
  });
});
