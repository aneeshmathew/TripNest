# TripNest — Product & Engineering Plan

TripNest is a travel discovery platform: browse listings (stays, and eventually restaurants/attractions), read and leave reviews, search and filter by location and preferences, and book. This document is the living plan — architecture, tech stack, and roadmap — for building it out.

---

## 1. Architecture

### Frontend

**Stack**: React 18 + TypeScript, built with Next.js (App Router) for SSR/ISR. Listing browse and detail pages are Server Components, so content is present in the initial HTML for search engines rather than fetched client-side after hydration.

**Routing (`src/app/`)**
- `page.tsx` (home) and `apartments/[id]/page.tsx` (listing detail) are async Server Components that fetch data server-side.
- `page.tsx` reads filters from `searchParams` (`?search=&minPrice=&maxPrice=&minRating=`), so search results are shareable/bookmarkable URLs rather than client-side-only state.
- `apartments/[id]/page.tsx` also exports `generateMetadata` (per-listing title/description/OG tags) and `generateStaticParams` (pre-renders a page per listing, refreshed via ISR).

**Data fetching**
- `src/lib/listings.ts` — server-only listings fetching (accepts the same filters as searchParams, forwarded as query params to the backend), 60s `revalidate` (ISR) per filter combination. Also exposes `getFeaturedListings` (fetches all, sorts by rating client-side — no dedicated backend endpoint yet, fine at the current catalog size) for the homepage's Featured Stays row.
- `src/lib/reviews.ts` — server-only reviews fetching, uncached (`cache: "no-store"`) so a new/edited/deleted review shows up immediately rather than waiting out a revalidation window. Also exposes `getFeaturedReviews` (5-minute ISR — staleness matters less for marketing content than for "did my review save") for the homepage testimonials.
- `src/api/` — client-only API layer for auth and review mutations: `client.ts` wraps `fetch`, attaches the JWT access token, and transparently retries once via `/api/auth/refresh` on a 401; plus `auth.ts`, `reviews.ts`, `tokenStorage.ts`.

**State**: `src/context/` holds `AuthProvider` (current user, login/logout) and `ThemeProvider` (light/dark theme), both client-side.

**Key components (`src/components/`)**
- `AppShell` — the one client boundary wrapping the whole app (`ThemeProvider` + `AuthProvider` + `Navbar` + `Footer`).
- `SearchFilters` — a plain server-rendered GET form (no client JS) that drives the search/filter URLs above.
- `ApartmentCard` — a single `<Link>`; the whole card is clickable through to the listing detail page, not just a "View details" sub-link.
- `ApartmentList` — stays server-renderable end to end.
- `LoginForm` — handles login.
- `SettingsForm` — holds the theme toggle (moved off the navbar onto its own `/settings` page).
- `ReviewsSection` / `ReviewItem` / `ReviewForm` / `StarRating` / `StarRatingInput` — review display, submission, and inline edit/delete for the review's own author.
- `BrandMark` — the shared logo (icon + two-tone "TripNest" wordmark), used in both `Navbar` and `Footer`.

**Home page (`/`)** has two distinct states, not layered on top of each other:
- No active search/filter → full marketing front door: `Hero`, `DestinationsSection`, `ActivitiesSection`, `FeaturedStays`, `EasyToUseSection`, `RecommendationsSection`, `FaqSection`, `TestimonialSection`, `DestinationGallery`.
- Active search/filter → those marketing sections are dropped in favor of a focused `SearchFilters` + results view. This is still real, working code, but as of the "Plan your trip" flow below, it's only reachable directly via `/?search=...` — nothing in the UI links here anymore (Hero used to). That's a real, known gap worth revisiting: there's currently no in-UI path to a plain, unfiltered "browse/filter every apartment" view, the same way `/hotels`/`/restaurants` provide for those two types.
- A few front-door sections use real data: `FeaturedStays` (real top-rated listings), `TestimonialSection` (real reviews via `GET /api/reviews/featured`), `DestinationGallery` (real listing photos linking to real listing pages).
- `EasyToUseSection`'s visual slot is `ExploreCategories` — four real navigation tiles (Apartments → `/`, Hotels → `/hotels`, Restaurants → `/restaurants`, Activities → `/#trip-inspiration`) rather than a photo or a decorative mockup. Previously this slot showed a real listing's photo when one existed and an empty box otherwise (`EasyToUseSection` took a `visualListing` prop for this) — replaced because a single random apartment photo didn't actually illustrate "search across categories" any better than real links to those categories do, and the empty-box case looked broken. `/hotels` and `/restaurants` (plain `getHotels()`/`getRestaurants()` with no keyword, plus the same tab-search-form pattern as the destination/activity tabs) are new — there was previously no way to browse all hotels/restaurants outside a specific destination or activity's tab.
- `RecommendationsSection` is explicitly illustrative marketing copy for a feature that doesn't exist yet (a recommendation engine) — not fabricated data pretending to be real. (A similar "Plan trips together" section existed briefly but was removed — group planning isn't a direction TripNest is pursuing right now.)
- `FaqSection` uses native `<details>`/`<summary>` (zero client JS) with real answers about how TripNest actually works.

