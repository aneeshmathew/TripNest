import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RestaurantCard from "./RestaurantCard";
import type { Restaurant } from "../types/hospitality";

const baseRestaurant: Restaurant = {
  id: "r1",
  name: "Test Bistro",
  description: null,
  location: "Testville, Testland",
  continent: "EUROPE",
  cuisine: "French",
  priceRange: 3,
  rating: 4.5,
  imageUrl: "https://example.com/photo.jpg",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
};

describe("RestaurantCard", () => {
  it("shows the curated rating as stars plus a number", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("labels the rating as curated, not a guest review average, for assistive tech", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByLabelText(/4\.5 out of 5 \(curated rating\)/i)).toBeInTheDocument();
  });

  it("still shows cuisine and price range", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText(/French/)).toBeInTheDocument();
    expect(screen.getByText(/\$\$\$/)).toBeInTheDocument();
  });
});
