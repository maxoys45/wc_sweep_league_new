# World Cup Sweep League

A small Vite + React site for tracking a World Cup sweep league.

## Features

- Public leaderboard at `/`.
- Password-gated results entry at `/results`.
- Scores can be added, edited, or cleared.
- Player points are calculated from assigned teams:
  - Win: 3 points.
  - Draw: 1 point.
  - Loss: 0 points.
- Deployed results are stored with Netlify Blobs through Netlify Functions.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the site locally:

```bash
npm run dev
```

In local Vite dev, result saves are stored in your browser's local storage so you can test entering multiple results without Netlify Functions.

Run with Netlify Functions:

```bash
npm run netlify:dev
```

Use this mode only when testing the deployed-style Function flow. You must set `RESULTS_PASSWORD` locally before saving results.

## Netlify Deployment

The project includes `netlify.toml` with:

- Build command: `npm run build`.
- Publish directory: `dist`.
- Functions directory: `netlify/functions`.

In Netlify, add this environment variable:

```text
RESULTS_PASSWORD=your-password
```

The first deployed read uses `fixtures.json` as seed data. After the first saved result, Netlify Blobs becomes the source of truth for fixtures.

## Deploy Previews

Netlify deploy previews and branch deploys use separate Blob stores from production, so testing result saves on a preview URL will not overwrite live production results. If the preview store is empty, it reads from the production store first so the preview starts with the current live results.

- Production store: `world-cup-sweep-league`.
- Preview/dev store: `world-cup-sweep-league-{CONTEXT}`.

You can override the store name with `FIXTURES_STORE_NAME` if you need a specific staging data store.
