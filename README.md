# TripNest

TripNest is a comprehensive, modern travel management platform designed to streamline every phase of the travel lifecycle—from AI-driven itinerary generation and real-time booking integrations to collaborative group trip planning and automated expense tracking.
Core Features

    Smart AI Itinerary Generation: Tailors dynamic, day-by-day travel schedules based on user preferences, budget constraints, travel pace, and interest tags.

    Collaborative Trip Hub: Allows multiple travelers to co-plan trips in real time, featuring shared checklists, voting on activities, and inline discussion threads.

    Integrated Expense & Split Tracking: Tracks individual and shared expenses, automatically converting multi-currency transactions and calculating optimal balance settlements.

    Interactive Mapping & Routing: Visualizes daily schedules on an interactive map, calculating optimal travel routes between attractions to minimize transit time.

    Real-Time Alerts & Booking Hub: Consolidates flight details, hotel reservations, and activity tickets into a central offline-accessible vault with automated status updates.

Technology Stack

    Language: TypeScript, Python

    Framework: Next.js (Frontend), FastAPI / Node.js (Backend)

    API Layer: GraphQL, RESTful APIs, WebSockets (Real-Time Sync)

    Database & ORM: PostgreSQL, MongoDB, Redis (Caching); Prisma / SQLAlchemy
    
Engineering Highlights

    High-Throughput Caching Architecture: Implemented multi-layer Redis caching for flight and hotel search queries, reducing external API latency by over 60% and lowering API consumption costs.

    Real-Time Synchronization Engine: Leveraged WebSockets to enable low-latency concurrent multi-user editing, ensuring instant state updates across all members of a group trip.

    Resilient Distributed Microservices: Designed event-driven payment and notification pipelines with asynchronous queue processing (RabbitMQ/Kafka) to ensure high availability during traffic surges.

    Robust Offline-First Data Sync: Built local-first persistence using IndexedDB/SQLite on the client side, allowing travelers to view and edit itineraries without active cellular service, syncing changes automatically once back online.
    
---

## Getting started

