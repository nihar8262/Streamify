import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allowedMovieTypes,
  getTopGrossingMovies,
  sendTmdbRequest,
} from './lib/tmdb.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

if (!process.env.TMDB_API_KEY) {
  console.warn('TMDB_API_KEY is not set. API proxy requests will fail until it is configured.');
}

app.get('/api/genres', async (req, res) => {
  await sendTmdbRequest(res, '/genre/movie/list');
});

app.get('/api/movies/search', async (req, res) => {
  await sendTmdbRequest(res, '/search/movie', {
    query: req.query.q,
    page: req.query.page || 1,
  });
});

app.get('/api/movies/discover', async (req, res) => {
  await sendTmdbRequest(res, '/discover/movie', {
    with_genres: req.query.with_genres,
    with_companies: req.query.with_companies,
    sort_by: req.query.sort_by,
    page: req.query.page || 1,
  });
});

app.get('/api/movies/by-genre', async (req, res) => {
  await sendTmdbRequest(res, '/discover/movie', {
    with_genres: req.query.genreId,
    sort_by: req.query.sort_by || 'popularity.desc',
    primary_release_year: req.query.year,
    'vote_count.gte': req.query['vote_count.gte'] || 50,
    include_adult: false,
    include_video: false,
    page: req.query.page || 1,
  });
});

app.get('/api/movies/top-grossing', async (req, res) => {
  try {
    const data = await getTopGrossingMovies(req.query.year);
    res.json(data);
  } catch (error) {
    console.error('TMDB proxy error for /movie/top-grossing:', error);
    res.status(error.status || 502).json({ error: error.message || 'Failed to reach TMDB.' });
  }
});

app.get('/api/movies/by-type', async (req, res) => {
  const { type } = req.query;

  if (!allowedMovieTypes.has(type)) {
    res.status(400).json({ error: 'Unsupported movie type.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${type}`, {
    page: req.query.page || 1,
  });
});

app.get('/api/movie/details', async (req, res) => {
  if (!req.query.id) {
    res.status(400).json({ error: 'Movie id is required.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${req.query.id}`);
});

app.get('/api/movie/videos', async (req, res) => {
  if (!req.query.id) {
    res.status(400).json({ error: 'Movie id is required.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${req.query.id}/videos`);
});

app.get('/api/movie/credits', async (req, res) => {
  if (!req.query.id) {
    res.status(400).json({ error: 'Movie id is required.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${req.query.id}/credits`);
});

app.get('/api/movie/similar', async (req, res) => {
  if (!req.query.id) {
    res.status(400).json({ error: 'Movie id is required.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${req.query.id}/similar`, {
    page: req.query.page || 1,
  });
});

app.get('/api/movies/:type', async (req, res) => {
  const { type } = req.params;

  if (!allowedMovieTypes.has(type)) {
    res.status(400).json({ error: 'Unsupported movie type.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${type}`, {
    page: req.query.page || 1,
  });
});

app.get('/api/movie/:id/similar', async (req, res) => {
  await sendTmdbRequest(res, `/movie/${req.params.id}/similar`, {
    page: req.query.page || 1,
  });
});

app.get('/api/movie/:id/videos', async (req, res) => {
  await sendTmdbRequest(res, `/movie/${req.params.id}/videos`);
});

app.get('/api/movie/:id/credits', async (req, res) => {
  await sendTmdbRequest(res, `/movie/${req.params.id}/credits`);
});

app.get('/api/movie/:id', async (req, res) => {
  await sendTmdbRequest(res, `/movie/${req.params.id}`);
});

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }

  res.sendFile(path.join(distPath, 'index.html'), (error) => {
    if (error) {
      next(error);
    }
  });
});

app.listen(port, () => {
  console.log(`Streamify server listening on http://localhost:${port}`);
});