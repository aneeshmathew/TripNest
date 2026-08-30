# TripNest — Roadmap to a TripAdvisor-Class Platform

This document replaces the original project README. It audits what exists today, maps the gap to a TripAdvisor-style product, and lays out the target architecture, tech stack, and a phased build plan.

---

## 1. What Exists Today (Audit)

TripNest is currently a **static demo**, not a functioning travel platform:

| Layer | Reality |
|---|---|
| Frontend | React 18 + Vite (JavaScript, no TypeScript). 5 components, 1 route file. |
| Backend | Express server with **two apartments hardcoded in an array**. No database. |
| Data | Frontend has its own *separate* hardcoded apartment list (`frontend/src/data/apartments.js`) that doesn't match the backend's. The UI never actually calls the apartments API. |
| Auth | One hardcoded demo user (`user1@mail.com` / `user123`) checked with an `if` statement. Token is the literal string `"demo-token"`. No hashing, no sessions, no real JWT, no signup. |
| Persistence | None. Nothing survives a server restart. `localStorage` is used only for sort preference and the fake auth token. |
| Reviews / Ratings | A static `averageRating` number per listing. No review text, no reviewers, no photos, no review submission. |
| Search / Filters | None — only client-side sort (price / rating / title, asc/desc). |
| Maps / Location | None — `location` is a plain text string. |
| Media | Single hotlinked Unsplash URL per listing. No upload, no gallery. |
| Booking / Payments | None. |
| Tests | None. |
| Deployment / CI | None. |

**Bug found while reading the code:** `LoginPage.jsx` fetches `http://localhost:5001/api/auth/login`, but `backend/src/server.js` listens on port `5000` (or `process.env.PORT`). Login is broken out of the box unless someone runs a second server on 5001.

This is a fine *UI scaffolding demo* (routing, a sort modal, a login form) but has none of the backend substance of a review/listings platform yet.

---

## 2. Gap Analysis vs. a TripAdvisor-Class Product

Grouped by what actually differentiates TripAdvisor as a product — not just "add a database."

### 2.1 Core content model (biggest gap)
- **Multi-type listings**: hotels, restaurants, "things to do" / attractions, vacation rentals — not just apartments. Each type needs different attributes (cuisine, amenities, opening hours, ticket price, accessibility, etc.).
- **Reviews as first-class entities**: text, star sub-ratings (cleanliness, service, value, location), photos attached to a review, helpful votes, owner responses, verified-stay badges, review moderation/flagging.
- **Aggregate ranking logic**: TripAdvisor's core IP is its ranking algorithm (recency-weighted, quality-weighted, popularity-weighted) — not a raw average.
- **Rich media**: multi-photo galleries per listing, user-submitted photos, photo moderation.

### 2.2 Discovery
- **Full-text + faceted search** (destination, dates, price range, amenities, review score, category).
- **Geo search** — "near me," map-based browsing, radius search.
- **Autocomplete for destinations.**
- **Personalized recommendations** ("Travelers who viewed this also viewed…").
- **SEO-indexable listing/review pages** (server-side rendering or static generation — pure client-side React SPA is invisible to search engines, which is existential for a discovery product).

### 2.3 Users & trust
- Real authentication (password hashing, refresh tokens, optional OAuth/social login), email verification, password reset.
- User profiles: trip history, "Places I've been," saved/wishlist listings, review history, contribution level/badges.
- Business owner accounts (claim a listing, respond to reviews, update business info).
- Trust & safety: review authenticity checks, report/flag content, rate limiting, spam detection.

### 2.4 Transactions
- Booking/reservation flow (or at minimum outbound affiliate links, which is how TripAdvisor started).
- Availability calendars, pricing rules.
- Payments (Stripe), cancellation policies, booking confirmations/emails.

### 2.5 Platform concerns (currently zero of these exist)
- Persistent database with real schema and migrations.
- API validation, error handling, rate limiting, request logging.
- Image storage/CDN (not hotlinked third-party URLs).
- Caching layer for hot listing/search data.
- Automated tests (unit, integration, e2e) and CI/CD.
- Observability: structured logging, error tracking (Sentry), metrics/dashboards.
- Accessibility (a11y) and internationalization (i18n) — TripAdvisor is heavily localized.
- Admin/moderation dashboard.

---

## 3. Proposed Tech Stack

Core constraint from you: **React + TypeScript** on the frontend. Everything below is chosen to fit that and to match what a review/discovery platform actually needs.

