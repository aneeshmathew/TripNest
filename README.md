# TripNest — Product & Engineering Plan

TripNest is a travel discovery platform: browse listings (stays, and eventually restaurants/attractions), read and leave reviews, search and filter by location and preferences, and book. This document is the living plan — architecture, tech stack, and roadmap — for building it out.

---

## 1. Architecture

### Frontend
- **React 18 + TypeScript**, built with **Next.js (App Router)** for SSR/ISR — listing browse and detail pages are Server Components, so content is present in the initial HTML for search engines rather than fetched client-side after hydration.
- `src/app/` — routes. `page.tsx` (home) and `apartments/[id]/page.tsx` (listing detail) are async Server Components that fetch data server-side; `page.tsx` reads filters from `searchParams` (`?search=&minPrice=&maxPrice=&minRating=`) so search results are shareable/bookmarkable URLs, not client-side-only state; `apartments/[id]/page.tsx` also exports `generateMetadata` (per-listing title/description/OG tags) and `generateStaticParams` (pre-renders a page per listing, refreshed via ISR).
- `src/lib/listings.ts` — server-only listings data fetching (accepts the same filters as searchParams, forwarded as query params to the backend), 60s `revalidate` (ISR) per filter combination; also `getFeaturedListings` (fetches all, sorts by rating client-side, no dedicated backend endpoint yet — fine at the current catalog size) for the homepage's Featured Stays row. `src/lib/reviews.ts` — server-only reviews data fetching, uncached (`cache: "no-store"`) so a new/edited/deleted review is reflected immediately rather than waiting out a revalidation window; also `getFeaturedReviews` (5-minute ISR — staleness matters less for marketing content than for "did my review save") for the homepage testimonials.
- `src/api/` — client-only API layer for auth and review mutations (`client.ts` wraps `fetch`, attaches the JWT access token, and transparently retries once via `/api/auth/refresh` on a 401; `auth.ts`, `reviews.ts`, `tokenStorage.ts`).
- `src/context/` — `AuthProvider` (current user, login/logout) and `ThemeProvider` (light/dark theme), both client-side.
- `src/components/` — `AppShell` is the one client boundary wrapping the whole app (`ThemeProvider` + `AuthProvider` + `Navbar` + `Footer`); `SearchFilters` is a plain server-rendered GET form (no client JS) that drives the search/filter URLs above; `ApartmentCard` is a single `<Link>` — the whole card is clickable through to the listing detail page, not just a "View details" sub-link; `ApartmentList` stays server-renderable end to end; `LoginForm` handles login; `SettingsForm` holds the theme toggle (moved off the navbar onto its own `/settings` page); `ReviewsSection`/`ReviewItem`/`ReviewForm`/`StarRating`/`StarRatingInput` handle review display, submission, and inline edit/delete for the review's own author; `BrandMark` is the shared logo (icon + two-tone "TripNest" wordmark), used in both `Navbar` and `Footer`.
- **Home page (`/`) has two distinct states**, not layered on top of each other: with no active search/filter, it's a full marketing front door (`Hero`, `DestinationsSection`, `FeaturedStays`, `EasyToUseSection`, `PlanWithFriendsSection`, `RecommendationsSection`, `FaqSection`, `TestimonialSection`, `DestinationGallery`); once a search or filter is active, those marketing sections are dropped in favor of a focused `SearchFilters` + results view. A few of those front-door sections use real data (`FeaturedStays` = real top-rated listings, `TestimonialSection` = real reviews via `GET /api/reviews/featured`, `DestinationGallery` = real listing photos linking to real listing pages); `PlanWithFriendsSection`/`RecommendationsSection` are explicitly illustrative marketing copy for features that don't exist yet (group planning, a recommendation engine) — not fabricated data pretending to be real. `FaqSection` uses native `<details>`/`<summary>` (zero client JS) with real answers about how TripNest actually works.
- **Destinations**: `DestinationsSection`/`DestinationsCarousel` show `data/natGeoDestinations.ts` — a static, curated list of National Geographic's real "Best of the World 2026" destinations (verified against the actual published list; descriptions are written in our own words, not copied from the source, with an attribution link). This is editorial content, not TripNest's own data — clicking a tile goes to `/destinations/[slug]` (`generateStaticParams` pre-renders all 25), a tabbed page (Apartments/Hotels/Restaurants/Reviews, URL-driven via `?tab=`) built entirely from **our own** real listings/hotels/restaurants/reviews filtered by that destination's name. Destinations with no matching inventory show an honest empty state per tab rather than fabricated content — most of the 25 don't have seed data yet, only the ones overlapping with existing apartment cities (Rio, Vancouver, etc.) do. The Hero search input's `<datalist>` offers the same 25 names as autocomplete suggestions while still accepting any free-text location. `DestinationsCarousel` is a client component (the one piece of the destinations UI that genuinely needs JS) — auto-advances one tile every 2s, pauses on hover/focus, loops after the last tile, and has Prev/Next buttons for manual control (an auto-only carousel with no pause/manual override is a real accessibility problem). Tile width is a computed `flex-basis` (`calc((100% - (N-1)*gap)/N)`, `N` = `--carousel-visible`), not a fixed px value — this is what makes exactly N tiles fit edge-to-edge with no partial tile cut off; `N` steps down at each breakpoint (5 → 4 → 3 → 2 → 1) so the same "no cut-off" math holds at every screen size.
- **Hero/Destinations overlap**: the hero photo is full viewport height (`100vh`, `min-height: 700px` floor), and `.hero-content` sits at `top: 40%` rather than dead-center (50%) — this is deliberate: centering content in a full-viewport-tall hero left a large empty gap of plain photo above the headline on tall screens (an actual regression caught from a screenshot), so content is pulled toward the upper-middle instead. `.destinations-section` has a negative `margin-top` pulling it up to overlap the photo's lower portion, with **no background of its own** — it's fully transparent there deliberately, so the hero's own photo+overlay (a sibling, painted first) shows through directly with no second background layer creating a visible seam/box (an earlier version had a separate gradient scrim on this section, which is exactly what caused that box — removed). Text legibility in the overlap zone comes entirely from `.hero-overlay`'s own darkening. This overlap distance is a fixed px value against a `100vh` (device-varying) hero, so it's inherently an approximation for a "typical" viewport, not something that can be pixel-exact across all screen sizes without JS-measured positioning — worth a look especially on short viewports where the `min-height` floor kicks in.
- **Continent map removed** — an earlier iteration (`ContinentMap`, ellipse/blob shapes with an ocean backdrop) didn't read as a usable map and was replaced by the destinations carousel above. The `continent` field/filter still exists on the backend (harmless, dormant) but has no UI entry point anymore.
- **Navbar**: brand (`BrandMark`) is the only way back to `/` — there's no separate "Home" link. Center links anchor into homepage sections (`#featured-stays`, `#testimonials`, `#contact`). Right side, in order: theme toggle icon (plain, no circle/pill background — just the emoji), then logged out shows `Login` + `Sign up`, logged in shows `Settings`, the current user's email, and `Logout`. Fixed (not sticky — sticky still occupies flow space) with a translucent (`--color-navbar-bg`, 0.4 alpha), backdrop-blurred background so the Hero photo shows through it at the top of the home page; `.container`'s `padding-top` and `.hero`'s matching negative `margin-top` are what let Hero start at the true top of the viewport behind it while every other page still gets pushed down correctly below the fixed nav. The transparency is constant, not scroll-triggered — a "more opaque once scrolled" effect would need a small client-side scroll listener, which hasn't been added.
- **Auth pages**: `/login` and `/signup` (`LoginForm`/`SignupForm`), cross-linked to each other. Signup calls the same backend endpoint built in Phase 0 (it just had no UI until now) and signs the new account straight in, same token flow as login.
- **Responsive**: grid-based sections (`.grid`, `.testimonial-list`, `.gallery-grid`, `.footer-columns`) use `repeat(auto-fit, minmax(...))` and reflow on their own without media queries. Everything else that doesn't self-adjust (navbar sizing, hero text/search layout, the destinations carousel's visible-tile count, destination-page tabs, settings rows) has explicit breakpoints at 1024/900/768/560/420px in `globals.css`.
- **Color theme**: CSS custom properties in `globals.css` use a warm neutral + navy palette (Palladian/Oatmeal cream-tan, Abyssal Anchorfish Blue/Blue Fantastic navy, Truffle Trouble rust as light-theme primary, Burning Flame orange as dark-theme primary — same warm hue family, just the brighter member for contrast on a dark background).
- **Footer**: contact/about/social columns (no blog column — out of scope for now), real internal links (`/`, `/settings`, `/login`); social icons are decorative placeholders since there's no real social presence yet.
- **Theming**: CSS custom properties in `globals.css` (`--color-*`, redefined under `[data-theme="dark"]`) — components use `var(--color-*)`, not hardcoded colors. `app/layout.tsx` inlines a small blocking script (`THEME_INIT_SCRIPT`) that sets `data-theme` on `<html>` from `localStorage` *before* React hydrates, avoiding a flash of the wrong theme on load — this is also why `<html>` has `suppressHydrationWarning`. **Light is the deliberate default** — the script does not fall back to `prefers-color-scheme`; it only ever shows dark if the user has explicitly toggled it before. The toggle exists in two places sharing the same `ThemeContext`: an icon-only button in the navbar (`navbar-theme-toggle-btn`, always visible, positioned before Login/Signup) for quick access, and a labeled version on `/settings` (`SettingsForm`, `theme-toggle-btn`) alongside account details.
- Browsing listings and reading reviews requires no login — public by design, for crawlability. Writing a review requires login; a user can leave at most one review per listing (enforced by the backend, reflected in the UI by hiding the form once they have one).

