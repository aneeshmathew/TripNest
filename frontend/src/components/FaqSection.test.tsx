import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FaqSection from "./FaqSection";

describe("FaqSection", () => {
  it("renders every FAQ question", () => {
    render(<FaqSection />);
    expect(screen.getByText("How do I find a place to stay?")).toBeInTheDocument();
    expect(screen.getByText("Do I need an account to browse listings?")).toBeInTheDocument();
    expect(screen.getByText("How does the rating system work?")).toBeInTheDocument();
    expect(
      screen.getByText("Can I leave more than one review for the same place?")
    ).toBeInTheDocument();
  });

  it("uses native details/summary elements, so no client JS is required", () => {
    const { container } = render(<FaqSection />);
    expect(container.querySelectorAll("details.faq-item")).toHaveLength(4);
    expect(container.querySelectorAll("summary.faq-question")).toHaveLength(4);
  });
});
