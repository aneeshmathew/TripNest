import Link from "next/link";
import { Building2, Compass, Hotel as HotelIcon, UtensilsCrossed } from "lucide-react";

// Replaces the "sometimes a real photo, sometimes an empty box" slot that
// used to live here (see EasyToUseSection's git history) with something
// that's useful either way: four real links into the four kinds of
// content the app actually has, rather than a screenshot-style mockup
// (checklists, stock photos of travelers, fake map pins) standing in for
// features that don't exist — the "no fabricated content" rule the rest
// of the app follows (see README, Destinations/Activities sections)
// applies here too. No "Driving"/"Flights"/"Meals" tiles for the same
// reason: TripNest doesn't do those (yet).
//
// Each tile links to a standalone, search-ready page (app/apartments,
// app/hotels, app/restaurants, app/activities) — the same
// keyword-search-replaces-default pattern, and the same tab name, as the
// Apartments/Hotels/Restaurants/Activities tabs on /destinations/[slug],
// just without a destination pre-selected. Previously "Apartments" linked
// to "/" (the marketing homepage, not search-ready) and "Activities"
// anchor-scrolled to the homepage carousel instead of a real page.
const CATEGORIES = [
  {
    label: "Apartments",
    description: "Browse & search stays",
    href: "/apartments",
    icon: Building2
  },
  {
    label: "Hotels",
    description: "Browse & search hotels",
    href: "/hotels",
    icon: HotelIcon
  },
  {
    label: "Restaurants",
    description: "Browse & search dining",
    href: "/restaurants",
    icon: UtensilsCrossed
  },
  {
    label: "Activities",
    description: "Find things to do",
    href: "/activities",
    icon: Compass
  }
];

function ExploreCategories() {
  return (
    <nav className="explore-categories" aria-label="Browse by category">
      {CATEGORIES.map(({ label, description, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="explore-category-tile"
          data-testid={`explore-${label.toLowerCase()}`}
        >
          <Icon size={26} aria-hidden="true" />
          <span className="explore-category-label">{label}</span>
          <span className="explore-category-description">{description}</span>
        </Link>
      ))}
    </nav>
  );
}

export default ExploreCategories;
