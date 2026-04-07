import { getTopGrossingMovies } from '../../lib/tmdb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const data = await getTopGrossingMovies(req.query.year);
    res.status(200).json(data);
  } catch (error) {
    console.error('TMDB proxy error for /movie/top-grossing:', error);
    res.status(error.status || 502).json({ error: error.message || 'Failed to reach TMDB.' });
  }
}