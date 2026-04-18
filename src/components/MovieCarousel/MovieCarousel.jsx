import React, { useEffect, useState } from 'react';
import { Check, Play, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { fetchMoviesByType } from '../../api/tmdb';
import { useAppContext } from '../../context/AppContext';
import { formatFullDate, formatRating, formatYear, getImageUrl, trimOverview } from '../../lib/movieUtils';

const MovieCarousel = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useAppContext();

  useEffect(() => {
    fetchUpcomingMovies();
  }, []);

  useEffect(() => {
    if (upcomingMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === upcomingMovies.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [upcomingMovies.length]);

  const fetchUpcomingMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMoviesByType('upcoming', 1);
      
      if (data.results && data.results.length > 0) {
        setUpcomingMovies(data.results.slice(0, 16));
      } else {
        throw new Error('No upcoming movies found');
      }
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? upcomingMovies.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === upcomingMovies.length - 1 ? 0 : currentIndex + 1);
  };

  const formatDate = (dateString) => {
    return formatFullDate(dateString);
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-200/80 p-4 shadow-soft dark:bg-white/5 dark:shadow-none sm:rounded-[28px] sm:p-6 lg:rounded-[32px] lg:p-8">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_320px]">
          <div className="space-y-4">
            <div className="h-4 w-32 rounded-full bg-white/50 dark:bg-white/10" />
            <div className="h-14 w-4/5 rounded-3xl bg-white/50 dark:bg-white/10" />
            <div className="h-5 w-full rounded-full bg-white/50 dark:bg-white/10" />
            <div className="h-5 w-3/4 rounded-full bg-white/50 dark:bg-white/10" />
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-32 rounded-full bg-white/60 dark:bg-white/10" />
              <div className="h-12 w-32 rounded-full bg-white/60 dark:bg-white/10" />
            </div>
          </div>
          <div className="hidden rounded-[28px] bg-white/40 dark:bg-white/10 lg:block" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[24px] border border-red-400/20 bg-red-500/10 p-5 text-white shadow-soft sm:rounded-[28px] sm:p-6">
        <h3 className="text-lg font-semibold">Error loading hero</h3>
        <p className="mt-2 text-sm text-red-100/80">{error}</p>
        <button
          type="button"
          onClick={fetchUpcomingMovies}
          className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 active:scale-[0.98]"
        >
          Try again
        </button>
      </section>
    );
  }

  if (upcomingMovies.length === 0) {
    return (
      <section className="rounded-[24px] border border-white/10 bg-white/60 p-6 text-center shadow-soft dark:bg-white/5 dark:text-white dark:shadow-none sm:rounded-[28px] sm:p-8">
        No upcoming movies available
      </section>
    );
  }

  const currentMovie = upcomingMovies[currentIndex];
  const saved = isSaved(currentMovie.id);

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black text-white shadow-glow sm:rounded-[28px] lg:rounded-[32px]">
      <div className="absolute inset-0">
        {getImageUrl(currentMovie?.backdrop_path, 'original') ? (
          <img
            src={getImageUrl(currentMovie.backdrop_path, 'original')}
            alt={currentMovie?.title}
            className="h-full w-full object-cover blur-0 sm:blur-[1px]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent to-fuchsia-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-accent/15" />
      </div>

      <div className="relative grid min-h-[390px] gap-6 px-4 pb-5 pt-32 sm:min-h-[500px] sm:px-6 sm:py-7 lg:min-h-[580px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:px-10 lg:py-12">
        <div className="flex flex-col justify-end gap-[14px] pt-10 lg:gap-5 lg:pt-0">
          <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.26em] text-accentSoft backdrop-blur sm:px-3 sm:text-xs">
            New Release
          </div>

          <div className="space-y-3 animate-fade-up sm:space-y-4">
            <h1 className="max-w-3xl text-[1.25rem] font-semibold leading-none sm:text-5xl lg:text-6xl">{currentMovie?.title || 'Unknown Title'}</h1>
            <div className="hidden flex-wrap gap-2 text-[11px] text-white/80 sm:flex sm:gap-3 sm:text-sm">
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur sm:px-3 sm:py-2">📅 {formatYear(currentMovie?.release_date)}</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur sm:px-3 sm:py-2">⭐ {formatRating(currentMovie?.vote_average)}</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur sm:px-3 sm:py-2">🔥 Trending</span>
            </div>
            <p className="hidden line-clamp-2 max-w-xl text-[13px] leading-5 text-white/75 sm:block sm:text-base sm:leading-7">{trimOverview(currentMovie?.overview, 120)}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={() => handleMovieClick(currentMovie?.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-950 shadow-lg transition hover:bg-slate-100 active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" /> Play
            </button>
            <button
              type="button"
              onClick={() => toggleWatchlist(currentMovie)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              {saved ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} {saved ? 'Saved' : 'Watchlist'}
            </button>
          </div>
        </div>

        <div className="hidden items-end justify-end lg:flex">
          <button
            type="button"
            onClick={() => handleMovieClick(currentMovie?.id)}
            className="group relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-3 backdrop-blur transition hover:scale-[1.02]"
          >
            {getImageUrl(currentMovie?.poster_path) ? (
              <img
                src={getImageUrl(currentMovie.poster_path)}
                alt={currentMovie?.title}
                className="h-[430px] w-[290px] rounded-[22px] object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-[430px] w-[290px] items-center justify-center rounded-[22px] bg-white/10 text-sm text-white/70">No poster</div>
            )}
          </button>
        </div>

        <div className="col-span-full min-w-0 border-t border-white/10 pt-2 sm:mt-2 sm:pt-5">
          <div className="scrollbar-none flex w-full max-w-full snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pr-2 [touch-action:pan-x] [-webkit-overflow-scrolling:touch] sm:gap-3">
            {upcomingMovies.slice(0, 16).map((movie, index) => (
              <button
                type="button"
                key={movie.id}
                onClick={() => goToSlide(index)}
                className={`group relative h-[5.8rem] w-[3.9rem] shrink-0 snap-start overflow-hidden rounded-[18px] border transition sm:h-20 sm:w-36 sm:rounded-2xl ${index === currentIndex ? 'border-accent shadow-glow' : 'border-white/10 opacity-80 hover:opacity-100'}`}
              >
                {getImageUrl(movie.poster_path || movie.backdrop_path, 'w500') ? (
                  <picture className="block h-full w-full">
                    <source
                      media="(min-width: 640px)"
                      srcSet={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                    />
                    <img
                      src={getImageUrl(movie.poster_path || movie.backdrop_path, 'w500')}
                      alt={movie.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </picture>
                ) : (
                  <div className="h-full w-full bg-white/10" />
                )}
                <div className="absolute inset-0 bg-black/35" />
                <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-left text-[10px] font-medium text-white sm:bottom-2 sm:left-2 sm:right-2 sm:text-xs">{movie.title}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 hidden items-center justify-end gap-2 sm:flex">
            <button type="button" onClick={goToPrevious} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm backdrop-blur transition hover:bg-white/15 active:scale-[0.98] sm:h-10 sm:w-10 sm:text-base">❮</button>
            <button type="button" onClick={goToNext} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm backdrop-blur transition hover:bg-white/15 active:scale-[0.98] sm:h-10 sm:w-10 sm:text-base">❯</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieCarousel;