# Product Admin Dashboard

A small admin dashboard for browsing, searching, filtering, and managing a product catalog, built against the public [DummyJSON](https://dummyjson.com) API.

## Overview

Log in, browse a paginated product catalog with search/filter/sort, view product details and reviews, and add/edit/delete products. All list state (page, search, category, sort, page size) lives in the URL, so refreshing or sharing a link reproduces the same view.

## Features

- Login with validation, loading state, and clear error messages
- Protected `/products/*` routes (server-side via middleware + client-side backstop)
- Product list: table on desktop, cards on mobile, skeleton loading states
- Pagination with page numbers, Previous/Next, page-size selector, "Showing X–Y of Z"
- Debounced search (400ms) with robust stale-response protection
- Category filter and multi-field sort (price/rating/title, asc/desc)
- Full list state persisted in the URL
- Product details page with image gallery and reviews, proper "not found" state
- Add / Edit product with field-level validation
- Delete with a confirmation modal
- Client-side overlay so add/edit/delete changes persist for the session (DummyJSON doesn't actually save writes - see below)
- Invalid URL parameters are normalized rather than crashing the app
- Duplicate-request prevention on all mutating actions (login, save, delete)
- Toast feedback, empty states, and error states with retry, throughout

## Tech Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Axios

No React Query/SWR and no table/pagination libraries, per the assignment's constraints - all data-fetching and pagination logic is hand-written.

## Project Structure

```
app/
  login/page.tsx              Login page
  products/
    layout.tsx                 Auth guard + app shell wrapper
    page.tsx                   Product list (table/cards, filters, pagination)
    loading.tsx                 Route-level loading fallback
    add/page.tsx                Add product
    [id]/page.tsx                Product details
    [id]/edit/page.tsx            Edit product
  layout.tsx / globals.css / page.tsx

api/
  axiosClient.ts               The one shared Axios instance
  authApi.ts / productApi.ts   All network calls, separated from UI

components/
  layout/AppShell.tsx           Sidebar + responsive nav
  auth/LoginForm.tsx
  products/                    Table, cards, filters, pagination, form, skeletons, empty/error states, etc.
  ui/                          Button, Input, Select, Modal primitives

context/
  AuthContext.tsx               Auth state, login/logout
  ProductStoreContext.tsx       Local CRUD overlay (see below)
  ToastContext.tsx

hooks/
  useDebounce.ts
  useProducts.ts                Data fetching + stale-request protection
  useProductListState.ts        URL <-> list state

lib/
  urlParams.ts                  Normalizes/validates raw URL params
  pagination.ts / cookies.ts / constants.ts

types/index.ts                 All shared TypeScript types
middleware.ts                  Route protection
```

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Log in with:

- Username: `emilys`
- Password: `emilyspass`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the DummyJSON API | `https://dummyjson.com` |

## Running Locally

- `npm run dev` - development server
- `npm run build` - production build
- `npm start` - serve the production build
- `npm run lint` - ESLint

## API

All requests go through [DummyJSON](https://dummyjson.com), a free fake REST API. Endpoints used: `POST /auth/login`, `GET /products`, `GET /products/search`, `GET /products/category/:slug`, `GET /products/categories`, `GET /products/:id`, `POST /products/add`, `PUT /products/:id`, `DELETE /products/:id`.

## Authentication

`POST /auth/login` returns a bearer token (`accessToken`) plus a user profile. On success:

1. The token is stored in a cookie (`pad_token`) - not localStorage - so Next.js **middleware** can read it on the server and block unauthenticated requests to `/products/*` before any page renders.
2. A lightweight, non-sensitive user profile (name, email, avatar) is cached in `localStorage` purely so the UI can show "Signed in as ..." without waiting on a request.
3. `AuthContext` exposes `login`, `logout`, `isAuthenticated`, and loading/error state to the rest of the app.

Logout clears the cookie and localStorage and redirects to `/login`. If any API call ever returns `401` (expired/invalid token), the Axios response interceptor clears the cookie and hard-redirects to `/login` - this is centralized in one place rather than repeated per-page.

## Axios Architecture

Everything goes through `api/axiosClient.ts`, the single Axios instance:

- **Request interceptor** reads the token cookie and attaches `Authorization: Bearer <token>` to every request automatically. UI code never touches auth headers.
- **Response interceptor** normalizes every error (network failure, timeout, 4xx, 5xx, cancellation) into a plain `{ message, status }` object and never lets a raw `AxiosError` reach a component. It also handles the 401-logout case described above.
- `authApi.ts` and `productApi.ts` are thin, typed wrapper functions - the only place `axiosClient` is imported outside itself. Components call `productApi.getProducts(...)`, never `axios.get(...)` directly.
- Requests that can be superseded (list fetching, product detail) accept an `AbortSignal` for cancellation.

## URL State

`hooks/useProductListState.ts` treats the URL as the single source of truth for `page`, `limit`, `search`, `category`, and `sort`. There is no parallel React state for these values - the hook reads `useSearchParams()` (through the normalizer in `lib/urlParams.ts`) and writes back with `router.replace(...)`. This means:

- Refreshing the browser reproduces the exact same list.
- Copying the URL to another tab/browser reproduces the exact same list.
- There's exactly one place that can get these values "wrong," which makes the feature easy to reason about and debug.

## Search + Category Decision

DummyJSON cannot search and filter-by-category in a single request. **Decision: search takes priority, and the category filter is disabled (visibly, with a "Disabled while searching" hint) while a search term is present.** The URL still remembers the last-selected category, so clearing the search restores it.

Why this direction and not the reverse: search is the more specific, deliberate user action (typing a query), while category is a broad browsing aid. Silently dropping someone's typed search when they pick a category would feel like data loss; disabling category while search is active is the more predictable, discoverable behavior; and it keeps only one filtering endpoint in flight at a time, which also simplifies the stale-request logic.

## CRUD Persistence Limitation

DummyJSON's `add`/`edit`/`delete` endpoints are simulated: they respond as if the write succeeded (and even return a plausible id), but nothing is actually persisted server-side. A page reload against the real API would show the product catalog unchanged.

**Approach:** `context/ProductStoreContext.tsx` is a small client-side overlay (backed by `sessionStorage`, so it survives a refresh but not closing the tab) that tracks three things: added products, an id → patch map of edits, and a set of deleted ids. Every place that reads product data - the list, the detail page - passes the raw API response through `applyOverlay(...)` / `applyOverlayToOne(...)` before rendering, so:

- **Add:** the new product is prepended to page 1 of the (unfiltered) list and is fully viewable/editable at its own detail/edit URLs for the rest of the session.
- **Edit:** the patched fields are merged into whatever the API returns, everywhere that product appears.
- **Delete:** the product is filtered out of every list response, and its total count is decremented.

This is a deliberate simplification, not a full client-side database: added products only appear on page 1 (injecting them into arbitrary pages would make the `skip`/`limit` math lie), and the total count after deletions is an approximation, since we don't know which page a deleted item "really" belonged to. Documented here rather than pretending the data is truly persisted.

## Race Condition Handling

The list-fetching hook (`hooks/useProducts.ts`) protects against an older search response overwriting a newer one two ways:

1. **Cancellation:** every request carries an `AbortController` signal; starting a new request immediately aborts whatever was in flight.
2. **Stale-response id check (backstop):** a monotonically increasing ref (`requestIdRef`) is captured when a request starts. Before committing any response (success or error) to state, the hook checks that ref still matches the latest request; if not, the response is silently discarded. This covers the case where a request can't be fully cancelled in time (e.g. artificially delayed with `&delay=2000`) but still resolves after a newer one.

Tested by typing quickly (`iphone` → `iphone 15`) with `&delay=2000` appended to the API base URL temporarily; the final rendered list always matches the last-typed query, never an intermediate one.

## Invalid URL Handling

`lib/urlParams.ts` is the single funnel every raw search param passes through before any component sees it:

- `page`: must be a positive integer, otherwise defaults to `1`. (No upper clamp for very large pages like `999999` - the API is simply asked for that page, returns zero results, and the existing empty state is shown, rather than silently rewriting a URL the user may have bookmarked.)
- `limit`: must be one of `10`/`20`/`50`, otherwise defaults to `10`.
- `sort`: must be one of the known sort keys, otherwise defaults to `"default"`.
- `search`/`category`: trimmed and length-capped, otherwise empty.

Because components only ever receive the normalized `ProductListState`, a URL like `/products?page=abc&limit=hello&sort=whatever` renders exactly like `/products` - no crash, no infinite redirect loop, no unhandled exception.

## Duplicate Request Prevention

Login, Add/Edit save, and Delete all guard against rapid repeated clicks two ways, not just visually: the button's `disabled`/`isLoading` state is driven by the same boolean that gates the async handler itself (an early `if (isSubmitting) return;`/`if (isLoggingIn) return;` at the top of the handler), so even a submit triggered by pressing Enter multiple times in quick succession can't fire a second request while the first is still in flight.

## Problems Encountered & Solutions

**Problem:** DummyJSON's `/products/add` always returns a new product with `id: 101`, no matter how many times you call it or how many products already exist. Using that id directly would mean every locally-added product in a session collided on the same id, and could also collide with a real product id already in the catalog (breaking links to `/products/101`).
**Solution:** after receiving the response, the id is replaced client-side with `Date.now()` before it's stored in the overlay, guaranteeing a unique, sufficiently "obviously local" id for the rest of the session.

## AI Usage

This project was built with AI assistance (Claude). AI was used to scaffold the project structure, write the majority of the component/hook/API code, and draft this README from the implemented behavior. The prompt's required decisions (search-vs-category priority, CRUD persistence strategy, race-condition approach, invalid-URL normalization) were made deliberately and are explained above rather than left as unexplained AI output - please ask about any part of this code in review; it was written to be walked through line by line, not just to pass a checklist.

## Requirement Audit

Everything in the assignment brief is implemented as described above. Two intentionally-scoped simplifications, both documented above rather than hidden:

- Sorting is applied client-side to the current page's results (not the full catalog), because DummyJSON doesn't support `sortBy`/`order` consistently across the `/products/search` and `/products/category/:slug` endpoints used here. A fully global sort would require fetching the entire catalog client-side, which defeats the purpose of server-side pagination.
- Product statistics on the dashboard (low stock, avg. rating, etc.) are computed from the current page only, and are labeled as such in the UI - a true catalog-wide statistic isn't available without fetching everything.
