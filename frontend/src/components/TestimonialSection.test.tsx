import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TestimonialSection from "./TestimonialSection";
import type { FeaturedReview } from "../types/review";

const review: FeaturedReview = {
  id: "review-1",
  listingId: "listing-1",
  userId: "user-1",
  rating: 5,
  cleanliness: null,
  service: null,
  value: null,
  location: null,
  title: "Amazing stay",
  body: "Would book again in a heartbeat.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  user: { id: "user-1", name: "Jane Doe" },
  photos: [],
  listing: { id: "listing-1", title: "Eiffel View Loft", location: "Paris, France" }
};

describe("TestimonialSection", () => {
  it("renders the review body, author, and links to the real listing", () => {
    render(<TestimonialSection reviews={[review]} />);

    expect(screen.getByText(/Would book again in a heartbeat\./)).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Eiffel View Loft" })).toHaveAttribute(
      "href",
      "/apartments/listing-1"
    );
  });

  it("renders nothing when there are no featured reviews yet", () => {
    const { container } = render(<TestimonialSection reviews={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
