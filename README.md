# Streamify

## Environment Setup

Create a `.env` file in the project root:

```bash
TMDB_API_KEY=your_tmdb_api_key
PORT=3001
```

For Vercel, add `TMDB_API_KEY` in Project Settings -> Environment Variables.

## Development

```bash
npm install
npm run dev
```

This runs the Vite frontend and an Express proxy server together.

## Production

```bash
npm run build
npm run start
```

The Express server serves the built frontend and proxies `/api/*` requests to TMDB.

## Vercel Deployment

This repo is now set up for Vercel with serverless API routes under `api/` and SPA routing via `vercel.json`.

Use these project settings on Vercel:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `TMDB_API_KEY`

After deployment:

- frontend routes like `/search`, `/genres`, `/top-grossing`, and `/movie/:id` will resolve to the SPA
- backend requests to `/api/*` will run as Vercel serverless functions

Local development still uses `server.js` through `npm run dev`.

## Security Note

This removes the TMDB API key from the frontend bundle and from direct browser requests to TMDB. The browser will still show requests to your own `/api/*` endpoints in the network tab, because requests initiated by the browser cannot be hidden from the browser.
