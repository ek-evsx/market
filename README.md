# Market

Monorepo for a small marketplace app. No auth, small dataset.

## Structure

- `frontend/` — plain React (Vite, no Redux)
- `backend/src/app.js` — Express app (routes only, no `listen()`)
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

`backend/scripts/seed.js` drops and recreates the `items` table, then inserts 50 generated
items across 6 categories (phones, earphones, laptops, tablets, TVs, smartwatches):

```bash
npm run seed --workspace backend                              # seeds the local SQLite file
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run seed --workspace backend   # seeds Turso
```

## API

`GET /api/items` — paginated (15 per page, hardcoded), supports:
- `search` — matches against name, title, and description
- `category` — one of `phones`, `earphones`, `laptops`, `tablets`, `tvs`, `smartwatches`
- `page` — 1-indexed

Response: `{ items, page, pageSize, total, totalPages }`.

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