**Destinations**
- `DestinationsSection` / `DestinationsCarousel` show `data/natGeoDestinations.ts` — a static, curated list of National Geographic's real "Best of the World 2026" destinations (verified against the actual published list; descriptions are written in our own words). This is editorial content, not TripNest's own data — neither the homepage carousel nor the individual `/destinations/[slug]` pages show an on-page attribution link anymore (both removed by request); `NAT_GEO_SOURCE_URL` is kept in `data/natGeoDestinations.ts` as a provenance record even though nothing renders it now.
- Images are hotlinked Unsplash URLs (same caveat as the Platform concerns note on image storage below) — each was spot-checked against a real, currently-live Unsplash photo when added, but a hotlinked URL can still break later if the source photo is ever removed; a broken destination image is a sign to re-verify its URL, not necessarily a code bug.
- Clicking a tile goes to `/destinations/[slug]` (`generateStaticParams` pre-renders all 25) — a tabbed page (Apartments/Hotels/Restaurants/Reviews, URL-driven via `?tab=`) built entirely from **our own** real listings/hotels/restaurants/reviews filtered by that destination's name.
- Apartments/Hotels/Restaurants each have their own inline search box (`.tab-search-form`, placeholder "Search for `<Tab>` nearby here") that replaces the destination's name with whatever the visitor types, rather than combining the two — the backend's search endpoints only take one keyword. Reviews has no search box and always uses the destination's name.
- All 25 Nat Geo destinations now have real seed coverage (an apartment, a hotel, and a restaurant each — see `backend/prisma/seed.ts`'s `destinationSeeds`), so tabs show real content rather than the honest-empty-state fallback that used to be the common case. That fallback is still real code, not deleted — a search with no matches (via the per-tab search box) still shows it, same as any other unmatched search.
- The Hero search input's `<datalist>` offers the same 25 names as autocomplete suggestions, while still accepting any free-text location.
- `DestinationsCarousel` is a client component (the one piece of the destinations UI that genuinely needs JS): auto-advances one tile every 2s, pauses on hover/focus, and has Prev/Next buttons for manual control (an auto-only carousel with no pause/manual override is a real accessibility problem).
- Looping is a true circular wrap, not a visible jump back to the start: the tile set renders twice (the second copy is `aria-hidden`/unfocusable — visual filler only, excluded from the accessibility tree), and once `scrollLeft` passes one full set's width, it's snapped back by that width instantly and at rest between animations. Since the two copies are pixel-identical, the snap is imperceptible.
- Tile width is a computed `flex-basis` (`calc((100% - (N-1)*gap)/N)`, `N` = `--carousel-visible`), not a fixed px value — this is what makes exactly N tiles fit edge-to-edge with no partial tile cut off. `N` steps down at each breakpoint (5 → 4 → 3 → 2 → 1) so the same math holds at every screen size.

**Activities ("Trip Inspiration")**
- `ActivitiesSection` shows `data/activityHighlights.ts` — a static, curated set of activity types (Hiking, Surfing, Rock Climbing, History & Culture spots, etc.), each tagged with one or more of five categories (Adventure, High Adrenaline, Water Sports, History & Culture, Other Activities). Unlike the Nat Geo destinations, this is TripNest's own illustrative editorial content, not sourced from a third party — no attribution needed.
- Category pills above the strip filter the tile set client-side (plain array filtering, no backend call) — one pill is always active, defaulting to "All".
- Clicking a tile goes to `/activities/[slug]` — a tabbed page (Apartments/Hotels/Restaurants/Reviews) with the same shape as the destination detail page, but keyed by activity instead of place: it runs the existing keyword search (`title`/`location`/`description` ILIKE) using the activity's name as the default term. There's no `Activity`/`Attraction` model on the backend yet (see Feature Gaps 2.1), so this is an honest approximation, not a real tagged category — most activities won't overlap with seed data and will show the same honest empty state as an unmatched destination.
- Every tab except Reviews has its own inline search box (`.tab-search-form`, placeholder "Search for `<Tab>` nearby here") that *replaces* the default activity keyword with whatever the visitor types, rather than combining the two — the backend's search endpoints only take one keyword, so this mirrors that limitation instead of hiding it. Reviews has no search box, same as the destination page's Reviews tab: it always follows the Apartments tab's default activity keyword.
- The carousel here is a plain scroll-by-one-tile strip (`scrollBy`), not the infinite loop used by `DestinationsCarousel` — looping a tile set whose length changes with the active filter isn't worth the complexity for this static preview.

**Plan your trip (`/plan`)** — the Hero's own search ("Start planning") no longer does a plain keyword search. It submits free text to `/plan?q=...`, which tries to understand *both* a destination and an activity in the same query (`lib/parseTripQuery.ts`) and shows results grouped by destination, using a new curated mapping (`data/destinationActivities.ts`) of which of the 12 activities are plausible at each of the 25 Nat Geo destinations.
- Deliberately a third, separate entry point — not a merger of the destinations carousel (still pure location, only reached by clicking a tile) or the activities carousel (still pure activity, only reached by clicking a tile). Those two are unchanged; this is additive.
- Parsing is plain keyword matching against two small, known vocabularies (25 destination names, 12 activities plus a few synonyms like "trekking" → hiking) — not real NLP, no external service, no cost. Deliberately conservative: it never fuzzy-matches a place name to a *different* real place (e.g. "French Alps" correctly finds no destination match rather than incorrectly resolving to "The Dolomites", which are Italian). A query mentioning a real place we simply haven't curated (e.g. "Chile") is an honest miss, not a wrong guess.
- If only a destination matches: one group, showing that destination's curated activities plainly.
- If only an activity matches: one group per destination that has that activity in `destinationActivities.ts` — this is the "grouped by location" case in practice, since a single activity usually maps to several destinations.
- If both match and the destination's curated list includes the activity: shown normally, with that activity visually highlighted among the others.
- If both match and the destination's curated list does *not* include the activity: an explicit "Requested activity not available — these are the available activities in `<destination>`" message, followed by what's actually available. Never silently substitutes or fabricates availability.
- Each group has an Apartment/Hotel `<select>` + Find button (`<form method="GET">`, no client JS) that hands off to `/destinations/[slug]?tab=apartments` or `?tab=hotels` — reusing that page's existing real search rather than building a second one. No pre-filled keyword beyond that page's own default (the destination's name); deeper handoff (e.g. carrying the activity into the tab's own search box) was left for later by request.
- No backend call happens on `/plan` itself — the grouping is pure static-data lookup (`natGeoDestinations`, `activityHighlights`, `destinationActivitySlugs`), so it renders instantly and doesn't depend on the backend being up. The real query only happens once someone clicks Find.

**Hero/Destinations overlap**
- The hero photo is full viewport height (`100vh`, `min-height: 700px` floor), and `.hero-content` sits at `top: 33%` rather than dead-center — deliberate, since centering left a large empty gap of plain photo above the headline on tall screens (a regression caught from a screenshot).
- `.destinations-section` has a negative `margin-top` (`-420px`) pulling it up to overlap the photo's lower portion, with no background of its own — it's fully transparent there deliberately, so the hero's own photo+overlay (painted first) shows through with no visible seam. An earlier version had a separate gradient scrim here, which is exactly what caused that seam — it was removed. Text legibility in the overlap zone comes entirely from `.hero-overlay`'s own darkening.
- This overlap distance is a fixed px value against a `100vh` (device-varying) hero, so it's inherently an approximation for a "typical" viewport. Current values (`top: 33%`, `-420px`) were tightened against an actual rendered screenshot, not guessed blind — still worth a look on short viewports where the `min-height` floor kicks in.
- The full-bleed hero (`width: 100vw` + `calc(-50vw + 50%)` margins) used to leave a thin sliver of the page's own background peeking around its edges — `vw` includes the scrollbar gutter, so it slightly overshoots the real visible width whenever a vertical scrollbar is present. Fixed by clipping horizontal overflow on `body` (`overflow-x: hidden`) rather than trying to compute the scrollbar width, which isn't reliably available in CSS alone.
- The hero photo is an aerial ocean-view resort shot (through a couple of iterations: originally a moody dark mountain range, then a bright blue-sky Yosemite landscape, now the current ocean/resort photo) with a lightened `.hero-overlay` gradient (peak opacity down from the original 0.55 to 0.4/0.45) — enough to keep the white `.hero-title` and the overlapping `.destinations-section` content legible, without crushing a bright photo back down to looking dark.

**Continent map removed** — an earlier iteration (`ContinentMap`, ellipse/blob shapes with an ocean backdrop) didn't read as a usable map and was replaced by the destinations carousel above. The `continent` field/filter still exists on the backend (harmless, dormant) but has no UI entry point anymore.

**Navbar**
- Brand (`BrandMark`) is the only way back to `/` — no separate "Home" link. The center nav-links (Start planning/Reviews/Contact) were removed by request — Reviews is now a link in the footer's About column, and Contact was already duplicated there (the footer's "Get in touch" column has had `id="contact"` since it was built). Right side now holds only the theme toggle and auth actions.
- Right side, in order: theme toggle icon (plain, no circle/pill background), then logged out shows `Login` + `Sign up`; logged in shows `Settings`, the current user's email, and `Logout`.
- The toggle icon (`ThemeIcon`) is a `lucide-react` `Sun`/`Moon` icon, not an emoji, so its look doesn't depend on the OS's emoji font — genuinely monochrome (both use `currentColor`, following `--color-navbar-text` inside the navbar). Shows the icon for the state a click would switch *to* (Sun while dark, Moon while light), not the current state.
- Fixed (not sticky — sticky still occupies flow space), backdrop-blurred, with a real translucent dark tint (`--color-navbar-bg`) rather than the fully transparent background it started with — pure blur-for-legibility didn't hold up in practice: the navbar sits over the Hero photo at the top of every page, and in light theme its near-black `--color-text` was barely readable against that photo. `--color-navbar-bg`/`--color-navbar-text` are deliberately theme-independent (same dark tint + light text in both themes), since the navbar always needs to read over the same dark hero regardless of site theme; `.nav-link` (Settings/Login), the theme toggle icon, `.user-email`, and `BrandMark`'s second word all use `--color-navbar-text` specifically inside `.navbar` rather than the normal `--color-text`.
- `.container`'s `padding-top` and `.hero`'s matching negative `margin-top` are what let Hero start at the true top of the viewport behind the nav, while every other page still gets pushed down correctly below it.
- The transparency is constant, not scroll-triggered — a "more opaque once scrolled" effect would need a small client-side scroll listener, which hasn't been added.

