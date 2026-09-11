# TripNest — Product & Engineering Plan

---

## Table of Contents
0. [Status Snapshot](#0-status-snapshot)
1. [Architecture Reference](#1-architecture-reference)
2. [Feature Gaps](#2-feature-gaps)
3. [Tech Stack](#3-tech-stack)
4. [Domain Model](#4-domain-model)
5. [Roadmap](#5-roadmap)

---

## 0. Status Snapshot

**One-line status**: Core browse/search/review loop is real and working end-to-end (Postgres-backed, tested). Hotels/Restaurants/Destinations/Activities/trip-planning are real curated-content features on top of it. No bookings, payments, owner accounts, map, dedicated search engine, CI gate, or uploaded media yet.

### ✅ Completed / working today
- TypeScript across frontend (Next.js App Router) and backend (Express)
- PostgreSQL + Prisma, migrations, seed script covering 75 curated destinations (25 Nat Geo + 50 world-famous places) plus the original demo set
- Auth: bcrypt + short-lived JWT access tokens + rotating/revocable refresh tokens (hashed in DB) — signup/login/refresh/logout/me
- Listings: public read endpoints, keyword/price-range/min-rating/continent filters (Postgres `ILIKE`/range/equality — not full-text or geo)
- Hotels & Restaurants: real read-only entities, full seed coverage, own attributes (`starClass`, `cuisine`/`priceRange`/`rating`)
- Reviews: full CRUD, one review per user per listing, sub-ratings, `Listing.averageRating`/`reviewCount` recomputed from real rows, featured-reviews endpoint. Seeded reviews are authored by a pool of 10 named reviewer accounts (round-robin), separate from the `user1@mail.com` demo login account — homepage testimonials show varied names, not one repeated author
- Next.js SSR/ISR on listing, destination, and activity pages
- Destinations: 75 total (25 Nat Geo + 50 world-famous places, zero overlap), tabbed detail pages (Apartments/Hotels/Restaurants/Activities/Reviews), circular-loop top carousel + separate paginated bottom gallery (prev/next + 5 jump-to dots, all 50 world destinations, no partial-tile cutoff)
- Activities ("Trip Inspiration"): 14 curated activity types, category-pill filtering, own tabbed detail pages. Each activity is pinned to a real seeded location (`data/activityHighlights.ts`'s `location` field) that its Apartments/Hotels/Restaurants/Reviews tabs default-search by — not the activity's own name
- Standalone, search-ready browse pages for all four categories: `/apartments`, `/hotels`, `/restaurants`, `/activities` — same tab-search-form pattern as a destination/activity page's tabs, reached from the homepage's `ExploreCategories` four tiles
- `/plan` free-text trip planner — plain keyword matching (no NLP) across all 75 destinations + 14 activities, grouped-by-destination results, hands off to `/destinations/[slug]?tab=`
- BackButton (browser history, real-link fallback) on every detail page (`apartments/[id]`, `activities/[slug]`, `destinations/[slug]`) and all four standalone browse pages
- Theming (light/dark via CSS vars, no-flash-of-wrong-theme init script, light is default), responsive breakpoints, no UI framework
- All buttons (`.primary-btn`/`.secondary-btn`) are flat/outlined — border + transparent background, no solid fill; subtle background tint on hover only
- Navbar account dropdown (Settings/Logout only), `/settings` page
- Test scaffolding with real examples per layer (Vitest unit — backend, Vitest+RTL component — frontend, Playwright e2e) — pattern established, **not comprehensive coverage**

### 🟡 Partially done / honest approximations
- "Activities" are a keyword-search approximation against existing Listings/Hotels/Restaurants — no real `Attraction`/`Activity` model or tagging yet
- Restaurant/Hotel ratings are curated seed values, not guest-review-derived (neither has a review system yet)
- Category-pill filtering on the Activities strip is static client-side array filtering, not a real faceted backend query
- `continent` filter exists and works but has no UI entry point (the old `ContinentMap` was removed)
- Automated tests exist but nothing enforces them — no CI gate blocks a merge on failing tests yet
- The 50 world destinations' images are seeded `picsum.photos` placeholders (stable per slug), not hand-picked real photography — real per-destination photos would need sourcing, same caveat as the rest of the app's hotlinked images

### ⛔ Not started
- Real geo data (`lat`/`lng`), map view, "near me" / radius search
- Dedicated search engine (Meilisearch/Elasticsearch), faceted search, relevance ranking beyond plain filters
- Wishlist/saved listings, user profile pages (trip history, review history, badges)
- Owner accounts, claim-a-listing flow, owner responses to reviews
- Review moderation/flagging, spam detection, verified-stay badges, helpful votes
- Photo upload/storage pipeline (all photos are URL-only today — no S3/Cloudinary)
- Booking flow, availability calendars, Stripe payments, confirmation emails
- Admin/moderation dashboard
- Redis caching layer, background jobs (BullMQ)
- Observability (Sentry, structured logging, metrics/dashboards)
- SEO extras: sitemap, schema.org structured data, canonical URLs (basic metadata only today)
- Destination/search autocomplete against the live catalog
- Personalized recommendations (homepage section is illustrative marketing copy only, no engine behind it)
- Accessibility (a11y) audit and internationalization (i18n)
- OAuth/social login, email verification, password reset

### Suggested next steps (priority order)
1. **Close the CI gap** — wire up GitHub Actions to run `npm test`/`typecheck`/`test:e2e` on PRs; nothing blocks a merge on failure today even though the tests exist.
2. **Wishlist/saved listings + user profile pages** — smallest Discovery-phase item, no new infra required.
3. **Real `Attraction`/`Activity` model** — replaces the keyword-search approximation.
4. **Image storage pipeline** (S3/R2 + Sharp) — blocks user-submitted review photos and moving off hotlinked/placeholder images.
5. **Owner accounts + claim-a-listing** — unlocks the Trust & Business phase.
6. Everything else follows the phase order in [Roadmap](#5-roadmap), with [Platform concerns](#platform-concerns) picked up opportunistically alongside whichever feature touches them.

---

## 1. Architecture Reference

### Frontend
React 18 + TypeScript, Next.js App Router (SSR/ISR). Listing/destination/activity browse and detail pages are Server Components — content is in the initial HTML, not fetched client-side after hydration.

**Routes** (`src/app/`)

| Route | What it is | Notes |
|---|---|---|
| `/` | Marketing homepage, or search results if `?search=` is set | Two distinct states, not layered |
| `/apartments` | Standalone apartments browse+search | `ExploreCategories` tile target |
| `/apartments/[id]` | Listing detail | `generateMetadata` + `generateStaticParams`, BackButton |
| `/hotels`, `/restaurants` | Standalone browse+search | Same pattern as `/apartments` |
| `/activities` | Standalone curated-activity browse+search | Filters `data/activityHighlights.ts` client-side, no backend call |
| `/activities/[slug]` | Activity detail, tabbed (Apartments/Hotels/Restaurants/Reviews) | Default tab keyword = the activity's real `location`, not its name; BackButton |
| `/destinations/[slug]` | Destination detail, tabbed (Apartments/Hotels/Restaurants/Activities/Reviews) | `?tab=`-driven; `generateStaticParams` pre-renders all 75; BackButton |
| `/plan` | Free-text trip planner results | No backend call — pure static-data lookup until "Find" is clicked |
| `/login`, `/signup`, `/settings` | Auth + account | |

**Data fetching**
- `src/lib/listings.ts`, `hotels.ts`, `restaurants.ts`, `reviews.ts` — server-only fetchers, ISR-cached (60s for listings/hotels/restaurants, `no-store` for reviews so edits show immediately; `getFeaturedReviews` is 5-min ISR)
- `src/api/` — client-only layer for auth + review mutations; `client.ts` attaches the JWT and retries once via `/api/auth/refresh` on 401

**Key data files** (`src/data/`)
| File | Contents |
|---|---|
| `natGeoDestinations.ts` | 25 curated Nat Geo destinations (editorial content, real published list) |
| `worldDestinations.ts` | 50 household-name world destinations, zero slug overlap with the above |
| `allDestinations.ts` | Merged 75 — used for `/destinations/[slug]` routing/lookup and `/plan` matching |
| `activityHighlights.ts` | 14 curated activities, each with a `location` field pointing at a real seeded place |
| `destinationActivitySlugs.ts` | Which of the 14 activities are curated for each of the 75 destinations (used by the destination page's Activities tab and `/plan`'s activity-only grouping) |

**Conventions an editor should know**
- A tab's search box (`.tab-search-form`) *replaces* the default keyword with whatever's typed — it never combines both, because the backend search endpoints only take one keyword string.
- Backend search is a plain Postgres `ILIKE` substring match on title/location/description — no fuzzy matching, no scoring. A seeded `location` field must contain the search term verbatim or it won't match.
- Default-tab placeholder text: `Search for <tab> nearby` on a destination/activity's own tabs (a place is already selected); `Search for <tab> nearby location` on the four standalone browse pages (no place selected yet).
- Buttons: `.primary-btn`/`.secondary-btn` are flat — border + transparent background, never a solid fill. Small icon-only controls (carousel arrows, theme toggle) are exempt.
- Horizontal-scroll carousels use a computed `flex-basis` (`--carousel-visible` CSS var) so exactly N tiles fit edge-to-edge with no partial cutoff, and need generous top/bottom padding — `overflow-x: auto` implicitly clips `overflow-y` too, so a `scale()` hover effect gets cut off without it.
- `BackButton` (`components/BackButton.tsx`) uses `router.back()` with a real `<Link>` fallback when there's no browser history — used on every detail/browse page reached from more than one place.

### Backend
Node.js + TypeScript + Express, module-per-resource (`modules/auth`, `listings`, `reviews`, `hotels`, `restaurants`), each `routes → controller → service`.

**Database**: PostgreSQL via Prisma — `User`, `RefreshToken`, `Listing`, `Review`, `ReviewPhoto`, `Hotel`, `Restaurant`.

**Endpoints**
| Method/Path | Auth | Notes |
|---|---|---|
| `POST /api/auth/{signup,login,refresh,logout}` | Public | |
| `GET /api/auth/me` | Required | |
| `GET /api/listings`, `/api/listings/:id` | Public | `search`/`minPrice`/`maxPrice`/`minRating`/`continent` filters |
| `GET /api/hotels`, `/api/hotels/:id` | Public | + `minPrice`/`maxPrice` |
| `GET /api/restaurants`, `/api/restaurants/:id` | Public | + `cuisine` |
| `GET/POST /api/listings/:listingId/reviews` | Read public, write requires auth | One review per user per listing |
| `PATCH/DELETE /api/reviews/:id` | Requires ownership | |
| `GET /api/reviews/featured` | Public | Powers homepage testimonials |

`Listing.averageRating`/`reviewCount` are recomputed from real review rows on every create/update/delete, not incremented in place. Hotels/Restaurants have no review system of their own — the destination page's Reviews tab shows matching Listing reviews only.

### Local infra
- Hosted Postgres (e.g. Neon), no Docker needed for local dev.
- `backend/prisma/seed.ts` — source of truth for all seeded content: the original demo listings, `destinationSeeds` (25 Nat Geo, one apartment/hotel/restaurant/review each), `worldDestinationSeeds` (50 world destinations, same shape), and a 10-name reviewer pool assigned round-robin.
- Root scripts: `setup`, `db:migrate`, `db:seed`, `dev`, `typecheck`, `test`, `test:e2e`.

```bash
npm run setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run db:migrate
npm run db:seed
npm run dev   # backend :5001, frontend :3000
```
Demo login: `user1@mail.com` / `user123`.

### Testing
- **Backend** (Vitest): pure-logic tests, a mocked-Prisma service test (ownership + rating-recompute logic), and a supertest request-level suite against the assembled Express app.
- **Frontend** (Vitest + RTL): component tests co-located with most components, plus a pure-function suite for `lib/parseTripQuery.ts`.
- **E2E** (Playwright): browsing/search, destination + activity tabbed pages, the four standalone browse pages, `/plan`, auth flows, theme persistence, a full signup→login→review flow.
- **Not yet covered**: `AuthContext`, `ReviewItem`, `ReviewForm`, `LoginForm`, `SignupForm`, `HotelCard`/`RestaurantCard`, `Hero`, `EasyToUseSection`, `RecommendationsSection`, `Footer`.
- Coverage is a starting pattern per layer, not comprehensive.

---

## 2. Feature Gaps

Grouped by what differentiates a TripAdvisor-class product from what exists today. See [Status Snapshot](#0-status-snapshot) for the flat checklist — this groups the same gaps by area.

### Core content model
- No real `Attraction`/`Activity` type (keyword-search approximation instead)
- No owner-submission workflow for any listing type (all curated/seeded)
- Reviews: no photo upload, helpful votes, owner responses, moderation/flagging
- Ranking is a plain average, no recency/quality/popularity weighting

### Discovery
- No faceted search, geo search ("near me"/radius), or real map
- No destination/search autocomplete against the live catalog
- No personalized recommendations engine
- No sitemap/structured data/canonical URLs beyond basic metadata

### Users & trust
- No wishlist/saved listings, user profile pages, or contribution badges
- No owner accounts, claim-a-listing, or trust/safety tooling
- No OAuth/social login, email verification, or password reset

### Transactions
- No booking/reservation flow, availability calendars, or payments

### Platform concerns
- No image storage/CDN (all photos are hotlinked or placeholder URLs)
- No caching layer, no CI/CD enforcement, no observability, no a11y/i18n pass, no admin dashboard

---

## 3. Tech Stack

### Frontend (target — items not yet adopted are noted)
| Concern | Choice | Status |
|---|---|---|
| Framework | React 18 + TypeScript, Next.js App Router | ✅ In use |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) | ⛔ Not adopted — plain CSS custom properties today |
| Data fetching | TanStack Query | ⛔ Not adopted — server-side fetchers + Next ISR today |
| Client state | Zustand | ⛔ Not adopted — React context (`AuthProvider`/`ThemeProvider`) today |
| Forms/validation | React Hook Form + Zod | ⛔ Not adopted — plain server-rendered `<form>`s today |
| Maps | Mapbox GL JS | ⛔ Not started |
| Testing | Vitest + RTL, Playwright | ✅ In use |

### Backend (target)
| Concern | Choice | Status |
|---|---|---|
| Runtime | Node.js + TypeScript, Express | ✅ In use (NestJS worth considering as module count grows) |
| Database | PostgreSQL + Prisma | ✅ In use |
| Search | Meilisearch → Elasticsearch at scale | ⛔ Not started (Postgres `ILIKE` today) |
| Caching | Redis | ⛔ Not started |
| Object storage | S3/R2 + Sharp | ⛔ Not started (hotlinked/placeholder URLs today) |
| Payments | Stripe | ⛔ Not started |
| Background jobs | BullMQ | ⛔ Not started |

### Infra (target)
- Postgres hosted (Neon), no Docker for local dev
- GitHub Actions for CI (lint/typecheck/test on PR) — ⛔ not wired up yet, tests exist but don't gate merges
- Vercel (frontend) + a container host (API) — deployment not yet configured in-repo
- Sentry + OpenTelemetry — ⛔ not started

---

## 4. Domain Model

**Implemented today**: `User`, `RefreshToken`, `Listing` (includes a coarse `continent` enum, no dedicated UI), `Review`, `ReviewPhoto`, `Hotel`, `Restaurant`.

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
`Hotel`/`Restaurant` are real but read-only (no `ownerId` workflow, no review system of their own). Real `lat`/`lng` geo data is still a Discovery-phase item.

---

## 5. Roadmap

**Foundation (in place)**: TypeScript both apps, Postgres + Prisma, bcrypt/JWT auth with refresh tokens, listings/hotels/restaurants served from the DB, SSR/ISR, review CRUD with rating aggregation, keyword+range search via URL-driven searchParams, Vitest/RTL + Playwright scaffolding (real examples, not full coverage).

**Next — Discovery**
- Meilisearch/Elasticsearch: faceted + geo search + autocomplete
- Map view (Mapbox), "near me"
- Wishlist/saved listings, user profile pages

**Then — Trust & business**
- Owner accounts, claim-a-listing, owner responses to reviews
- Review moderation/flagging, spam detection
- Admin dashboard

**Then — Transactions**
- Booking flow, availability calendars, Stripe payments, confirmation emails via background jobs

**Cross-cutting, every phase**: tests written alongside each feature, CI/CD enforced from the start, accessibility pass on every new component, structured logging + error tracking.
