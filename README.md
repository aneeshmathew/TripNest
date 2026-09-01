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
- **Home page (`/`) has two distinct states**, not layered on top of each other: with no active search/filter, it's a full marketing front door (`Hero`, `MapSection`, `FeaturedStays`, `EasyToUseSection`, `PlanWithFriendsSection`, `RecommendationsSection`, `FaqSection`, `TestimonialSection`, `DestinationGallery`); once a search, filter, or continent is active, those marketing sections are dropped in favor of a focused `SearchFilters` + `ContinentMap` + results view. A few of those front-door sections use real data (`FeaturedStays` = real top-rated listings, `TestimonialSection` = real reviews via `GET /api/reviews/featured`, `DestinationGallery` = real listing photos linking to real listing pages); `PlanWithFriendsSection`/`RecommendationsSection` are explicitly illustrative marketing copy for features that don't exist yet (group planning, a recommendation engine) — not fabricated data pretending to be real. `FaqSection` uses native `<details>`/`<summary>` (zero client JS) with real answers about how TripNest actually works.
- **Navbar**: brand (`BrandMark`) is the only way back to `/` — there's no separate "Home" link. Center links anchor into homepage sections (`#featured-stays`, `#testimonials`, `#contact`); `Settings` and `Login`/`Logout` (+ current user email when authenticated) sit on the right.
- **Footer**: contact/about/social columns (no blog column — out of scope for now), real internal links (`/`, `/settings`, `/login`); social icons are decorative placeholders since there's no real social presence yet.
- **Theming**: CSS custom properties in `globals.css` (`--color-*`, redefined under `[data-theme="dark"]`) — components use `var(--color-*)`, not hardcoded colors. `app/layout.tsx` inlines a small blocking script (`THEME_INIT_SCRIPT`) that sets `data-theme` on `<html>` from `localStorage` (falling back to `prefers-color-scheme`) *before* React hydrates, avoiding a flash of the wrong theme on load — this is also why `<html>` has `suppressHydrationWarning`. The toggle button lives in `Navbar`.
- Browsing listings and reading reviews requires no login — public by design, for crawlability. Writing a review requires login; a user can leave at most one review per listing (enforced by the backend, reflected in the UI by hiding the form once they have one).

### Backend
- **Node.js + TypeScript + Express**, organized by module (`modules/auth`, `modules/listings`, `modules/reviews`), each with `routes → controller → service`.
- **PostgreSQL via Prisma** — `User`, `RefreshToken`, `Listing`, `Review`, `ReviewPhoto` models today (`backend/prisma/schema.prisma`); more arrive as features are built (see Domain Model below).
- **Auth**: bcrypt-hashed passwords, short-lived JWT access tokens, rotating/revocable refresh tokens stored hashed in the DB. Endpoints: `POST /api/auth/{signup,login,refresh,logout}`, `GET /api/auth/me`.
- **Listings**: `GET /api/listings`, `GET /api/listings/:id` — public/unauthenticated, since listing content needs to be crawlable by search engines. `GET /api/listings` accepts `search` (case-insensitive match on title/location/description), `minPrice`/`maxPrice`, `minRating`, and `continent` query params — implemented as Postgres `ILIKE`/range/equality filters via Prisma rather than `tsvector` full-text search or a real geo query, since a handful of listings doesn't yet justify that complexity.
- **Reviews**: `GET/POST /api/listings/:listingId/reviews`, `PATCH/DELETE /api/reviews/:id`, `GET /api/reviews/featured` (public — top-rated reviews across all listings, powers the homepage testimonials section). Reading is public; writing requires auth and ownership (a user can only edit/delete their own review). `Listing.averageRating`/`reviewCount` are derived fields, recomputed from the actual review rows on every create/update/delete (`reviews.service.ts:recomputeListingRating`) rather than incremented in place. Review photos are URL-only for now — there's no upload/storage pipeline yet (see Feature Gaps below).
- Centralized env validation (zod), a shared error-handling middleware, and a Prisma client singleton.

