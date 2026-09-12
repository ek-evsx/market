# Market

Monorepo for a small marketplace app. No auth, small dataset.

## Structure

- `frontend/` — plain React (Vite, no Redux)
- `backend/src/app.js` — Express app (routes only, no `listen()`)
- `backend/src/index.js` — local dev entry point, runs the Express app with `listen()`
- `backend/src/db.js` — database client ([Turso](https://turso.tech)/libSQL via `@libsql/client`)
- `api/index.js` — Vercel serverless function entry point, just re-exports the Express app
- `vercel.json` (repo root) — builds the frontend as static output, routes `/api/*` to the
  serverless function

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

## Deployment

Everything deploys to **Vercel** as a single project: the frontend builds to static files,
and `api/index.js` becomes a serverless function handling every `/api/*` route.

1. Create a Vercel project from this repo (root directory, not `frontend/`).
2. In the Vercel project settings, add env vars `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. Add a `VERCEL_TOKEN` repo secret so `.github/workflows/deploy.yml` can deploy on push to
   `main` (or just let Vercel's own GitHub integration handle it instead of the workflow).
