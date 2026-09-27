import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FaqSection from "./FaqSection";

describe("FaqSection", () => {
  it("renders every FAQ question", () => {
    render(<FaqSection />);
    expect(screen.getByText("How do I book a stay on TripNest?")).toBeInTheDocument();
    expect(screen.getByText("Can I modify or cancel my booking?")).toBeInTheDocument();
    expect(screen.getByText("What is your cancellation policy?")).toBeInTheDocument();
    expect(screen.getByText("Do you offer 24/7 customer support?")).toBeInTheDocument();
    expect(screen.getByText("Are the prices per night or per person?")).toBeInTheDocument();
    expect(screen.getByText("What payment methods do you accept?")).toBeInTheDocument();
  });

  it("uses native details/summary elements, so no client JS is required", () => {
    const { container } = render(<FaqSection />);
    expect(container.querySelectorAll("details.faq-item")).toHaveLength(6);
    expect(container.querySelectorAll("summary.faq-question")).toHaveLength(6);
  });
});