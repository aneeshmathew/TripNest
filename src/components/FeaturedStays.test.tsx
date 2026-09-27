import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import FeaturedStays from "./FeaturedStays";
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
    title: "Table Mountain View House",
    description: null,
    location: "Cape Town, South Africa",
    continent: "AFRICA",
    price: 130,
    averageRating: 5,
    reviewCount: 1,
    imageUrl: "https://images.unsplash.com/photo-example-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FeaturedStays", () => {
  it("renders a card for every listing", () => {
    render(<FeaturedStays listings={listings} />);
    expect(screen.getByTestId(`apartment-card-${listings[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`apartment-card-${listings[1].id}`)).toBeInTheDocument();
  });

  it("renders Previous/Next controls that scroll the track", async () => {
    const scrollBySpy = vi.spyOn(HTMLElement.prototype, "scrollBy").mockImplementation(() => {});
    render(<FeaturedStays listings={listings} />);

    expect(screen.getByTestId("featured-stays-prev")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("featured-stays-next"));

    expect(scrollBySpy).toHaveBeenCalled();
  });

  it("renders nothing when there are no listings", () => {
    const { container } = render(<FeaturedStays listings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