**Auth pages**: `/login` and `/signup` (`LoginForm`/`SignupForm`), cross-linked to each other. Signup calls the same backend endpoint built in Phase 0 (it just had no UI until now) and signs the new account straight in, same token flow as login.

**Responsive**: grid-based sections (`.grid`, `.testimonial-list`, `.gallery-grid`, `.footer-columns`) use `repeat(auto-fit, minmax(...))` and reflow on their own without media queries. Everything else that doesn't self-adjust (navbar sizing, hero text/search layout, the destinations carousel's visible-tile count, destination-page tabs, settings rows) has explicit breakpoints at 1024/900/768/560/420px in `globals.css`.

**Color theme**: CSS custom properties in `globals.css` use a warm neutral + navy palette — Oatmeal cream-tan, Abyssal Anchorfish Blue/Blue Fantastic navy, and a sky/ocean blue primary (`#54BEE1` in light theme, a brighter `#88D2EA` in dark theme — same hue, just lighter for contrast against a dark background). Primary was originally a rust/orange (Truffle Trouble/Burning Flame); switched to blue to match the ocean-view hero photo. Light theme's page background is plain white rather than Palladian cream — Palladian is still used elsewhere (dark theme's `--color-text`), just not as the light-theme page background anymore. Star ratings keep their own independent gold/orange (`--color-star-filled`) regardless of the primary color — a conventional rating color, not a brand accent.

