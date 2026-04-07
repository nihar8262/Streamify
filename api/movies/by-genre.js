import { sendTmdbRequest } from '../../lib/tmdb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  await sendTmdbRequest(res, '/discover/movie', {
    with_genres: req.query.genreId,
    sort_by: req.query.sort_by || 'popularity.desc',
    primary_release_year: req.query.year,
    'vote_count.gte': req.query['vote_count.gte'] || 50,
    include_adult: false,
    include_video: false,
    page: req.query.page || 1,
  });
}