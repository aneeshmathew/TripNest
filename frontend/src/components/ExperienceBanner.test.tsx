import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExperienceBanner from "./ExperienceBanner";

describe("ExperienceBanner", () => {
  it("renders the banner image from the local /public asset", () => {
    render(<ExperienceBanner />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/value-for-experience-banner.png");
  });

  it("has descriptive alt text (the banner's own text isn't otherwise accessible)", () => {
    render(<ExperienceBanner />);
    expect(screen.getByAltText(/the value for experience/i)).toBeInTheDocument();
  });
});
