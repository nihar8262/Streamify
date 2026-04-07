import { allowedMovieTypes, sendTmdbRequest } from '../../lib/tmdb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const { type } = req.query;

  if (!allowedMovieTypes.has(type)) {
    res.status(400).json({ error: 'Unsupported movie type.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${type}`, {
    page: req.query.page || 1,
  });
}