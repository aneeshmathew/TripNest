# TripNest — Product & Engineering Plan

TripNest is a travel discovery platform: browse listings (stays, and eventually restaurants/attractions), read and leave reviews, search and filter by location and preferences, and book. This document is the living plan — architecture, tech stack, and roadmap — for building it out.

---

## 1. Architecture

### Frontend
- **React 18 + TypeScript**, built with **Next.js (App Router)** for SSR/ISR — listing browse and detail pages are Server Components, so content is present in the initial HTML for search engines rather than fetched client-side after hydration.
- `src/app/` — routes. `page.tsx` (home) and `apartments/[id]/page.tsx` (listing detail) are async Server Components that fetch data server-side; `apartments/[id]/page.tsx` also exports `generateMetadata` (per-listing title/description/OG tags) and `generateStaticParams` (pre-renders a page per listing, refreshed via ISR).
- `src/lib/listings.ts` — server-only listings data fetching, 60s `revalidate` (ISR). `src/lib/reviews.ts` — server-only reviews data fetching, uncached (`cache: "no-store"`) so a new/edited/deleted review is reflected immediately rather than waiting out a revalidation window.
- `src/api/` — client-only API layer for auth and review mutations (`client.ts` wraps `fetch`, attaches the JWT access token, and transparently retries once via `/api/auth/refresh` on a 401; `auth.ts`, `reviews.ts`, `tokenStorage.ts`).
- `src/context/` — `AuthProvider` (current user, login/logout) and `SortProvider` (listing sort state), both client-side, since Next needs sort state shared between the Navbar in the root layout and the home page's listing grid.
- `src/components/` — `AppShell` is the one client boundary wrapping the whole app (providers + `Navbar` + `SortModal`); `ApartmentCard`/`ApartmentList` stay server-renderable; `ListingsBrowser` applies sorting on top of server-fetched listings; `LoginForm` handles login; `ReviewsSection`/`ReviewItem`/`ReviewForm`/`StarRating`/`StarRatingInput` handle review display, submission, and inline edit/delete for the review's own author.
- Browsing listings and reading reviews requires no login — public by design, for crawlability. Writing a review requires login; a user can leave at most one review per listing (enforced by the backend, reflected in the UI by hiding the form once they have one).

### Backend
- **Node.js + TypeScript + Express**, organized by module (`modules/auth`, `modules/listings`, `modules/reviews`), each with `routes → controller → service`.
- **PostgreSQL via Prisma** — `User`, `RefreshToken`, `Listing`, `Review`, `ReviewPhoto` models today (`backend/prisma/schema.prisma`); more arrive as features are built (see Domain Model below).
- **Auth**: bcrypt-hashed passwords, short-lived JWT access tokens, rotating/revocable refresh tokens stored hashed in the DB. Endpoints: `POST /api/auth/{signup,login,refresh,logout}`, `GET /api/auth/me`.
- **Listings**: `GET /api/listings`, `GET /api/listings/:id` — public/unauthenticated, since listing content needs to be crawlable by search engines.
- **Reviews**: `GET/POST /api/listings/:listingId/reviews`, `PATCH/DELETE /api/reviews/:id`. Reading is public; writing requires auth and ownership (a user can only edit/delete their own review). `Listing.averageRating`/`reviewCount` are derived fields, recomputed from the actual review rows on every create/update/delete (`reviews.service.ts:recomputeListingRating`) rather than incremented in place. Review photos are URL-only for now — there's no upload/storage pipeline yet (see Feature Gaps below).
- Centralized env validation (zod), a shared error-handling middleware, and a Prisma client singleton.

### Local infra
- `docker-compose.yml` runs Postgres for local development.
- Root `package.json` scripts: `setup`, `db:up`, `db:migrate`, `db:seed`, `dev`, `typecheck`.

### Run locally
```bash
npm run setup                                # installs root, backend, frontend deps
cp backend/.env.example backend/.env         # fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
cp frontend/.env.example frontend/.env.local # Next.js convention for local env vars
npm run db:up                                # starts Postgres
npm run db:migrate                           # creates schema
npm run db:seed                              # seeds a demo user + listings
npm run dev                                  # runs backend (:5000) + frontend (:3000)
```
Demo login: `user1@mail.com` / `user123`.

---

## 2. Feature Gaps to Close

Grouped by what actually differentiates a TripAdvisor-class product.

### 2.1 Core content model
- Multi-type listings: hotels, restaurants, attractions/"things to do," vacation rentals — each with type-specific attributes (cuisine, amenities, opening hours, ticket price, accessibility).
- Reviews: basic text + sub-ratings (cleanliness, service, value, location) CRUD is built. Still missing: photo upload (photos are URL-only today, no storage pipeline), helpful votes, owner responses, verified-stay badges, moderation/flagging.
- Aggregate ranking logic — average rating is now computed from real review data, but it's a plain average; a recency/quality/popularity-weighted ranking score is still open.
- Rich media: multi-photo galleries per listing, user-submitted photos, photo moderation.

### 2.2 Discovery
- Full-text + faceted search (destination, dates, price range, amenities, review score, category).
- Geo search — "near me," map-based browsing, radius search.
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

Implemented today: `User`, `RefreshToken`, `Listing`, `Review`, `ReviewPhoto`. Target model as remaining features are built:

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

**Foundation (in place)**: TypeScript on both apps, Postgres + Prisma, real bcrypt/JWT auth with refresh tokens, listings served from the database, Next.js App Router with SSR/ISR on listing pages for SEO, review CRUD with rating aggregation (text + sub-ratings, one review per user per listing, average rating/count derived from real review data).

**Next — Core content**
- Basic search/filter (category, price, rating) via Postgres full-text search.
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