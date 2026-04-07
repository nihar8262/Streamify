import { sendTmdbRequest } from '../lib/tmdb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  await sendTmdbRequest(res, '/genre/movie/list');
}