### Frontend
| Concern | Choice | Why |
|---|---|---|
| Framework | **React 18 + TypeScript** | As specified. |
| Meta-framework | **Next.js (App Router)** | You need SEO for listing/review pages — a plain Vite SPA can't be crawled well. Next gives SSR/SSG/ISR, image optimization, and file-based routing while staying 100% React. |
| Data fetching / server state | **TanStack Query (React Query)** | Caching, pagination, background refetch — exactly what listing/search/review feeds need. |
| Client/UI state | **Zustand** (not Redux) | Small, low-boilerplate; Redux Toolkit is fine too if the team prefers strong conventions, but most UI state here (filters, modals) doesn't need Redux's ceremony. |
| Styling | **Tailwind CSS + shadcn/ui (Radix primitives)** | Fast to build a consistent design system; Radix gives accessible primitives (dialogs, comboboxes) out of the box — important, since the current SortModal is not accessible (no focus trap, no Escape handling). |
| Forms/validation | **React Hook Form + Zod** | Zod schemas can be shared between frontend and backend for consistent validation. |
| Maps | **Mapbox GL JS** (or Google Maps if budget allows) | Geo search and map browsing. |
| Testing | **Vitest + React Testing Library** (unit), **Playwright** (e2e) | Nothing exists today; this is greenfield. |

### Backend
| Concern | Choice | Why |
|---|---|---|
| Runtime/language | **Node.js + TypeScript** | Keep one language across the stack; share types (and Zod schemas) with the frontend via a shared package. |
| Framework | **NestJS** | The current Express app is fine for a demo but has no structure for auth guards, DI, module boundaries, or validation pipes — all of which you need at TripAdvisor's scope. NestJS gives that structure without abandoning Express under the hood. (Plain Express + a strong folder convention is a reasonable fallback if the team wants something lighter.) |
| Database | **PostgreSQL** | Reviews/ratings/bookings are inherently relational (users ↔ listings ↔ reviews ↔ photos ↔ bookings with real referential integrity and aggregate queries). This is a good reason to move off MongoDB despite the "MERN" branding — see note below. |
| ORM | **Prisma** | Type-safe queries, migrations, works cleanly with TS end-to-end. |
| Search | **Elasticsearch or Algolia/Meilisearch** | Faceted + geo + typo-tolerant search is not something Postgres `LIKE` queries can do well at scale. Start with Meilisearch (cheap, self-hostable) and graduate to Elasticsearch if needed. |
| Caching | **Redis** | Hot listing pages, session/rate-limit storage, search result caching. |
| Object storage | **S3 (or Cloudflare R2) + CDN** | User-uploaded photos, resized via a pipeline (e.g., Sharp or Cloudinary). |
| Auth | **JWT access + refresh tokens**, bcrypt/argon2 password hashing, optional OAuth (Google/Facebook) via Passport or Auth.js | Current "auth" is a hardcoded `if`. |
| Payments | **Stripe** | If/when booking is built. |
| Background jobs | **BullMQ (Redis-backed)** | Email sending, image processing, search index sync, ranking recomputation. |

> **On "should we keep MongoDB since it's a MERN app"**: Document DBs are attractive for flexible/nested data, but your core entities (listings, reviews, users, bookings) are relational with strong integrity needs (a review must belong to exactly one user and one listing; ratings must aggregate correctly; bookings must not double-book). Postgres + Prisma gives you that correctness plus easy analytics/reporting later. If the team has strong existing MongoDB expertise, MongoDB can still work — just plan denormalization and aggregation pipelines deliberately for the rating/review rollups.

### Infra
- **Docker Compose** for local dev (Postgres, Redis, Meilisearch, API, web).
- **CI/CD**: GitHub Actions → lint/typecheck/test on PR, deploy on merge.
- **Hosting**: Vercel (Next.js frontend) + a container host (Fly.io/Railway/AWS ECS) for the API, or all on AWS/GCP if you want one cloud.
- **Monitoring**: Sentry (errors), OpenTelemetry + a metrics backend (Grafana/Datadog).

---

## 4. REST vs. GraphQL — Recommendation

**Recommendation: start with REST, add GraphQL later only if a real need for it shows up — don't adopt it up front.**

### Why REST first
- Your actual near-term problem is *building the missing data model and business logic* (reviews, search, bookings), not solving an over-fetching/under-fetching problem. GraphQL solves query flexibility problems that don't exist yet with 4 hardcoded fields.
- REST + OpenAPI gives you free, mature tooling: generated TypeScript clients (`openapi-typescript`), Postman/Insomnia collections, simple CDN/HTTP caching per endpoint, simpler rate limiting and auth per-route.
- Simpler operational model: no need for query complexity limits, persisted queries, or N+1 resolver problems (which are very easy to hit in GraphQL when a listing resolver fans out to reviews → users → photos).
- Easier for a small team to reason about, test, and onboard new engineers into.

### When GraphQL genuinely earns its cost here
- If/when you build **rich, deeply nested detail pages** (a listing with reviews, each with a user, photos, and owner replies, plus "similar listings," plus map data) where different clients (web, iOS, Android) each want different subsets — GraphQL's field-level selection starts paying for itself.
- If you build a **public developer API** for partners, where flexible querying matters more than for your own first-party frontend.

### Practical middle ground
Use **REST** for the majority of the API (auth, CRUD on listings/reviews/bookings, search — search is arguably *better* served by a dedicated search API than GraphQL anyway). Optionally add a **thin GraphQL BFF (Backend-for-Frontend) layer later** that composes REST/gRPC services for complex aggregate pages, once you actually have multiple client apps competing for different data shapes. Don't build that layer speculatively.

