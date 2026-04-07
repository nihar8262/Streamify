const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}`;
};

const request = async (path, params = {}) => {
  const response = await fetch(buildUrl(path, params));

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const errorData = await response.json();
      message = errorData.error || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
};

export const fetchMoviesByType = (type, page = 1) => request('/movies/by-type', { type, page });

export const fetchTopGrossingMovies = (year) => request('/movies/top-grossing', { year });

export const fetchMovieDetails = (id) => request('/movie/details', { id });

export const fetchMovieVideos = (id) => request('/movie/videos', { id });

export const fetchSimilarMovies = (id, page = 1) => request('/movie/similar', { id, page });

export const fetchGenres = () => request('/genres');

export const fetchMoviesByGenre = (genreId, options = {}) => request('/movies/by-genre', {
  genreId,
  page: options.page || 1,
  year: options.year,
  sort_by: options.sortBy,
});

export const searchMovies = (query, page = 1) => request('/movies/search', { q: query, page });

export const discoverMovies = (params) => request('/movies/discover', params);