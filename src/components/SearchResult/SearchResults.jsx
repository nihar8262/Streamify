import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { searchMovies as searchMoviesRequest } from '../../api/tmdb';
import { formatRating, formatYear, getImageUrl, trimOverview } from '../../lib/movieUtils';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [yearFilter, setYearFilter] = useState('all');
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q");

  useEffect(() => {
    setSearchInput(query || '');

    if (query) {
      searchMovies(query);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const searchMovies = async (searchQuery) => {
    try {
      setLoading(true);
      setError(null);

      const data = await searchMoviesRequest(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(searchInput.trim() ? `/search?q=${encodeURIComponent(searchInput.trim())}` : '/search');
  };

  const filteredResults = useMemo(() => {
    let nextResults = [...searchResults];

    if (minRating > 0) {
      nextResults = nextResults.filter((movie) => Number(movie.vote_average) >= minRating);
    }

    if (yearFilter !== 'all') {
      nextResults = nextResults.filter((movie) => formatYear(movie.release_date) === yearFilter);
    }

    if (sortBy === 'rating') {
      nextResults.sort((leftMovie, rightMovie) => (rightMovie.vote_average || 0) - (leftMovie.vote_average || 0));
    }

    if (sortBy === 'year') {
      nextResults.sort((leftMovie, rightMovie) => Number(formatYear(rightMovie.release_date)) - Number(formatYear(leftMovie.release_date)));
    }

    if (sortBy === 'title') {
      nextResults.sort((leftMovie, rightMovie) => (leftMovie.title || '').localeCompare(rightMovie.title || ''));
    }

    return nextResults;
  }, [minRating, searchResults, sortBy, yearFilter]);

  const yearOptions = Array.from(new Set(searchResults.map((movie) => formatYear(movie.release_date)).filter((year) => year !== 'TBA'))).sort((leftYear, rightYear) => Number(rightYear) - Number(leftYear));

  const ratingChips = [0, 6, 7, 8];

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[90%] flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/80 p-4 shadow-soft backdrop-blur-xl dark:bg-black/40 dark:shadow-none md:sticky md:top-32 md:z-20 xl:top-6">
          <div className="h-14 rounded-2xl bg-slate-200 dark:bg-white/10" />
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 w-24 shrink-0 rounded-full bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="relative overflow-hidden rounded-[24px] bg-slate-200 dark:bg-white/10">
              <div className="aspect-[2/3]" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center gap-3 px-4 text-center text-slate-900 dark:text-white">
        <h2 className="text-2xl font-semibold">Search error</h2>
        <p className="text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[90%] flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
      <section className="rounded-[32px] border border-white/10 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Search</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
              {query ? `Results for “${query}”` : 'Find your next movie'}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {filteredResults.length} results with responsive filters designed for mobile and desktop.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" /> Curated search layout
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/80 p-4 shadow-soft backdrop-blur-xl dark:bg-black/40 dark:shadow-none md:sticky md:top-32 md:z-20 xl:top-6">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 rounded-[22px] bg-slate-950 px-4 py-4 text-white dark:bg-white/10">
          <Search className="h-5 w-5 text-white/60" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title, mood, or release year"
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/45"
          />
          <button type="submit" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentSoft active:scale-[0.98]">Search</button>
        </form>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {ratingChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setMinRating(chip)}
                className={minRating === chip
                  ? 'rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow'
                  : 'rounded-full bg-slate-950/5 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-950/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'}
              >
                {chip === 0 ? 'All ratings' : `${chip}+ stars`}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 text-sm text-slate-900 outline-none dark:bg-white/10 dark:text-white">
              <option value="relevance">Sort: Relevance</option>
              <option value="rating">Sort: Rating</option>
              <option value="year">Sort: Year</option>
              <option value="title">Sort: Title</option>
            </select>

            <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 text-sm text-slate-900 outline-none dark:bg-white/10 dark:text-white">
              <option value="all">All years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {filteredResults.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/75 p-10 text-center shadow-soft dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">No movies found</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a broader query or relax the rating and year filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResults.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => navigate(`/movie/${movie.id}?from=search`)}
              className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/80 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow dark:bg-white/5 dark:shadow-none"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-white/10">
                {getImageUrl(movie.poster_path, 'w500') ? (
                  <img src={getImageUrl(movie.poster_path, 'w500')} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">⭐ {formatRating(movie.vote_average)}</div>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{movie.title}</h3>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{formatYear(movie.release_date)}</span>
                </div>
                <p className="line-clamp-3 text-xs leading-6 text-slate-600 dark:text-slate-300 sm:text-sm">{trimOverview(movie.overview, 110)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