**Typography**: `next/font/google` in `app/layout.tsx` self-hosts two fonts at build time (no runtime request to Google Fonts) — Space Grotesk for headings/brand (`h1`–`h6`, `.section-title`, `.page-title`, `.brand-text`) and Inter for body copy. Exposed as CSS variables (`--font-heading`/`--font-body`) set on `<html>`'s `className`, so `globals.css` stays the single place that decides which elements use which font.

**Icons**: all interface icons are `lucide-react` (`Sun`/`Moon` in `ThemeIcon`, `ChevronLeft`/`ChevronRight` on both carousels, `Compass` on activity badges, `Star` in `StarRating`/`StarRatingInput`/`HotelCard`, `Twitter`/`Instagram`/`Linkedin` in the footer) — genuinely monochrome via `currentColor`/`fill` rather than the mix of hand-drawn SVGs, unicode glyphs (★, ‹, ›, ✕, ◎), and a literal "in" string used previously. `BrandMark` (the logo) is deliberately excluded — it's brand identity, not a generic UI icon, so it keeps its own custom two-tone mark rather than becoming a stock icon.

**Footer**: contact/about/social columns (no blog column — out of scope for now). The About column now carries "Browse stays", "Reviews" (`/#testimonials`), "Settings", and "Log in" — Reviews moved here from the navbar (see Navbar above); real internal links throughout (`/`, `/settings`, `/login`, `/#testimonials`); social icons are decorative placeholders since there's no real social presence yet.

**Search results intro**: the plain-keyword-search state (`SearchResultsIntro` in `app/page.tsx`, reached directly via `/?search=...` — see Hero below for why that's no longer the Hero's own behavior) shows real heading text — "The Value For Experience" / "Relax… You're with us! We make it simple." — directly above `SearchFilters`. This text used to be baked into a marketing banner image (`ExperienceBanner`) alongside a "START PLANNING" button; the button duplicated other CTAs already on the page and, being flattened into the same PNG as the heading, couldn't be removed without retiring the whole graphic — so the heading became real text with a more specific home, and the image came back separately (see Trip illustration banner below).

**Trip illustration banner**: `TripIllustrationBanner` renders a purely decorative image (`/public/images/trip-illustration-banner.jpg`) full-bleed, site-wide, directly above the footer (mounted in `AppShell`, not `page.tsx`) — the illustration from the original `ExperienceBanner`, brought back after a cleaned version of the same asset (text and button removed from the image itself) was provided. No overlay link this time — nothing in the image is meant to look clickable, so there's nothing to wire up. `alt=""` and `aria-hidden="true"` throughout, since it's decorative only now (no baked-in text an image description would need to convey).

