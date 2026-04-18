import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { fetchGenres, fetchMoviesByGenre } from '../../api/tmdb';
import { readPageCache, writePageCache } from '../../lib/pageCache';
import { formatRating, formatYear, getImageUrl } from '../../lib/movieUtils';

const GENRE_CACHE_KEY = 'streamify:genre-explorer';
const getGenreCache = () => readPageCache(GENRE_CACHE_KEY);

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularity: Highest first' },
  { value: 'popularity.asc', label: 'Popularity: Lowest first' },
  { value: 'primary_release_date.desc', label: 'Year: Newest first' },
  { value: 'primary_release_date.asc', label: 'Year: Oldest first' },
  { value: 'title.asc', label: 'Name: A to Z' },
  { value: 'title.desc', label: 'Name: Z to A' },
  { value: 'vote_average.desc', label: 'Rating: Highest first' },
  { value: 'vote_average.asc', label: 'Rating: Lowest first' },
];

const GenreExplorer = () => {
  const navigate = useNavigate();
  const initialCacheRef = useRef(null);

  if (initialCacheRef.current === null) {
    initialCacheRef.current = getGenreCache();
  }

  const initialCache = initialCacheRef.current;
  const [genres, setGenres] = useState(initialCache?.genres || []);
  const [selectedGenreId, setSelectedGenreId] = useState(initialCache?.selectedGenreId || '');
  const [selectedYear, setSelectedYear] = useState(initialCache?.selectedYear || '');
  const [selectedSort, setSelectedSort] = useState(initialCache?.selectedSort || 'popularity.desc');
  const [currentPage, setCurrentPage] = useState(initialCache?.currentPage || 1);
  const [movies, setMovies] = useState(initialCache?.movies || []);
  const [totalPages, setTotalPages] = useState(initialCache?.totalPages || 1);
  const [totalResults, setTotalResults] = useState(initialCache?.totalResults || 0);
  const [loadingGenres, setLoadingGenres] = useState(!initialCache?.genres?.length);
  const [loadingMovies, setLoadingMovies] = useState(!initialCache?.movies?.length);
  const [error, setError] = useState(null);
  const skipInitialMovieFetchRef = useRef(Boolean(initialCache?.movies?.length && initialCache?.selectedGenreId));
  const skipInitialResetRef = useRef(Boolean(initialCache?.movies?.length && initialCache?.selectedGenreId));

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
    const loadGenres = async () => {
      if (genres.length > 0) {
        setLoadingGenres(false);
        return;
      }

      try {
        setLoadingGenres(true);
        const response = await fetchGenres();
        const fetchedGenres = response.genres || [];
        setGenres(fetchedGenres);

        if (fetchedGenres[0]) {
          setSelectedGenreId(String(fetchedGenres[0].id));
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoadingGenres(false);
      }
    };

    loadGenres();
  }, [genres.length]);

  useEffect(() => {
    const loadMovies = async () => {
      if (!selectedGenreId) {
        setMovies([]);
        setLoadingMovies(false);
        return;
      }

      if (skipInitialMovieFetchRef.current) {
        skipInitialMovieFetchRef.current = false;
        setLoadingMovies(false);
        return;
      }

      try {
        setLoadingMovies(true);
        setError(null);
        const response = await fetchMoviesByGenre(selectedGenreId, {
          page: currentPage,
          year: selectedYear || undefined,
          sortBy: selectedSort,
        });
        setMovies(response.results || []);
        setTotalPages(Math.max(1, Math.min(response.total_pages || 1, 500)));
        setTotalResults(response.total_results || 0);
      } catch (requestError) {
        setError(requestError.message);
        setMovies([]);
        setTotalPages(1);
        setTotalResults(0);
      } finally {
        setLoadingMovies(false);
      }
    };

    loadMovies();
  }, [currentPage, selectedGenreId, selectedSort, selectedYear]);

  useEffect(() => {
    if (skipInitialResetRef.current) {
      skipInitialResetRef.current = false;
      return;
    }

    setCurrentPage(1);
  }, [selectedGenreId, selectedSort, selectedYear]);

  useEffect(() => {
    writePageCache(GENRE_CACHE_KEY, {
      genres,
      selectedGenreId,
      selectedYear,
      selectedSort,
      currentPage,
      movies,
      totalPages,
      totalResults,
      scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
    });
  }, [currentPage, genres, movies, selectedGenreId, selectedSort, selectedYear, totalPages, totalResults]);

  const selectedGenre = genres.find((genre) => String(genre.id) === selectedGenreId);

  const handleGenreChange = (genreId) => {
    setSelectedGenreId(String(genreId));
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleSortChange = (event) => {
    setSelectedSort(event.target.value);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMovieClick = (movieId) => {
    writePageCache(GENRE_CACHE_KEY, {
      genres,
      selectedGenreId,
      selectedYear,
      selectedSort,
      currentPage,
      movies,
      totalPages,
      totalResults,
      scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
    });
    navigate(`/movie/${movieId}`);
  };

  const paginationPages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) {
      return true;
    }

    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="mx-auto flex w-full max-w-[90%] flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
      <section className="rounded-[32px] border border-white/10 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Genre Explorer</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">Browse by mood, genre, and tempo</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Explore movies with fast horizontal genre chips, cleaner filters, and lightweight responsive results.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <ArrowRight className="h-4 w-4" /> {totalResults} results
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none">
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
          {loadingGenres && Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-11 w-28 shrink-0 rounded-full bg-slate-200 dark:bg-white/10" />
          ))}

          {!loadingGenres && genres.map((genre) => (
            <button
              type="button"
              key={genre.id}
              className={String(genre.id) === selectedGenreId
                ? 'rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition'
                : 'rounded-full bg-slate-950/5 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-950/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'}
              onClick={() => handleGenreChange(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:w-[520px]">
          <select
            id="genre-year-filter"
            value={selectedYear}
            onChange={handleYearChange}
            className="rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 text-sm text-slate-900 outline-none dark:bg-white/10 dark:text-white"
          >
            <option value="">All years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            id="genre-sort-filter"
            value={selectedSort}
            onChange={handleSortChange}
            className="rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 text-sm text-slate-900 outline-none dark:bg-white/10 dark:text-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{selectedGenre ? selectedGenre.name : 'Movies'}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Page {currentPage} of {totalPages}</p>
        </div>
      </section>

      {loadingMovies && (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="relative overflow-hidden rounded-[24px] bg-slate-200 dark:bg-white/10">
              <div className="aspect-[2/3]" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
            </div>
          ))}
        </section>
      )}

      {!loadingMovies && !loadingGenres && error && (
        <section className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-8 text-center text-white">
          <h2 className="text-2xl font-semibold">Could not load this genre</h2>
          <p className="mt-2 text-sm text-red-100/80">{error}</p>
        </section>
      )}

      {!loadingMovies && !error && (
        <>
          <section className="grid grid-cols-2 gap-4 transition-all duration-300 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => (
              <button
                type="button"
                key={movie.id}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/80 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow dark:bg-white/5 dark:shadow-none"
                onClick={() => handleMovieClick(movie.id)}
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-white/10">
                  {getImageUrl(movie.poster_path, 'w500') ? (
                    <img src={getImageUrl(movie.poster_path, 'w500')} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">⭐ {formatRating(movie.vote_average)}</div>
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{movie.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatYear(movie.release_date)}</span>
                    <span>{formatRating(movie.vote_average)}</span>
                  </div>
                </div>
              </button>
            ))}
          </section>

          {movies.length > 0 && totalPages > 1 && (
            <section className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="scrollbar-none flex max-w-full items-center gap-2 overflow-x-auto pb-1">
                {paginationPages.map((page, index) => {
                  const previousPage = paginationPages[index - 1];
                  const shouldShowGap = previousPage && page - previousPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {shouldShowGap && <span className="px-2 text-slate-400">…</span>}
                      <button
                        type="button"
                        className={page === currentPage
                          ? 'rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow'
                          : 'rounded-full bg-slate-950/5 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-950/10 dark:bg-white/10 dark:text-slate-300'}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              <button
                type="button"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default GenreExplorer;