| Criterion | REST | GraphQL |
|---|---|---|
| Time to first working feature | Faster | Slower (schema, resolvers, N+1 mitigation) |
| Fits current team size/skill (Express/Node) | Yes | Requires more upfront investment |
| Caching (CDN/HTTP) | Simple, built-in | Requires extra work (persisted queries, custom caching) |
| Multiple heterogeneous clients later | Adequate | Better |
| Complex nested detail pages | More round trips or bespoke aggregate endpoints | Natural fit |
| Public partner API | Weaker fit | Strong fit |
| Operational complexity | Lower | Higher (query cost limiting, resolver perf) |

---

## 5. Core Domain Model (target)

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

## 6. Phased Roadmap

**Phase 0 — Fix the foundation**
- Fix the login port mismatch bug; unify the frontend/backend apartment data (single source of truth).
- Migrate both frontend and backend to TypeScript.
- Stand up Postgres + Prisma; move hardcoded arrays into real tables + seed script.
- Replace fake auth with real bcrypt + JWT auth.

**Phase 1 — Core content**
- Listing detail pages with real review CRUD (text, star sub-ratings, photos).
- Rating aggregation (recompute on new review).
- Basic search/filter (category, price, rating) with Postgres full-text to start.
- Migrate frontend to Next.js for SEO on listing pages.

**Phase 2 — Discovery**
- Meilisearch/Elasticsearch integration for faceted + geo search + autocomplete.
- Map view (Mapbox), "near me."
- Wishlist/saved listings, user profile pages.

**Phase 3 — Trust & business**
- Owner accounts, claim-a-listing flow, owner responses to reviews.
- Review moderation/flagging pipeline, spam detection.
- Admin dashboard.

**Phase 4 — Transactions**
- Booking flow, availability calendars, Stripe payments, confirmation emails (via background jobs).

**Cross-cutting, throughout every phase**: tests (unit/integration/e2e) written alongside each feature, CI/CD from day one, accessibility pass on every new component, structured logging + error tracking from Phase 0 onward.

---

## 7. Phase 0 — Status: Implemented

The codebase now reflects Phase 0. What changed, concretely:

- **Login bug fixed.** The frontend used to hardcode `http://localhost:5001` while the backend listened on `5000` — login was broken out of the box. There's now a single `VITE_API_URL` env var driving the API base URL everywhere.
- **Single source of truth for listings.** The old duplicated arrays (one in `frontend/src/data/apartments.js`, a different one in `backend/src/server.js`) are gone. Listings live in Postgres and the frontend fetches them from `GET /api/listings`.
- **Both apps are TypeScript.** `frontend/src/**/*.tsx` and `backend/src/**/*.ts`, with `tsconfig.json` in both, plus `npm run typecheck` in both `package.json`s.
- **Real auth.** `bcryptjs`-hashed passwords, JWT access tokens (15 min default) + rotating, DB-backed, revocable refresh tokens (7 day default). Endpoints: `POST /api/auth/signup`, `/login`, `/refresh`, `/logout`, `GET /api/auth/me`. The frontend's `api/client.ts` attaches the access token automatically and transparently retries once via `/refresh` on a 401.
- **Postgres via Prisma**, `backend/prisma/schema.prisma` defines `User`, `RefreshToken`, `Listing`. `docker-compose.yml` at the repo root runs Postgres locally.

**Not implemented in this pass** (this sandbox has no network access, so nothing below was actually installed or run — you'll want to do this locally to verify):
- No `npm install` was run (no lockfiles were regenerated).
- `prisma generate` / `prisma migrate dev` haven't been run — no migration files exist yet under `backend/prisma/migrations/`; running `npm run db:migrate` locally will create the first one.
- No automated tests were added yet (still tracked as a cross-cutting item for every phase per section 6).

### Running Phase 0 locally

```bash
# 1. Install dependencies (root, backend, frontend)
npm run setup

# 2. Copy env files and fill in real JWT secrets
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env — set JWT_ACCESS_SECRET / JWT_REFRESH_SECRET,
# e.g. via: openssl rand -base64 48

# 3. Start Postgres
npm run db:up

# 4. Create the database schema
npm run db:migrate

# 5. Seed the demo user + listings
npm run db:seed

# 6. Run both apps
npm run dev
```

Frontend: `http://localhost:5173`. Backend: `http://localhost:5000` (`/health` for a liveness check). Demo login is still `user1@mail.com` / `user123` — now backed by a real hashed password in Postgres instead of an `if` statement.

## 8. Immediate Next Steps
1. Run the steps above locally, confirm `npm run typecheck` passes in both `backend/` and `frontend/`, and commit the first Prisma migration.
2. Add the test setup (Vitest/RTL + Playwright per section 3) — nothing is tested yet.
3. Start Phase 1: review CRUD + rating aggregation, and the Next.js migration for SEO.
