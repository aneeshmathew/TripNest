# MERN Travel App

A full-stack travel booking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It enables users to explore and sort featured apartments for short-term stays.

## Key Features

- Email/password login for demo traveler (`user1@mail.com` / `user123`)
- Featured apartment listing view
- Sort modal with criteria:
  - Price
  - Average Rating
  - Title
- Sort direction controls:
  - Ascending (`asc`)
  - Descending (`desc`)
- Only one active sorting criterion at a time
- Sorting applied immediately on "Apply Sort"
- Sort choice persisted in `localStorage`:
  - `sortOption`
  - `sortDirection`
- Sort button visible only on home page
- Apartment details page to validate state persistence after navigation

## Project Structure

- `frontend/` - React client
- `backend/` - Express API

## Run Locally

1. Install dependencies (from project root):
   - `npm run setup`
2. Start backend and frontend together:
   - `npm run dev`

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.
