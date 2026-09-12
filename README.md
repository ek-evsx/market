# Market

Monorepo for a small marketplace app. Single-user login, small dataset.

## Structure

- `frontend/` — plain React (Vite, no Redux). `AuthContext.jsx` holds the login token
  **in memory only** (lost on reload — see Auth below) and exposes `apiFetch`, which every
  other fetch call goes through to attach it. Cart state lives in `CartContext.jsx` (React
  Context, no Redux); "My Orders" is a client-side view toggle in `App.jsx`, not a router —
  order and cart IDs are read from `localStorage`.
- `backend/src/app.js` — Express app (routes only, no `listen()`), mounts `routes/auth.js`
  (public), and `routes/items.js` / `routes/cart.js` / `routes/orders.js` behind
  `middleware/requireAuth.js`
- `backend/src/auth.js` — password hashing (`bcryptjs`) and JWT signing/verification
  (`jsonwebtoken`)
- `backend/src/index.js` — Express entry point (`listen()`), used both for local dev and as the
  Vercel service entrypoint
- `backend/src/db.js` — database client ([Turso](https://turso.tech)/libSQL via `@libsql/client`)
- `vercel.json` (repo root) — declares `frontend` and `backend` as two
  [Vercel services](https://vercel.com/docs/services) in one project, with `/api/*` routed to
  the backend and everything else to the frontend

## Auth

Single-user login, no signup UI and no public registration endpoint — the one account is
created via a script, not the API:

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=supersecret1 npm run create-user --workspace backend
```

(Don't name the var plain `USERNAME` — it's a reserved/read-only shell variable on macOS that
silently ignores overrides.) The script refuses to run if a user already exists, matching the
single-account design. Run it with `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` set to create the
account on production instead of the local SQLite file, same as seeding.

- `POST /api/auth/login` — `{ username, password }` → `{ token, expiresIn: 900 }`. The token is
  a JWT (`HS256`, 15-minute expiry) signed with `JWT_SECRET`.
- Every other endpoint (`/api/items`, `/api/carts/*`, `/api/orders/*`) requires
  `Authorization: Bearer <token>` and returns `401` if it's missing, malformed, or
  expired/invalid. `/api/health` and `/api/auth/*` stay public.
- Passwords are hashed with bcrypt (`password_hash` column) — never stored or logged in plain
  text.
- The frontend keeps the token in React state only (not `localStorage`), so a page reload — or
  the token simply expiring after 15 minutes, since there's no refresh flow — logs you out and
  shows the login page again. This was a deliberate simplicity/security tradeoff, not a bug.

Locally it falls back to an insecure dev-only constant if `JWT_SECRET` isn't set, so no setup
is required for `npm run dev:backend`. In the Vercel project's env vars it's required — the
app **throws on startup** if `JWT_SECRET` is unset with `NODE_ENV=production`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

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

Requires a valid token (see Auth above). Every cart is tied to the `user_id` of whoever
created it (`carts.user_id`, set from the JWT's `sub` claim) — a cart id is still just a random
UUID kept in `localStorage` (`market_cart_id`), but `GET`/`POST`/`PATCH`/`DELETE`/`checkout` all
scope their query by `user_id` too, so a token can only ever see its own carts. A cart that
exists but belongs to someone else 404s exactly like one that doesn't exist, which the frontend
already treats as "create a new cart" — no special-casing needed. Quantities are silently
clamped to current stock on add/update.

- `POST /api/carts` — create a cart owned by the caller, returns `{ id, items: [], total, currency }`
- `GET /api/carts/:id` — fetch a cart (404 if unknown, or owned by a different user)
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
2. In the Vercel project settings, add env vars `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and
   `JWT_SECRET`.
3. Disable **Deployment Protection** in the project settings (it's on by default for new
   projects and SSO-gates every URL with Vercel's own auth, including `/api/*` — that's on top
   of, and unrelated to, this app's own login).
4. Run the `create-user` script (see Auth above) with `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`
   set to create the one user account against production — there's no signup UI or endpoint.
