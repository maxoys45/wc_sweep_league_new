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

Run the frontend only:

```bash
npm run dev
```

This uses `fixtures.json` as a read-only fallback for the leaderboard.

Run with Netlify Functions:

```bash
RESULTS_PASSWORD=your-password npm run netlify:dev
```

Use this mode when testing result saves.

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
