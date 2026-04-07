const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

export const allowedMovieTypes = new Set(['popular', 'top_rated', 'upcoming', 'now_playing']);

const sleep = (milliseconds) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

const fetchTmdb = async (url, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError;
};

const buildTmdbUrl = (endpoint, params = {}, apiKey = process.env.TMDB_API_KEY) => {
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set('api_key', apiKey);
  return url;
};

export const requestTmdbData = async (endpoint, params = {}) => {
  if (!process.env.TMDB_API_KEY) {
    const error = new Error('TMDB_API_KEY is not configured on the server.');
    error.status = 500;
    throw error;
  }

  const response = await fetchTmdb(buildTmdbUrl(endpoint, params));
  const rawBody = await response.text();
  let data = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(data?.status_message || `TMDB request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (!data) {
    const error = new Error('TMDB returned an invalid response.');
    error.status = 502;
    throw error;
  }

  return data;
};

export const enrichMoviesWithDetails = async (movies) => {
  const enrichedMovies = [];

  for (let index = 0; index < movies.length; index += 10) {
    const chunk = movies.slice(index, index + 10);
    const chunkResults = await Promise.all(
      chunk.map(async (movie) => {
        try {
          const details = await requestTmdbData(`/movie/${movie.id}`);

          return {
            ...movie,
            revenue: details.revenue || 0,
            runtime: details.runtime,
          };
        } catch {
          return {
            ...movie,
            revenue: 0,
          };
        }
      })
    );

    enrichedMovies.push(...chunkResults);
  }

  return enrichedMovies;
};

export const getTopGrossingMovies = async (year) => {
  const discoverPages = await Promise.all(
    [1, 2, 3].map((page) => requestTmdbData('/discover/movie', {
      sort_by: 'revenue.desc',
      page,
      primary_release_year: year,
      include_adult: false,
      include_video: false,
      'vote_count.gte': 100,
    }))
  );

  const discoveredMovies = discoverPages.flatMap((response) => response.results || []);
  const uniqueMovies = Array.from(new Map(discoveredMovies.map((movie) => [movie.id, movie])).values()).slice(0, 50);
  const enrichedMovies = await enrichMoviesWithDetails(uniqueMovies);
  const rankedMovies = enrichedMovies
    .filter((movie) => movie.revenue > 0)
    .sort((leftMovie, rightMovie) => rightMovie.revenue - leftMovie.revenue)
    .slice(0, 50);

  return {
    results: rankedMovies,
    year: year || null,
  };
};

export const sendTmdbRequest = async (res, endpoint, params = {}) => {
  if (!process.env.TMDB_API_KEY) {
    res.status(500).json({ error: 'TMDB_API_KEY is not configured on the server.' });
    return;
  }

  try {
    const data = await requestTmdbData(endpoint, params);
    res.status(200).json(data);
  } catch (error) {
    console.error(`TMDB proxy error for ${endpoint}:`, error);
    res.status(error.status || 502).json({ error: error.message || 'Failed to reach TMDB.' });
  }
};