**Theming**: CSS custom properties in `globals.css` (`--color-*`, redefined under `[data-theme="dark"]`) — components use `var(--color-*)`, not hardcoded colors.
- `app/layout.tsx` inlines a small blocking script (`THEME_INIT_SCRIPT`) that sets `data-theme` on `<html>` from `localStorage` *before* React hydrates, avoiding a flash of the wrong theme on load — this is also why `<html>` has `suppressHydrationWarning`.
- **Light is the deliberate default** — the script does not fall back to `prefers-color-scheme`; it only shows dark if the user has explicitly toggled it before.
- The toggle exists in two places sharing the same `ThemeContext`: an icon-only button in the navbar (`navbar-theme-toggle-btn`, always visible, positioned before Login/Signup) for quick access, and a labeled version on `/settings` (`SettingsForm`, `theme-toggle-btn`) alongside account details.

**Auth requirements**: browsing listings and reading reviews requires no login — public by design, for crawlability. Writing a review requires login; a user can leave at most one review per listing (enforced by the backend, reflected in the UI by hiding the form once they have one).

### Backend

**Stack**: Node.js + TypeScript + Express, organized by module (`modules/auth`, `modules/listings`, `modules/reviews`, `modules/hotels`, `modules/restaurants`), each with `routes → controller → service`.

**Database**: PostgreSQL via Prisma — `User`, `RefreshToken`, `Listing`, `Review`, `ReviewPhoto`, `Hotel`, `Restaurant` models today (`backend/prisma/schema.prisma`); more arrive as features are built (see Domain Model below).

**Auth**: bcrypt-hashed passwords, short-lived JWT access tokens, rotating/revocable refresh tokens stored hashed in the DB.
- Endpoints: `POST /api/auth/{signup,login,refresh,logout}`, `GET /api/auth/me`.

**Listings**: `GET /api/listings`, `GET /api/listings/:id` — public/unauthenticated, since listing content needs to be crawlable.
- `GET /api/listings` accepts `search` (case-insensitive match on title/location/description), `minPrice`/`maxPrice`, `minRating`, and `continent` — implemented as Postgres `ILIKE`/range/equality filters via Prisma rather than `tsvector` full-text search or a real geo query, since a handful of listings doesn't yet justify that complexity.

