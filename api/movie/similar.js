import { sendTmdbRequest } from '../../lib/tmdb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  if (!req.query.id) {
    res.status(400).json({ error: 'Movie id is required.' });
    return;
  }

  await sendTmdbRequest(res, `/movie/${req.query.id}/similar`, {
    page: req.query.page || 1,
  });
}