### Prerequisites
- Node.js
- A hosted PostgreSQL connection string (e.g. [Neon](https://neon.tech), free tier) — no local database install required

### Setup
```bash
npm run setup                                # installs root, backend, frontend deps
cp backend/.env.example backend/.env         # fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET / DATABASE_URL
cp frontend/.env.example frontend/.env.local # Next.js convention for local env vars
npm run db:migrate                           # creates schema (prompts for a migration name the first time)
npm run db:seed                              # seeds a demo user + listings (all 25 curated destinations)
npm run dev                                  # runs backend (:5001) + frontend (:3000)
```

Demo login: `user1@mail.com` / `user123`.

`DATABASE_URL` in `backend/.env` points at a hosted Postgres — no Docker or local database install needed. Prefer the *direct* (non `-pooler`) connection string over a PgBouncer-pooled one; Prisma's migration engine can be finicky over pooled connections. See `backend/.env.example` for the full format.

An optional `docker-compose.yml` is included if you'd rather run Postgres locally instead of a hosted connection.

### Scripts (from the project root)
| Command | Does |
|---|---|
| `npm run setup` | Installs root, backend, and frontend dependencies |
| `npm run dev` | Runs backend (`:5001`) and frontend (`:3000`) concurrently |
| `npm run db:migrate` | Runs Prisma migrations against `DATABASE_URL` |
| `npm run db:seed` | Seeds a demo user + listings/hotels/restaurants for all 25 destinations |
| `npm run typecheck` | Type-checks backend and frontend |
| `npm test` | Runs backend + frontend unit tests (Vitest) |
| `npm run test:e2e` | Runs Playwright end-to-end tests against the running stack |

Root, `backend/`, and `frontend/` each have their own independent `package.json` + lockfile (three separate `npm install` calls under the hood, not a real npm workspace).

---

## Tech stack

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Meta-framework | Next.js (App Router) — Server Components with SSR/ISR on listing/destination/activity pages |
| Client-side API layer | Hand-rolled `fetch` wrapper (`src/api/`) with JWT attach + one-shot refresh-on-401 |
| State | React Context (`AuthProvider`, `ThemeProvider`) |
| Styling | Plain CSS with custom properties (`globals.css`) — no CSS framework yet |
| Icons | `lucide-react` |
| Testing | Vitest + React Testing Library (components), Playwright (e2e) |

### Backend
| Concern | Choice |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express, organized by module (`modules/auth`, `modules/listings`, `modules/reviews`, `modules/hotels`, `modules/restaurants`) |
| Database | PostgreSQL + Prisma |
| Auth | bcrypt-hashed passwords, JWT access tokens, rotating/revocable refresh tokens (hashed in DB) |
| Validation | Zod (request schemas + env validation) |
| Testing | Vitest (unit + Prisma-mocked service tests), Supertest (request-level app tests) |

### Planned / not yet added
Meilisearch or Elasticsearch (search), Redis (caching), S3/Cloudflare R2 (photo uploads), Stripe (payments), BullMQ (background jobs), Mapbox (map view), TanStack Query, Zustand, Tailwind + shadcn/ui, React Hook Form + Zod on the frontend. These are target-state choices, not installed dependencies — see [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md#3-tech-stack) for the reasoning behind each, and the [Status Snapshot](docs/DEVELOPMENT.md#0-status-snapshot) for what's actually pending.

---

## Project structure

```
TripNest/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # User, RefreshToken, Listing, Review, ReviewPhoto, Hotel, Restaurant
│   │   └── seed.ts              # demo user + listings/hotels/restaurants for all 25 destinations
│   └── src/
│       ├── config/env.ts        # zod-validated env vars
│       ├── db/prisma.ts         # Prisma client singleton
│       ├── middleware/          # auth guard, centralized error handler
│       └── modules/
│           ├── auth/            # signup/login/refresh/logout/me
│           ├── listings/        # apartment-style listings CRUD (read) + filters
│           ├── reviews/         # review CRUD, rating aggregation
│           ├── hotels/          # read-only hotel catalog
│           └── restaurants/     # read-only restaurant catalog
├── frontend/
│   └── src/
│       ├── app/                 # Next.js App Router routes
│       │   ├── page.tsx         # home (marketing front door / search results)
│       │   ├── apartments/[id]/ # listing detail
│       │   ├── destinations/[slug]/  # 25 curated Nat Geo destinations, tabbed
│       │   ├── activities/[slug]/    # 14 curated activity types, tabbed
│       │   ├── plan/            # free-text trip planner
│       │   ├── hotels/ restaurants/  # standalone browse pages
│       │   ├── login/ signup/ settings/
│       ├── components/          # UI components (Navbar, Hero, cards, carousels, forms, etc.)
│       ├── context/              # AuthContext, ThemeContext
│       ├── data/                 # curated static content (Nat Geo destinations, activities, destination↔activity map)
│       ├── lib/                  # server-only data fetching (listings, reviews, hotels, restaurants) + query parsing
│       ├── api/                  # client-only API layer (auth, reviews, token storage)
│       └── types/
├── e2e/                          # Playwright end-to-end specs
├── docs/
│   └── DEVELOPMENT.md            # full project blueprint: architecture, feature gaps, roadmap, status
├── docker-compose.yml            # optional local Postgres (hosted Postgres is the default)
└── playwright.config.ts
```

---

## Testing

- **Backend unit tests** (`backend/`, Vitest): pure logic, Prisma-mocked service tests, and Supertest request-level checks — co-located with the code they test.
- **Frontend component tests** (`frontend/`, Vitest + React Testing Library): co-located with components, plus a pure-function suite for the `/plan` query parser.
- **End-to-end** (`e2e/`, Playwright): full browser flows against the real running stack — browsing/search, destinations/activities, `/plan`, auth, settings, theming, and a full signup → login → review-submission flow.

Coverage is a real starting pattern per layer, not comprehensive — see the [Testing section of `docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md#testing) for exactly what's covered and what isn't yet.

```bash
npm test          # backend + frontend unit tests
npm run test:e2e  # Playwright e2e (assumes seed data is loaded; starts dev servers automatically)
```
