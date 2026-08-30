"use client";

import { useMemo } from "react";
import ApartmentList from "./ApartmentList";
import { useSort } from "../context/SortContext";
import type { Listing, SortDirection, SortOption } from "../types/listing";

function compareBy(option: SortOption, direction: SortDirection) {
  const factor = direction === "desc" ? -1 : 1;

  return (a: Listing, b: Listing) => {
    if (option === "Price") {
      return (a.price - b.price) * factor;
    }
    if (option === "Average Rating") {
      return (a.averageRating - b.averageRating) * factor;
    }
    return a.title.localeCompare(b.title) * factor;
  };
}

interface ListingsBrowserProps {
  initialListings: Listing[];
}

// Receives listings already fetched server-side (see app/page.tsx), so the
// full listing content is present in the initial server-rendered HTML —
// this component only adds client-side sorting on top of that, it doesn't
// re-fetch the data.
function ListingsBrowser({ initialListings }: ListingsBrowserProps) {
  const { sortOption, sortDirection } = useSort();

  const sortedListings = useMemo(() => {
    return [...initialListings].sort(compareBy(sortOption, sortDirection));
  }, [initialListings, sortOption, sortDirection]);

  return <ApartmentList apartments={sortedListings} />;
}

export default ListingsBrowser;