### Local infra
- **Database**: a hosted Postgres connection string (e.g. [Neon](https://neon.tech), free tier) — no local database service to install or run. Prefer Neon's *direct* (non `-pooler`) connection string over its PgBouncer-pooled one; Prisma's migration engine can be finicky over pooled connections, and pooling isn't worth the complexity for local dev.
- Root `package.json` scripts: `setup`, `db:migrate`, `db:seed`, `dev`, `typecheck`, `test`, `test:e2e`.

### Testing
- **Backend** (`backend/vitest.config.ts`): Vitest unit tests co-located with the code they test — `tokens.test.ts`, `listings.schemas.test.ts`, `reviews.schemas.test.ts` test pure logic directly; `reviews.service.test.ts` mocks the Prisma client (`vi.mock("../../db/prisma.js")`) to test ownership checks and exactly when rating aggregation fires, without a real database. `app.test.ts` uses supertest against the assembled Express app for a few request-level checks (health check, 404s, validation errors, auth-required routes) — all chosen to not need a live DB. `vitest.setup.ts` stubs the env vars `config/env.ts` requires at import time, so tests don't need a real `.env`.
- **Frontend** (`frontend/vitest.config.ts`): Vitest + React Testing Library component tests, co-located with components (`StarRating`, `StarRatingInput`, `SearchFilters`, `ApartmentCard`, `ContinentMap`, `BrandMark`, `FaqSection`, `TestimonialSection`, `DestinationGallery`). `vitest.setup.tsx` mocks `next/image` and `next/link`, since both assume a full Next.js runtime (image optimization pipeline, App Router context) that doesn't exist under plain Vitest+jsdom.
- **E2E** (root `playwright.config.ts`, `e2e/`): Playwright tests against the real running stack — browsing/searching listings, the continent map filter, login/logout, and a full signup-via-API → login-via-UI → review-submission flow. Assumes the seed data is loaded; Playwright's `webServer` starts the frontend+backend dev servers but doesn't set up the database itself.
- **Coverage is a starting pattern, not comprehensive** — these are real working examples per layer (pure logic, mocked-dependency service logic, request-level integration, component rendering, full-stack e2e), not full coverage of every module. `AuthContext`, `ReviewItem`, `ReviewForm`, `LoginForm`, and the newer marketing sections (`Hero`, `EasyToUseSection`, `PlanWithFriendsSection`, `RecommendationsSection`, `Footer`) don't have unit tests yet — mocking `next/navigation`'s `useRouter` is the next piece needed for the auth-dependent ones.
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
- Multi-type listings: hotels, restaurants, attractions/"things to do," vacation rentals — each with type-specific attributes (cuisine, amenities, opening hours, ticket price, accessibility).
- Reviews: basic text + sub-ratings (cleanliness, service, value, location) CRUD is built. Still missing: photo upload (photos are URL-only today, no storage pipeline), helpful votes, owner responses, verified-stay badges, moderation/flagging.
- Aggregate ranking logic — average rating is now computed from real review data, but it's a plain average; a recency/quality/popularity-weighted ranking score is still open.
- Rich media: multi-photo galleries per listing, user-submitted photos, photo moderation.

### 2.2 Discovery
- Basic search/filter (keyword, price range, minimum rating) is built via Postgres `ILIKE`/range queries. Still missing: faceted search (amenities, category — moot until multi-type listings exist), geo search ("near me", radius), destination autocomplete, and relevance ranking (current matching has no scoring, just filters).
- Geo search — "near me," radius search, or a real interactive pannable/zoomable map. A coarse continent-click filter exists (`ContinentMap`, a stylized SVG selector, not real lat/lng geo data) — see Architecture above.
- Destination autocomplete.
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
- Automated tests (unit, integration, e2e) and CI/CD — none exist yet.
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

Implemented today: `User`, `RefreshToken`, `Listing` (now includes a coarse `continent` enum — `NORTH_AMERICA`/`SOUTH_AMERICA`/`EUROPE`/`AFRICA`/`ASIA`/`OCEANIA` — used by the continent map click-filter; this is a region label, not real geo data), `Review`, `ReviewPhoto`. Target model as remaining features are built:

```
User            id, email, passwordHash, name, avatarUrl, role(traveler|owner|admin), createdAt
Listing         id, type(hotel|restaurant|attraction|rental), title, description,
                location(lat,lng,address), continent, priceLevel, amenities[], ownerId, createdAt
ListingPhoto    id, listingId, url, uploadedByUserId, isApproved
Review          id, listingId, userId, rating, subRatings{cleanliness,service,value,location},
                title, body, stayDate, isVerifiedStay, helpfulCount, createdAt
ReviewPhoto     id, reviewId, url
OwnerResponse   id, reviewId, ownerId, body, createdAt
Booking         id, listingId, userId, dateRange, guests, status, totalPrice
Wishlist        id, userId, listingId
```

Real `lat`/`lng` geo data (for actual "near me"/radius search, not just continent-level filtering) is still a Discovery-phase item — see Feature Gaps below.

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
