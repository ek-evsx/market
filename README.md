# Market

Monorepo for a small marketplace app. No auth, small dataset.

## Structure

- `frontend/` — plain React (Vite, no Redux). Cart state lives in `CartContext.jsx`
  (React Context, no Redux); "My Orders" is a client-side view toggle in `App.jsx`, not a
  router — order and cart IDs are read from `localStorage`.
- `backend/src/app.js` — Express app (routes only, no `listen()`), mounts `routes/items.js`,
  `routes/cart.js`, `routes/orders.js`
- `backend/src/index.js` — Express entry point (`listen()`), used both for local dev and as the
  Vercel service entrypoint
- `backend/src/db.js` — database client ([Turso](https://turso.tech)/libSQL via `@libsql/client`)
- `vercel.json` (repo root) — declares `frontend` and `backend` as two
  [Vercel services](https://vercel.com/docs/services) in one project, with `/api/*` routed to
  the backend and everything else to the frontend

## Database

Uses [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts), which is
SQLite-compatible:

- **Local dev**: defaults to a local file at `backend/data/market.sqlite` — no account needed.
- **Production**: set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars to point at a real
  Turso database. Because Vercel's serverless functions have no persistent local disk, production
  *must* use a real Turso database, not the local file.

One-time Turso setup:

```bash
turso db create market
turso db show market --url            # -> TURSO_DATABASE_URL
turso db tokens create market          # -> TURSO_AUTH_TOKEN
```

Turso's free tier covers this comfortably (small data, no auth, low traffic).

## Local development

```bash
npm install
npm run dev:backend   # starts Express on :3001, using the local SQLite file
npm run dev:frontend  # starts Vite on :5173, proxies /api to :3001
```

## Seeding

`backend/scripts/seed.js` drops and recreates all tables (items, carts, orders — reseeding
products would otherwise leave stale cart/order references), then inserts 50 generated items
across 6 categories (phones, earphones, laptops, tablets, TVs, smartwatches). Any existing
carts and order history are wiped when you reseed.

```bash
npm run seed --workspace backend                              # seeds the local SQLite file
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run seed --workspace backend   # seeds Turso
```

To seed via the [Turso web console](https://app.turso.tech) instead of the CLI, generate a
plain `.sql` file and paste its contents into the database's SQL console there:

```bash
npm run seed:sql --workspace backend   # writes backend/scripts/seed.sql
```

## API

`GET /api/items` — paginated (15 per page, hardcoded), supports:
- `search` — matches against name, title, and description
- `category` — one of `phones`, `earphones`, `laptops`, `tablets`, `tvs`, `smartwatches`
- `page` — 1-indexed

Response: `{ items, page, pageSize, total, totalPages }`.

### Cart

No auth — a cart is just a random UUID the client keeps in `localStorage`
(`market_cart_id`). Quantities are silently clamped to current stock on add/update.

- `POST /api/carts` — create a cart, returns `{ id, items: [], total, currency }`
- `GET /api/carts/:id` — fetch a cart (404 if unknown — the frontend creates a new one)
- `POST /api/carts/:id/items` — `{ itemId, quantity }`, adds/increments a line
- `PATCH /api/carts/:id/items/:itemId` — `{ quantity }`, sets an absolute quantity
  (`<= 0` removes the line)
- `DELETE /api/carts/:id/items/:itemId` — removes a line
- `POST /api/carts/:id/checkout` — `{ name, email }`. If any line's quantity now exceeds
  current stock, the whole purchase is rejected with `409` and a `conflicts` list (cart is
  left untouched). Otherwise: decrements `available` for each item, writes an `orders` +
  `order_items` record, deletes the old cart, and returns `{ orderId, cart }` with a **new**
  empty cart — the frontend swaps `market_cart_id` to it and appends `orderId` to the
  `market_order_ids` list in `localStorage`.

### Orders

- `GET /api/orders/:id` — one order + its line items. The "My Orders" page fetches every id
  in the client's `market_order_ids` list this way; there's no list-all-orders endpoint since
  order history is scoped to whatever this browser has bought.

## Deployment

Everything deploys to **Vercel** as a single project made of two
[services](https://vercel.com/docs/services): `frontend` (static Vite build) and `backend`
(the Express app, run directly — Vercel detects the Express framework and runs
`backend/src/index.js` as the entrypoint).

1. `npx vercel link` from the repo root (not `frontend/`) — this also connects a GitHub repo,
   so every push to `main` auto-deploys via Vercel's own GitHub integration (no GitHub Actions
   workflow needed).
2. In the Vercel project settings, add env vars `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. Since this app has no auth and is meant to be public, disable **Deployment Protection**
   in the project settings (it's on by default for new projects and SSO-gates every URL,
   including `/api/*`).