**Hotels & Restaurants**: `GET /api/hotels`, `GET /api/hotels/:id`, `GET /api/restaurants`, `GET /api/restaurants/:id` — public, read-only (no owner-submission workflow yet, matching how they're populated: curated seed data, not user-generated).
- `Hotel` has `starClass` (official star rating, 1–5 — not review-derived, since neither entity has review functionality yet); `Restaurant` has `cuisine`, `priceRange` (1–4), and `rating` (curated, out of 5, same not-review-derived caveat as `starClass` — added specifically so `RestaurantCard` has something to show alongside `HotelCard`'s stars and `ApartmentCard`'s real guest-review average).
- Both support `search`/`continent` filters like Listings; Hotels also supports `minPrice`/`maxPrice`, Restaurants also supports `cuisine`.
- Deliberately separate entity types from `Listing` rather than a "type" discriminator on one table, since their attributes genuinely differ.

**Reviews**: `GET/POST /api/listings/:listingId/reviews`, `PATCH/DELETE /api/reviews/:id`, `GET /api/reviews/featured` (public — top-rated reviews across all listings, powers the homepage testimonials section).
- Reading is public; writing requires auth and ownership (a user can only edit/delete their own review).
- `Listing.averageRating`/`reviewCount` are derived fields, recomputed from the actual review rows on every create/update/delete (`reviews.service.ts:recomputeListingRating`) rather than incremented in place.
- Review photos are URL-only for now — there's no upload/storage pipeline yet (see Feature Gaps below).
- Reviews are Listing-only — Hotels and Restaurants don't have their own review system; the destination page's Reviews tab shows reviews of matching Listings, not a unified review model.

**Cross-cutting**: centralized env validation (zod), a shared error-handling middleware, and a Prisma client singleton.

### Local infra
- **Database**: a hosted Postgres connection string (e.g. [Neon](https://neon.tech), free tier) — no local database service to install or run. Prefer Neon's *direct* (non `-pooler`) connection string over its PgBouncer-pooled one; Prisma's migration engine can be finicky over pooled connections, and pooling isn't worth the complexity for local dev.
- Root `package.json` scripts: `setup`, `db:migrate`, `db:seed`, `dev`, `typecheck`, `test`, `test:e2e`.
- Root/`backend`/`frontend` each have their own independent `package.json` + lockfile (three separate `npm install --prefix <dir>` calls in `setup`, not a real npm workspace). This is why `next dev`/`next build` print a "Next.js inferred your workspace root" warning — it sees the lockfile in the repo root as well as `frontend/`'s own and isn't sure which is authoritative. Harmless for `next dev`; `frontend/next.config.ts` pins `outputFileTracingRoot` to `frontend/` itself so `next build`'s file tracing doesn't have to guess.
- **Seed data covers all 25 Nat Geo destinations**, not just a handful — deliberately, so every `/destinations/[slug]` page has something real to show rather than relying on the honest-empty-state fallback. No paid API involved (Google Places, Yelp, etc. were considered and ruled out — cost plus ToS restrictions on caching/displaying third-party ratings); this is all authored seed content, same as the original 9-listing demo set. `backend/prisma/seed.ts`'s `destinationSeeds` array is the source of truth — one apartment, one hotel, and one restaurant per destination (Rio de Janeiro and Vancouver were already covered by the original seed set before this array existed, so they're excluded/partial there to avoid duplicate rows). Each destination's `location` field is built as `"<exact Nat Geo name>, <region>"` specifically because the destination page's search is a plain ILIKE substring match — the exact name has to appear verbatim somewhere for it to be found at all. Images reuse each destination's own already-verified Nat Geo photo (`natGeoDestinations.ts`) rather than sourcing ~70 new ones.

### Testing

**Backend** (`backend/vitest.config.ts`): Vitest unit tests co-located with the code they test.
- `tokens.test.ts`, `listings.schemas.test.ts`, `reviews.schemas.test.ts`, `hotels.schemas.test.ts`, `restaurants.schemas.test.ts` test pure logic directly.
- `reviews.service.test.ts` mocks the Prisma client (`vi.mock("../../db/prisma.js")`) to test ownership checks and exactly when rating aggregation fires, without a real database.
- `app.test.ts` uses supertest against the assembled Express app for request-level checks (health check, 404s, validation errors, auth-required routes) — all chosen to not need a live DB.
- `vitest.setup.ts` stubs the env vars `config/env.ts` requires at import time, so tests don't need a real `.env`.

**Frontend** (`frontend/vitest.config.ts`): Vitest + React Testing Library component tests, co-located with components (`StarRating`, `StarRatingInput`, `SearchFilters`, `ApartmentCard`, `DestinationsCarousel`, `ThemeIcon`, `BrandMark`, `FaqSection`, `TestimonialSection`, `DestinationGallery`, `SettingsForm`, `ActivitiesSection`, `ExploreCategories`, `RestaurantCard`, `TripIllustrationBanner`), plus a pure-function suite for `lib/parseTripQuery.ts` (no rendering involved — it's just string matching against the two curated vocabularies, including the "must not fuzzy-match a wrong place" case from the README note above).
- `DestinationsCarousel.test.tsx` covers the circular-loop snap-back specifically (simulates `scrollLeft` past one full set's width, then asserts it's corrected before the next scroll call) and confirms the duplicated loop-clone tiles are excluded from accessibility role queries.
- `SettingsForm.test.tsx` mocks `AuthContext`/`ThemeContext` directly (`vi.mock`) rather than wrapping in real providers, to test its auth-gating branches in isolation.
- `vitest.setup.tsx` mocks `next/image` and `next/link`, since both assume a full Next.js runtime (image optimization pipeline, App Router context) that doesn't exist under plain Vitest+jsdom.

**E2E** (root `playwright.config.ts`, `e2e/`): Playwright tests against the real running stack — browsing/searching listings, the destinations carousel + tabbed detail pages (Apartments/Hotels/Restaurants, per-tab search box, the honest-empty-state case for destinations with no seed data), the activities carousel + its own tabbed detail pages (category filtering, tile navigation, the per-tab search box overriding the default activity keyword, tab-switching not carrying over a prior search), the `ExploreCategories` navigation tiles plus the standalone `/hotels`/`/restaurants` browse pages they link to, the new `/plan` flow (`plan.spec.ts` — destination-only, activity-only grouping-by-destination, both-matched available vs. not-available, the honest no-match case, and the Find button handoff to `/destinations/[slug]`), login/logout, signup (+ that it signs the new account straight in), settings auth-gating, the light-theme default (explicitly emulating a dark-mode OS preference to confirm it doesn't leak through) and navbar toggle persistence, and a full signup-via-API → login-via-UI → review-submission flow. `home.spec.ts` now also covers the Hero search's changed destination (`/plan`, not `/?search=`) and confirms the plain-keyword search still works when reached directly.
- Assumes the seed data is loaded; Playwright's `webServer` starts the frontend+backend dev servers but doesn't set up the database itself.

**Coverage is a starting pattern, not comprehensive** — these are real working examples per layer (pure logic, mocked-dependency service logic, request-level integration, component rendering, full-stack e2e), not full coverage of every module. `AuthContext`, `ReviewItem`, `ReviewForm`, `LoginForm`, `SignupForm`, `HotelCard`/`RestaurantCard`, and the newer marketing sections (`Hero`, `EasyToUseSection`, `RecommendationsSection`, `Footer`) don't have unit tests yet — mocking `next/navigation`'s `useRouter` is the next piece needed for the auth-dependent ones.

Run with `npm test` (backend + frontend unit tests) or `npm run test:e2e` (Playwright) from the project root.

### Run locally
```bash
npm run setup                                # installs root, backend, frontend deps
cp backend/.env.example backend/.env         # fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET / DATABASE_URL
cp frontend/.env.example frontend/.env.local # Next.js convention for local env vars
npm run db:migrate                           # creates schema (prompts for a migration name the first time)
npm run db:seed                              # seeds a demo user + listings
npm run dev                                  # runs backend (:5001) + frontend (:3000)
```
Demo login: `user1@mail.com` / `user123`.

`DATABASE_URL` in `backend/.env` points at a hosted Postgres — no Docker or local database install needed. See `backend/.env.example` for the connection string format.

---

## 2. Feature Gaps to Close

Grouped by what actually differentiates a TripAdvisor-class product.

### 2.1 Core content model
- **Multi-type listings**: Hotels and Restaurants are now real entities (`GET /api/hotels`, `GET /api/restaurants`) with real seed data, browsable via the destination and activity detail pages. Still missing: a real `Attraction`/`Activity` type with its own attributes and tagging — the new `/activities/[slug]` pages (see Architecture above) approximate "browse by activity" with keyword search against existing listings/hotels/restaurants, not a genuine tagged category. Also still missing: type-specific attributes beyond the basics already modeled (opening hours, accessibility), and — same gap as Listings — an owner-submission workflow (all three types are curated/seeded, not user-submitted).
- **Reviews**: basic text + sub-ratings (cleanliness, service, value, location) CRUD is built. Still missing: photo upload (photos are URL-only today, no storage pipeline), helpful votes, owner responses, verified-stay badges, moderation/flagging.
- **Ranking logic**: average rating is now computed from real review data, but it's a plain average; a recency/quality/popularity-weighted ranking score is still open.
- **Rich media**: multi-photo galleries per listing, user-submitted photos, photo moderation.

### 2.2 Discovery
- Basic search/filter (keyword, price range, minimum rating) is built via Postgres `ILIKE`/range queries. Still missing: faceted search (amenities, category), geo search ("near me", radius), and relevance ranking (current matching has no scoring, just filters).
- **Faceted search** — partially previewed: the Activities strip's category pills (Adventure/High Adrenaline/Water Sports/History & Culture/Other Activities) filter a static curated set client-side, not a real faceted query against the listings/hotels/restaurants catalog with actual amenity/category data.
- **Geo search** — "near me," radius search, or a real interactive pannable/zoomable map. An earlier continent-click map (`ContinentMap`) was tried and removed — it didn't read as a usable map even after a redesign attempt (see git history if curious). Replaced by the destinations carousel/pages (Architecture above), which sidesteps needing a map at all rather than attempting one a third time. A real map library (Leaflet) is still the natural path if map-based browsing becomes a priority again.
- **Destination autocomplete** — partially addressed: the Hero search input's `<datalist>` suggests the 25 Nat Geo destination names, but that's a fixed curated list, not real autocomplete against the full listings/hotels/restaurants catalog (which would need a dedicated suggestions endpoint as the catalog grows beyond a browsable size).
- **Personalized recommendations** ("Travelers who viewed this also viewed…").
- **SEO**: sitemap generation, structured data (schema.org `Product`/`Review` markup), and canonical URLs for listing/review pages — SSR/ISR is in place, but the pages aren't yet optimized for search indexing beyond basic metadata.

### 2.3 Users & trust
- User profiles: trip history, wishlist/saved listings, review history, contribution badges.
- Business owner accounts: claim a listing, respond to reviews, update business info.
- Trust & safety: review authenticity checks, report/flag content, rate limiting, spam detection.
- Optional OAuth/social login, email verification, password reset.

### 2.4 Transactions
- Booking/reservation flow (or outbound affiliate links as a first step).
- Availability calendars and pricing rules.
- Payments (Stripe), cancellation policies, booking confirmation emails.

### 2.5 Platform concerns
- Image storage/CDN for uploads (not hotlinked third-party URLs).
- Caching layer for hot listing/search data.
- Automated tests exist (Vitest/RTL + Playwright, see Testing under Architecture) but CI/CD to actually run them on every PR does not — nothing currently blocks a merge if tests fail.
- Observability: structured logging, error tracking (Sentry), metrics/dashboards.
- Accessibility (a11y) and internationalization (i18n).
- Admin/moderation dashboard.

---

## 3. Tech Stack

### Frontend
| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Core requirement. |
| Meta-framework | **Next.js (App Router)** | Listing/detail pages are Server Components with ISR, so content is crawlable — foundational for Discovery below. |
| Data fetching | **TanStack Query** | Caching, pagination, background refetch for listing/search/review feeds. |
| Client state | **Zustand** | Lightweight for UI state (filters, modals) — Redux Toolkit is a fine alternative if the team prefers stronger conventions. |
| Styling | **Tailwind CSS + shadcn/ui (Radix primitives)** | Fast, consistent, and accessible by default — Radix primitives (dialogs, comboboxes) matter once features like search filters or booking flows need real modals/menus, which plain hand-rolled markup tends to get wrong (focus trapping, Escape handling, ARIA roles). |
| Forms/validation | **React Hook Form + Zod** | Schemas can be shared with the backend for consistent validation. |
| Maps | **Mapbox GL JS** | Geo search and map browsing. |
| Testing | **Vitest + React Testing Library**, **Playwright** for e2e | In place with real example tests per layer (see Testing under Architecture) — pattern established, not yet comprehensive coverage. |

### Backend
| Concern | Choice | Why |
|---|---|---|
| Runtime | Node.js + TypeScript | One language across the stack; share types/Zod schemas with the frontend. |
| Framework | Express today; **consider NestJS** as the module count grows | Nest adds structure (DI, guards, validation pipes) that pays off once auth/listings/reviews/bookings all need consistent cross-cutting concerns. |
| Database | **PostgreSQL + Prisma** | Reviews/ratings/bookings are relational with real integrity needs (a review belongs to exactly one user and listing; bookings must not double-book). |
| Search | **Meilisearch** to start, **Elasticsearch** if scale demands it | Faceted + geo + typo-tolerant search isn't something Postgres `LIKE` queries handle well. |
| Caching | **Redis** | Hot listing pages, rate-limit storage, search result caching. |
| Object storage | **S3 (or Cloudflare R2) + CDN** | User-uploaded photos, resized via Sharp or Cloudinary. |
| Payments | **Stripe** | For the booking flow. |
| Background jobs | **BullMQ (Redis-backed)** | Email sending, image processing, search index sync, ranking recomputation. |

### Infra
- Postgres is a hosted connection (e.g. Neon), not containerized — no Docker required for local dev today. Docker Compose could still make sense later for local instances of Redis/Meilisearch once those are actually added, but isn't set up preemptively.
- GitHub Actions for CI: lint/typecheck/test on PR, deploy on merge.
- Vercel for the Next.js frontend; a container host (Fly.io/Railway/AWS ECS) for the API.
- Sentry for errors; OpenTelemetry + Grafana/Datadog for metrics.

---

## 4. Domain Model

**Implemented today**: `User`, `RefreshToken`, `Listing` (includes a coarse `continent` enum — `NORTH_AMERICA`/`SOUTH_AMERICA`/`EUROPE`/`AFRICA`/`ASIA`/`OCEANIA` — a region label, not real geo data; no dedicated UI anymore, but still a valid query filter), `Review`, `ReviewPhoto`, `Hotel`, `Restaurant`.

**Target model** as remaining features are built:
```
User            id, email, passwordHash, name, avatarUrl, role(traveler|owner|admin), createdAt
Listing         id, title, description, location(lat,lng,address), continent,
                priceLevel, amenities[], ownerId, createdAt
Hotel           id, name, description, location, continent, price, starClass, ownerId, createdAt
Restaurant      id, name, description, location, continent, cuisine, priceRange, rating, ownerId, createdAt
ListingPhoto    id, listingId, url, uploadedByUserId, isApproved
Review          id, listingId, userId, rating, subRatings{cleanliness,service,value,location},
                title, body, stayDate, isVerifiedStay, helpfulCount, createdAt
ReviewPhoto     id, reviewId, url
OwnerResponse   id, reviewId, ownerId, body, createdAt
Booking         id, listingId, userId, dateRange, guests, status, totalPrice
Wishlist        id, userId, listingId
```

`Hotel`/`Restaurant` are real today but read-only (no `ownerId`/owner-submission workflow yet — that's still target-state, same as the rest of the table above) and have no review system of their own (Review stays Listing-only for now). Real `lat`/`lng` geo data (for actual "near me"/radius search) is still a Discovery-phase item — see Feature Gaps below.

---

## 5. Roadmap

**Foundation (in place)**: TypeScript on both apps, Postgres + Prisma, real bcrypt/JWT auth with refresh tokens, listings served from the database, Next.js App Router with SSR/ISR on listing pages for SEO, review CRUD with rating aggregation (text + sub-ratings, one review per user per listing, average rating/count derived from real review data), basic search/filter (keyword + price range + minimum rating) via URL-driven searchParams and Postgres query filters, and a Vitest/RTL + Playwright test setup (see Testing below) — infrastructure and real example tests are in place, not yet full coverage.

**Next — Discovery**
- Meilisearch/Elasticsearch integration: faceted + geo search + autocomplete.
- Map view (Mapbox), "near me."
- Wishlist/saved listings, user profile pages.

**Then — Trust & business**
- Owner accounts, claim-a-listing flow, owner responses to reviews.
- Review moderation/flagging pipeline, spam detection.
- Admin dashboard.

**Then — Transactions**
- Booking flow, availability calendars, Stripe payments, confirmation emails via background jobs.

**Cross-cutting, every phase**: tests written alongside each feature, CI/CD enforced from the start, accessibility pass on every new component, structured logging + error tracking.
