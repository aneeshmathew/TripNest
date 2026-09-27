import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ApartmentCard from "./ApartmentCard";
import type { Listing } from "../types/listing";

const listing: Listing = {
  id: "listing-1",
  title: "Eiffel View Loft",
  description: null,
  location: "Paris, France",
  continent: "EUROPE",
  price: 210,
  averageRating: 4.8,
  reviewCount: 12,
  imageUrl: "https://images.unsplash.com/photo-example",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("ApartmentCard", () => {
  it("renders the listing's title, location, price, and rating", () => {
    render(<ApartmentCard apartment={listing} />);

    expect(screen.getByText("Eiffel View Loft")).toBeInTheDocument();
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
    expect(screen.getByText("$210 / night")).toBeInTheDocument();
    expect(screen.getByText("4.8 (12)")).toBeInTheDocument();
  });

  it("makes the whole card a link to the listing's detail page", () => {
    render(<ApartmentCard apartment={listing} />);
    expect(screen.getByTestId("apartment-card-listing-1")).toHaveAttribute(
      "href",
      "/apartments/listing-1"
    );
  });

  it("still shows a View details affordance within the card", () => {
    render(<ApartmentCard apartment={listing} />);
    expect(screen.getByText("View details")).toBeInTheDocument();
  });
});
