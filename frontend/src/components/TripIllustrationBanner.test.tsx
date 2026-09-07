import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TripIllustrationBanner from "./TripIllustrationBanner";

describe("TripIllustrationBanner", () => {
  it("renders the illustration from the local /public asset", () => {
    const { container } = render(<TripIllustrationBanner />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/images/trip-illustration-banner.jpg");
    expect(img).toHaveAttribute("alt", "");
  });
});
