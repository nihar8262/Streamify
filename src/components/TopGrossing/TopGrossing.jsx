import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { fetchTopGrossingMovies } from '../../api/tmdb';
import { readPageCache, writePageCache } from '../../lib/pageCache';
import { formatRating, formatRevenue, formatYear, getImageUrl } from '../../lib/movieUtils';

const TOP_GROSSING_CACHE_KEY = 'streamify:top-grossing';
const getTopGrossingCache = () => readPageCache(TOP_GROSSING_CACHE_KEY);

const TopGrossing = () => {
  const navigate = useNavigate();
  const initialCacheRef = useRef(null);

  if (initialCacheRef.current === null) {
    initialCacheRef.current = getTopGrossingCache();
  }

  const initialCache = initialCacheRef.current;
  const [selectedYear, setSelectedYear] = useState(initialCache?.selectedYear || '');
  const [movies, setMovies] = useState(initialCache?.movies || []);
  const [loading, setLoading] = useState(!initialCache?.movies?.length);
  const [error, setError] = useState(null);
  const skipInitialFetchRef = useRef(Boolean(initialCache?.movies?.length));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1969 }, (_, index) => String(currentYear - index));

  useEffect(() => {
    if (typeof window !== 'undefined' && Number.isFinite(initialCache?.scrollY)) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: initialCache.scrollY, behavior: 'auto' });
      });
    }
  }, []);

  useEffect(() => {
    const loadTopGrossingMovies = async () => {
      if (skipInitialFetchRef.current) {
        skipInitialFetchRef.current = false;
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchTopGrossingMovies(selectedYear || undefined);
        setMovies(response.results || []);
      } catch (requestError) {
        setError(requestError.message);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopGrossingMovies();
  }, [selectedYear]);

  useEffect(() => {
    writePageCache(TOP_GROSSING_CACHE_KEY, {
      selectedYear,
      movies,
      scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
    });
  }, [movies, selectedYear]);

  const handleMovieClick = (movieId) => {
    writePageCache(TOP_GROSSING_CACHE_KEY, {
      selectedYear,
      movies,
      scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
    });
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[90%] flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
      <section className="rounded-[32px] border border-white/10 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Box Office Rankings</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">Top 50 highest grossing movies</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Cleaner spacing, bigger rank numbers, and a premium list treatment that feels closer to a streaming leaderboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <Trophy className="h-4 w-4" /> Revenue first
            </div>
            <select
              id="grossing-year"
              className="rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 text-sm text-slate-900 outline-none dark:bg-white/10 dark:text-white"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Showing</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{movies.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Filter</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{selectedYear || 'All'}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Sorted</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Revenue</p>
        </div>
      </section>

      {loading && (
        <section className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="relative overflow-hidden rounded-[28px] bg-slate-200 dark:bg-white/10">
              <div className="h-32" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
            </div>
          ))}
        </section>
      )}

      {!loading && error && (
        <section className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-8 text-center text-white">
          <h2 className="text-2xl font-semibold">Could not load rankings</h2>
          <p className="mt-2 text-sm text-red-100/80">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <section className="space-y-4">
          {movies.map((movie, index) => (
            <button
              type="button"
              key={movie.id}
              className="group grid w-full items-center gap-4 rounded-[28px] border border-white/10 bg-white/80 p-4 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow dark:bg-white/5 dark:shadow-none sm:grid-cols-[auto_86px_minmax(0,1fr)_auto] sm:p-5"
              onClick={() => handleMovieClick(movie.id)}
            >
              <div className="flex items-center gap-3 sm:block">
                <span className="text-4xl font-semibold leading-none text-accent sm:text-6xl">{String(index + 1).padStart(2, '0')}</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent sm:mt-3 sm:inline-flex">Rank</span>
              </div>

              <div className="overflow-hidden rounded-[20px] bg-slate-200 dark:bg-white/10">
                {getImageUrl(movie.poster_path, 'w300') ? (
                  <img src={getImageUrl(movie.poster_path, 'w300')} alt={movie.title} className="h-28 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-32" />
                ) : (
                  <div className="flex h-28 items-center justify-center text-sm text-slate-500 dark:text-slate-400 sm:h-32">No image</div>
                )}
              </div>

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{movie.title}</h2>
                  <span className="rounded-full bg-slate-950/5 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">{formatYear(movie.release_date)}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 font-medium text-amber-500">⭐ {formatRating(movie.vote_average)}</span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 font-medium text-emerald-500">💰 {formatRevenue(movie.revenue)}</span>
                </div>
              </div>

              <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-accent sm:inline-flex dark:bg-white/10">
                Open <ArrowUpRight className="h-4 w-4" />
              </span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
};

export default TopGrossing;