### Backend
- **Node.js + TypeScript + Express**, organized by module (`modules/auth`, `modules/listings`, `modules/reviews`, `modules/hotels`, `modules/restaurants`), each with `routes → controller → service`.
- **PostgreSQL via Prisma** — `User`, `RefreshToken`, `Listing`, `Review`, `ReviewPhoto`, `Hotel`, `Restaurant` models today (`backend/prisma/schema.prisma`); more arrive as features are built (see Domain Model below).
- **Auth**: bcrypt-hashed passwords, short-lived JWT access tokens, rotating/revocable refresh tokens stored hashed in the DB. Endpoints: `POST /api/auth/{signup,login,refresh,logout}`, `GET /api/auth/me`.
- **Listings**: `GET /api/listings`, `GET /api/listings/:id` — public/unauthenticated, since listing content needs to be crawlable by search engines. `GET /api/listings` accepts `search` (case-insensitive match on title/location/description), `minPrice`/`maxPrice`, `minRating`, and `continent` query params — implemented as Postgres `ILIKE`/range/equality filters via Prisma rather than `tsvector` full-text search or a real geo query, since a handful of listings doesn't yet justify that complexity.
- **Hotels & Restaurants**: `GET /api/hotels`, `GET /api/hotels/:id`, `GET /api/restaurants`, `GET /api/restaurants/:id` — public, read-only (no owner-submission workflow yet, matching how they're populated: curated seed data, not user-generated). `Hotel` has `starClass` (official star rating, 1-5 — not review-derived, since neither entity has review functionality yet); `Restaurant` has `cuisine` and `priceRange` (1-4). Both support `search`/`continent` filters like Listings; Hotels also supports `minPrice`/`maxPrice`, Restaurants also supports `cuisine`. Deliberately separate entity types from `Listing` rather than a "type" discriminator on one table, since their attributes genuinely differ.
- **Reviews**: `GET/POST /api/listings/:listingId/reviews`, `PATCH/DELETE /api/reviews/:id`, `GET /api/reviews/featured` (public — top-rated reviews across all listings, powers the homepage testimonials section). Reading is public; writing requires auth and ownership (a user can only edit/delete their own review). `Listing.averageRating`/`reviewCount` are derived fields, recomputed from the actual review rows on every create/update/delete (`reviews.service.ts:recomputeListingRating`) rather than incremented in place. Review photos are URL-only for now — there's no upload/storage pipeline yet (see Feature Gaps below). Reviews are Listing-only — Hotels and Restaurants don't have their own review system; the destination page's Reviews tab shows reviews of matching Listings, not a unified review model.
- Centralized env validation (zod), a shared error-handling middleware, and a Prisma client singleton.

### Local infra
- **Database**: a hosted Postgres connection string (e.g. [Neon](https://neon.tech), free tier) — no local database service to install or run. Prefer Neon's *direct* (non `-pooler`) connection string over its PgBouncer-pooled one; Prisma's migration engine can be finicky over pooled connections, and pooling isn't worth the complexity for local dev.
- Root `package.json` scripts: `setup`, `db:migrate`, `db:seed`, `dev`, `typecheck`, `test`, `test:e2e`.

### Testing
- **Backend** (`backend/vitest.config.ts`): Vitest unit tests co-located with the code they test — `tokens.test.ts`, `listings.schemas.test.ts`, `reviews.schemas.test.ts`, `hotels.schemas.test.ts`, `restaurants.schemas.test.ts` test pure logic directly; `reviews.service.test.ts` mocks the Prisma client (`vi.mock("../../db/prisma.js")`) to test ownership checks and exactly when rating aggregation fires, without a real database. `app.test.ts` uses supertest against the assembled Express app for a few request-level checks (health check, 404s, validation errors, auth-required routes) — all chosen to not need a live DB. `vitest.setup.ts` stubs the env vars `config/env.ts` requires at import time, so tests don't need a real `.env`.
- **Frontend** (`frontend/vitest.config.ts`): Vitest + React Testing Library component tests, co-located with components (`StarRating`, `StarRatingInput`, `SearchFilters`, `ApartmentCard`, `DestinationsCarousel`, `BrandMark`, `FaqSection`, `TestimonialSection`, `DestinationGallery`, `SettingsForm`). `SettingsForm.test.tsx` mocks `AuthContext`/`ThemeContext` directly (`vi.mock`) rather than wrapping in real providers, to test its auth-gating branches in isolation. `vitest.setup.tsx` mocks `next/image` and `next/link`, since both assume a full Next.js runtime (image optimization pipeline, App Router context) that doesn't exist under plain Vitest+jsdom.
- **E2E** (root `playwright.config.ts`, `e2e/`): Playwright tests against the real running stack — browsing/searching listings, the destinations carousel + tabbed detail pages (Apartments/Hotels/Restaurants, including the honest-empty-state case for destinations with no seed data), login/logout, signup (+ that it signs the new account straight in), settings auth-gating, the light-theme default (explicitly emulating a dark-mode OS preference to confirm it doesn't leak through) and navbar toggle persistence, and a full signup-via-API → login-via-UI → review-submission flow. Assumes the seed data is loaded; Playwright's `webServer` starts the frontend+backend dev servers but doesn't set up the database itself.
- **Coverage is a starting pattern, not comprehensive** — these are real working examples per layer (pure logic, mocked-dependency service logic, request-level integration, component rendering, full-stack e2e), not full coverage of every module. `AuthContext`, `ReviewItem`, `ReviewForm`, `LoginForm`, `SignupForm`, `HotelCard`/`RestaurantCard`, and the newer marketing sections (`Hero`, `EasyToUseSection`, `PlanWithFriendsSection`, `RecommendationsSection`, `Footer`) don't have unit tests yet — mocking `next/navigation`'s `useRouter` is the next piece needed for the auth-dependent ones.
- Run with `npm test` (backend + frontend unit tests) or `npm run test:e2e` (Playwright) from the project root.

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
- Multi-type listings: Hotels and Restaurants are now real entities (`GET /api/hotels`, `GET /api/restaurants`) with real seed data, browsable via the destination detail pages. Still missing: an "attractions/things to do" type, type-specific attributes beyond the basics already modeled (opening hours, accessibility), and — same gap as Listings — an owner-submission workflow (all three types are curated/seeded, not user-submitted).
- Reviews: basic text + sub-ratings (cleanliness, service, value, location) CRUD is built. Still missing: photo upload (photos are URL-only today, no storage pipeline), helpful votes, owner responses, verified-stay badges, moderation/flagging.
- Aggregate ranking logic — average rating is now computed from real review data, but it's a plain average; a recency/quality/popularity-weighted ranking score is still open.
- Rich media: multi-photo galleries per listing, user-submitted photos, photo moderation.

### 2.2 Discovery
- Basic search/filter (keyword, price range, minimum rating) is built via Postgres `ILIKE`/range queries. Still missing: faceted search (amenities, category), geo search ("near me", radius), and relevance ranking (current matching has no scoring, just filters).
- Geo search — "near me," radius search, or a real interactive pannable/zoomable map. An earlier continent-click map (`ContinentMap`) was tried and removed — it didn't read as a usable map even after a redesign attempt (see git history if curious). Replaced by the destinations carousel/pages (Architecture above), which sidesteps needing a map at all rather than attempting one a third time. A real map library (Leaflet) is still the natural path if map-based browsing becomes a priority again.
- Destination autocomplete — partially addressed: the Hero search input's `<datalist>` suggests the 25 Nat Geo destination names, but that's a fixed curated list, not real autocomplete against the full listings/hotels/restaurants catalog (which would need a dedicated suggestions endpoint as the catalog grows beyond a browsable size).
- Personalized recommendations ("Travelers who viewed this also viewed…").
- Sitemap generation, structured data (schema.org `Product`/`Review` markup), and canonical URLs for listing/review pages — SSR/ISR is in place, but the pages aren't yet optimized for search indexing beyond basic metadata.

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

Implemented today: `User`, `RefreshToken`, `Listing` (includes a coarse `continent` enum — `NORTH_AMERICA`/`SOUTH_AMERICA`/`EUROPE`/`AFRICA`/`ASIA`/`OCEANIA` — a region label, not real geo data; no dedicated UI anymore, but still a valid query filter), `Review`, `ReviewPhoto`, `Hotel`, `Restaurant`. Target model as remaining features are built:

```
User            id, email, passwordHash, name, avatarUrl, role(traveler|owner|admin), createdAt
Listing         id, title, description, location(lat,lng,address), continent,
                priceLevel, amenities[], ownerId, createdAt
Hotel           id, name, description, location, continent, price, starClass, ownerId, createdAt
Restaurant      id, name, description, location, continent, cuisine, priceRange, ownerId, createdAt
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
