# TripNest Frontend

The Next.js frontend for TripNest — a travel platform covering curated destinations, apartments,
hotels, restaurants, and activities, with real user accounts and reviews. This repo is the frontend
half of a split repo; the Express + Prisma API it talks to lives in a separate `TripNest_Backend`
repo.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Meta-framework | Next.js (App Router) — Server Components with SSR/ISR on listing/destination/activity pages |
| Client-side API layer | Hand-rolled `fetch` wrapper (`src/api/`) with JWT attach + one-shot refresh-on-401 |
| State | React Context (`AuthProvider`, `ThemeProvider`) |
| Styling | Plain CSS with custom properties (`globals.css`) — no CSS framework yet |
| Icons | `lucide-react` |
| Testing | Vitest + React Testing Library (components), Playwright (e2e, against frontend + backend together) |
| Deployment | Vercel (zero-config Next.js build) |

## Getting started

### Prerequisites
- Node.js
- A running TripNest backend — either the `TripNest_Backend` repo running locally, or a deployed one

### Setup
```bash
npm install
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL, GEOAPIFY_API_KEY, UNSPLASH_ACCESS_KEY
npm run dev                    # runs on :3000, or :3001+ if 3000 is already taken
```

Make sure the backend is migrated and seeded first (see its own README) and reachable at the URL you
set for `NEXT_PUBLIC_API_URL` — this frontend has no data of its own.

Demo login: `user1@mail.com` / `user123`.

### Scripts
| Command | Does |
|---|---|
| `npm run dev` | Runs the dev server with hot reload |
| `npm run build` / `npm start` | Production build and serve — this is what Vercel runs |
| `npm run typecheck` | Type-checks with `tsc --noEmit` |
| `npm test` | Runs component/unit tests (Vitest + React Testing Library) |
| `npm run test:e2e` | Runs Playwright end-to-end tests — needs a reachable backend (see below) |

## Deploying to Vercel

Next.js deploys to Vercel with no extra config (no `vercel.json` needed here — that's only required
on the backend, which isn't a framework Vercel auto-detects).

1. **Push this repo to GitHub** and import it into a new Vercel project.
2. **Deploy the backend first** (see `TripNest_Backend`'s README) — you need its URL for the next step.
3. **Set environment variables** in this project's Settings → Environment Variables:
   - `NEXT_PUBLIC_API_URL` — the deployed backend's URL (e.g. `https://tripnest-backend.vercel.app`)
   - `GEOAPIFY_API_KEY`, `UNSPLASH_ACCESS_KEY`, `UNSPLASH_API_URL` — same values as your local `.env.local`
4. **Deploy.**
5. **Go back to the backend's Vercel project** and add this frontend's deployed URL to its
   `CORS_ORIGIN` env var — otherwise the browser will block requests to the API with a CORS error, the
   same way it does if you forget to update it for a new local dev port.

## Project structure

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router routes
│   │   ├── page.tsx              # home (marketing front door / search results)
│   │   ├── apartments/[id]/      # listing detail
│   │   ├── destinations/[slug]/  # 25 curated Nat Geo + 50 world destinations, tabbed
│   │   ├── activities/[slug]/    # curated activity types, tabbed
│   │   ├── plan/                  # free-text trip planner
│   │   ├── hotels/ restaurants/   # standalone browse pages
│   │   ├── about/ blog/ terms-of-service/ privacy-policy/  # static info pages
│   │   └── login/ signup/ settings/
│   ├── components/                # UI components (Navbar, Footer, Hero, cards, carousels, forms, etc.)
│   ├── context/                    # AuthContext, ThemeContext
│   ├── data/                        # curated static content (Nat Geo destinations, activities, destination↔activity map)
│   ├── lib/                          # server-only data fetching (listings, reviews, hotels, restaurants, geoapify, unsplash) + query parsing
│   ├── api/                           # client-only API layer (auth, reviews, token storage) — talks to the backend over NEXT_PUBLIC_API_URL
│   └── types/
├── e2e/                                # Playwright end-to-end specs (exercise frontend + backend together)
├── docs/
│   └── DEVELOPMENT.md                   # project-wide architecture, feature gaps, roadmap, status (predates the frontend/backend split)
└── playwright.config.ts
```

## Testing

- **Component tests** (Vitest + React Testing Library): co-located with components, plus a
  pure-function suite for the `/plan` query parser.
- **End-to-end** (Playwright): full browser flows — browsing/search, destinations/activities, `/plan`,
  auth, settings, theming, and a full signup → login → review-submission flow. These need a real
  backend reachable at `NEXT_PUBLIC_API_URL` (local or deployed) — Playwright's `webServer` only starts
  this frontend, not the backend.

```bash
npm test          # component/unit tests
npm run test:e2e  # Playwright e2e (needs a reachable, migrated+seeded backend)
```
