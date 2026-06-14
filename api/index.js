import {
  allowedMovieTypes,
  getTopGrossingMovies,
  sendTmdbRequest,
} from '../lib/tmdb.js';

const getPathname = (req) => {
  const route = req.query.route;

  if (Array.isArray(route) && route.length > 0) {
    return `/${route.join('/')}`;
  }

  if (typeof route === 'string' && route.length > 0) {
    return `/${route}`;
  }

  const pathname = new URL(req.url, 'http://localhost').pathname;
  return pathname === '/api' ? '/' : pathname.replace(/^\/api/, '') || '/';
};

const requireId = (req, res, label) => {
  if (req.query.id) {
    return true;
  }

  res.status(400).json({ error: `${label} id is required.` });
  return false;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const pathname = getPathname(req);

  switch (pathname) {
    case '/genres':
      await sendTmdbRequest(res, '/genre/movie/list');
      return;

    case '/movies/search':
      await sendTmdbRequest(res, '/search/movie', {
        query: req.query.q,
        page: req.query.page || 1,
      });
      return;

    case '/movies/discover':
      await sendTmdbRequest(res, '/discover/movie', {
        with_genres: req.query.with_genres,
        with_companies: req.query.with_companies,
        sort_by: req.query.sort_by,
        page: req.query.page || 1,
      });
      return;

    case '/movies/by-genre':
      await sendTmdbRequest(res, '/discover/movie', {
        with_genres: req.query.genreId,
        sort_by: req.query.sort_by || 'popularity.desc',
        primary_release_year: req.query.year,
        'vote_count.gte': req.query['vote_count.gte'] || 50,
        include_adult: false,
        include_video: false,
        page: req.query.page || 1,
      });
      return;

    case '/movies/top-grossing':
      try {
        const data = await getTopGrossingMovies(req.query.year);
        res.status(200).json(data);
      } catch (error) {
        console.error('TMDB proxy error for /movie/top-grossing:', error);
        res.status(error.status || 502).json({ error: error.message || 'Failed to reach TMDB.' });
      }
      return;

    case '/movies/by-type':
      if (!allowedMovieTypes.has(req.query.type)) {
        res.status(400).json({ error: 'Unsupported movie type.' });
        return;
      }

      await sendTmdbRequest(res, `/movie/${req.query.type}`, {
        page: req.query.page || 1,
      });
      return;

    case '/movie/details':
      if (!requireId(req, res, 'Movie')) {
        return;
      }

      await sendTmdbRequest(res, `/movie/${req.query.id}`);
      return;

    case '/movie/videos':
      if (!requireId(req, res, 'Movie')) {
        return;
      }

      await sendTmdbRequest(res, `/movie/${req.query.id}/videos`);
      return;

    case '/movie/credits':
      if (!requireId(req, res, 'Movie')) {
        return;
      }

      await sendTmdbRequest(res, `/movie/${req.query.id}/credits`);
      return;

    case '/movie/similar':
      if (!requireId(req, res, 'Movie')) {
        return;
      }

      await sendTmdbRequest(res, `/movie/${req.query.id}/similar`, {
        page: req.query.page || 1,
      });
      return;

    case '/movie/collection':
      if (!requireId(req, res, 'Collection')) {
        return;
      }

      await sendTmdbRequest(res, `/collection/${req.query.id}`);
      return;

    case '/person/details':
      if (!requireId(req, res, 'Person')) {
        return;
      }

      await sendTmdbRequest(res, `/person/${req.query.id}`);
      return;

    case '/person/movie-credits':
      if (!requireId(req, res, 'Person')) {
        return;
      }

      await sendTmdbRequest(res, `/person/${req.query.id}/movie_credits`);
      return;

    default:
      res.status(404).json({ error: 'Not found.' });
  }
}