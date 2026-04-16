import React from 'react';
import { Check, Play, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppContext } from '../../context/AppContext';
import { formatRating, formatYear, getImageUrl } from '../../lib/movieUtils';

const MoviePosterCard = ({ movie, wide = false, priority = false }) => {
  const { isSaved, toggleWatchlist } = useAppContext();
  const saved = isSaved(movie.id);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`group relative shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-white/70 shadow-soft transition duration-300 hover:scale-[1.03] hover:shadow-glow dark:bg-white/5 dark:shadow-none sm:rounded-[18px] lg:rounded-[22px] ${wide ? 'w-[150px] md:w-[220px] md:sm:w-[240px]' : 'w-[148px] sm:w-[160px] lg:w-[180px]'}`}
    >
      <div className={`relative overflow-hidden ${wide ? 'aspect-[2/3] md:aspect-[4/5]' : 'aspect-[2/3]'}`}>
        {getImageUrl(movie.poster_path) ? (
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-200 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            No poster
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70" />
        <div className="absolute inset-0 bg-accent/20 opacity-0 transition duration-300 group-hover:opacity-100" />

        <div className="absolute left-2 top-2 inline-flex items-center rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur sm:left-3 sm:top-3">
          ⭐ {formatRating(movie.vote_average)}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            toggleWatchlist(movie);
          }}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:scale-105 hover:bg-black/65 active:scale-[0.96] sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-3 px-3 pb-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:px-4 sm:pb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-950 shadow-lg">
            <Play className="h-3.5 w-3.5 fill-current" /> Play
          </div>
        </div>
      </div>

      <div className="space-y-1.5 p-3 sm:space-y-2 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{movie.title || movie.original_title}</h3>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatYear(movie.release_date)}</span>
          <span className="max-w-[70px] truncate">{movie.original_language?.toUpperCase() || 'EN'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MoviePosterCard;