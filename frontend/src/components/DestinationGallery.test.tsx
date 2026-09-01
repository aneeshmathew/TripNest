import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DestinationGallery from "./DestinationGallery";
import type { Listing } from "../types/listing";

const listings: Listing[] = [
  {
    id: "listing-1",
    title: "Eiffel View Loft",
    description: null,
    location: "Paris, France",
    continent: "EUROPE",
    price: 210,
    averageRating: 4.8,
    reviewCount: 12,
    imageUrl: "https://images.unsplash.com/photo-example-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "listing-2",
    title: "Shibuya Sky Suite",
    description: null,
    location: "Tokyo, Japan",
    continent: "ASIA",
    price: 190,
    averageRating: 4.0,
    reviewCount: 5,
    imageUrl: "https://images.unsplash.com/photo-example-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

describe("DestinationGallery", () => {
  it("links each item to its real listing detail page", () => {
    render(<DestinationGallery listings={listings} />);

    expect(screen.getByRole("link", { name: /Eiffel View Loft/i })).toHaveAttribute(
      "href",
      "/apartments/listing-1"
    );
    expect(screen.getByRole("link", { name: /Shibuya Sky Suite/i })).toHaveAttribute(
      "href",
      "/apartments/listing-2"
    );
  });

  it("shows each listing's location as a label", () => {
    render(<DestinationGallery listings={listings} />);
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
    expect(screen.getByText("Tokyo, Japan")).toBeInTheDocument();
  });

  it("renders nothing when there are no listings", () => {
    const { container } = render(<DestinationGallery listings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
