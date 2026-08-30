# TripNest — Product & Engineering Plan

TripNest is a travel discovery platform: browse listings (stays, and eventually restaurants/attractions), read and leave reviews, search and filter by location and preferences, and book. This document is the living plan — architecture, tech stack, and roadmap — for building it out.

---

## 1. Architecture

### Frontend
- **React 18 + TypeScript**, built with Vite.
- `src/api/` — typed API client. `client.ts` wraps `fetch`, attaches the JWT access token to requests, and transparently retries once via `/api/auth/refresh` on a 401.
- `src/types/` — shared TS types for `Listing`, `User`, `AuthResponse`, etc., matching the backend's Prisma models.
- `src/components/` — presentational components (`ApartmentCard`, `ApartmentList`, `Navbar`, `SortModal`, `LoginPage`).
- Routing via `react-router-dom`; sort preference persisted in `localStorage`.

### Backend
- **Node.js + TypeScript + Express**, organized by module (`modules/auth`, `modules/listings`), each with `routes → controller → service`.
- **PostgreSQL via Prisma** — `User`, `RefreshToken`, `Listing` models today (`backend/prisma/schema.prisma`); more models arrive as features are built (see Domain Model below).
- **Auth**: bcrypt-hashed passwords, short-lived JWT access tokens, rotating/revocable refresh tokens stored hashed in the DB. Endpoints: `POST /api/auth/{signup,login,refresh,logout}`, `GET /api/auth/me`.
- **Listings**: `GET /api/listings`, `GET /api/listings/:id` — public/unauthenticated, since listing content needs to be crawlable by search engines.
- Centralized env validation (zod), a shared error-handling middleware, and a Prisma client singleton.

### Local infra
- `docker-compose.yml` runs Postgres for local development.
- Root `package.json` scripts: `setup`, `db:up`, `db:migrate`, `db:seed`, `dev`, `typecheck`.

### Run locally
```bash
npm run setup                            # installs root, backend, frontend deps
cp backend/.env.example backend/.env     # fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
cp frontend/.env.example frontend/.env
npm run db:up                            # starts Postgres
npm run db:migrate                       # creates schema
npm run db:seed                          # seeds a demo user + listings
npm run dev                              # runs backend (:5000) + frontend (:5173)
```
Demo login: `user1@mail.com` / `user123`.

---

## 2. Feature Gaps to Close

Grouped by what actually differentiates a TripAdvisor-class product.

### 2.1 Core content model
- Multi-type listings: hotels, restaurants, attractions/"things to do," vacation rentals — each with type-specific attributes (cuisine, amenities, opening hours, ticket price, accessibility).
- Reviews as first-class entities: text, sub-ratings (cleanliness, service, value, location), photos attached to a review, helpful votes, owner responses, verified-stay badges, moderation/flagging.
- Aggregate ranking logic — a recency/quality/popularity-weighted score, not just a raw average.
- Rich media: multi-photo galleries per listing, user-submitted photos, photo moderation.

### 2.2 Discovery
- Full-text + faceted search (destination, dates, price range, amenities, review score, category).
- Geo search — "near me," map-based browsing, radius search.
- Destination autocomplete.
- Personalized recommendations ("Travelers who viewed this also viewed…").
- SEO-indexable listing/review pages — needs SSR/SSG, which means moving to Next.js (a pure client-side SPA is invisible to search engines).

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
| Meta-framework | **Next.js (App Router)** | SEO for listing/review pages requires SSR/SSG/ISR — needed before Phase 2 (Discovery). |
| Data fetching | **TanStack Query** | Caching, pagination, background refetch for listing/search/review feeds. |
| Client state | **Zustand** | Lightweight for UI state (filters, modals) — Redux Toolkit is a fine alternative if the team prefers stronger conventions. |
| Styling | **Tailwind CSS + shadcn/ui (Radix primitives)** | Fast, consistent, and accessible by default — the current `SortModal` lacks focus trapping/Escape handling, which Radix solves. |
| Forms/validation | **React Hook Form + Zod** | Schemas can be shared with the backend for consistent validation. |
| Maps | **Mapbox GL JS** | Geo search and map browsing. |
| Testing | **Vitest + React Testing Library**, **Playwright** for e2e | Nothing exists yet — needed alongside every new feature from here on. |

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
- Docker Compose for local dev (Postgres, Redis, Meilisearch, API, web).
- GitHub Actions for CI: lint/typecheck/test on PR, deploy on merge.
- Vercel for the Next.js frontend; a container host (Fly.io/Railway/AWS ECS) for the API.
- Sentry for errors; OpenTelemetry + Grafana/Datadog for metrics.

---

## 5. Domain Model

Implemented today: `User`, `RefreshToken`, `Listing`. Target model as features are built:

```
User            id, email, passwordHash, name, avatarUrl, role(traveler|owner|admin), createdAt
Listing         id, type(hotel|restaurant|attraction|rental), title, description,
                location(lat,lng,address), priceLevel, amenities[], ownerId, createdAt
ListingPhoto    id, listingId, url, uploadedByUserId, isApproved
Review          id, listingId, userId, rating, subRatings{cleanliness,service,value,location},
                title, body, stayDate, isVerifiedStay, helpfulCount, createdAt
ReviewPhoto     id, reviewId, url
OwnerResponse   id, reviewId, ownerId, body, createdAt
Booking         id, listingId, userId, dateRange, guests, status, totalPrice
Wishlist        id, userId, listingId
```

---

## 6. Roadmap

**Foundation (in place)**: TypeScript on both apps, Postgres + Prisma, real bcrypt/JWT auth with refresh tokens, listings served from the database.

**Next — Core content**
- Review CRUD (text, star sub-ratings, photos) and rating aggregation on new reviews.
- Basic search/filter (category, price, rating) via Postgres full-text search.
- Migrate the frontend to Next.js for SEO on listing pages.
- Add the test setup (Vitest/RTL + Playwright) — currently missing entirely.

**Then — Discovery**
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

---
