# Market

Monorepo for a small marketplace app. No auth, small dataset.

## Structure

- `frontend/` — plain React (Vite, no Redux)
- `backend/` — Node.js + Express + SQLite (better-sqlite3)
- `Dockerfile` (repo root) — multi-stage build: builds the frontend, then has Express serve
  both the API and the built static files from a single container
- `fly.toml` (repo root) — Fly.io app config with a persistent volume for the SQLite file

## Local development

```bash
npm install
npm run dev:backend   # starts Express on :3001
npm run dev:frontend  # starts Vite on :5173, proxies /api to :3001
```

## Deployment

Everything deploys as a single container to **Fly.io** — one app, one origin, no CORS setup
needed, and Fly's free allowance includes persistent volume storage so the SQLite file
survives deploys.

One-time setup:

```bash
fly launch --no-deploy   # from repo root, reuses fly.toml
fly volumes create market_data --size 1
```

Then set the repo secret `FLY_API_TOKEN` (from `fly tokens create deploy`) in GitHub so
`.github/workflows/deploy.yml` can deploy automatically on every push to `main`.

To deploy manually:

```bash
fly deploy
```
