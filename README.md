# TripNest — Product & Engineering Plan

TripNest is a travel discovery platform: browse listings (stays, and eventually restaurants/attractions), read and leave reviews, search and filter by location and preferences, and book. This document is the living plan — architecture, tech stack, and roadmap — for building it out.

---

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

## Tech Stack

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

## Domain Model

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

---