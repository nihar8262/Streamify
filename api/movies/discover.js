import { sendTmdbRequest } from '../../lib/tmdb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  await sendTmdbRequest(res, '/discover/movie', {
    with_genres: req.query.with_genres,
    with_companies: req.query.with_companies,
    sort_by: req.query.sort_by,
    page: req.query.page || 1,
  });
}