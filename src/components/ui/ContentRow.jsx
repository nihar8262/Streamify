import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import MoviePosterCard from './MoviePosterCard';

const RowSkeleton = () => (
  <div className="space-y-[14px]">
    <div className="flex items-center justify-between gap-4">
      <div className="h-7 w-40 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
    </div>
    <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2 sm:gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="relative h-[274px] w-[148px] shrink-0 overflow-hidden rounded-[14px] bg-slate-200 dark:bg-white/10 sm:h-[300px] sm:w-[180px] sm:rounded-[22px]">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer dark:via-white/10" />
        </div>
      ))}
    </div>
  </div>
);

const ContentRow = ({ title, subtitle, actionLabel = 'See All', actionTo = '/genres', movies, loading }) => {
  if (loading) {
    return <RowSkeleton />;
  }

  return (
    <section className="space-y-[14px] animate-fade-up">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        <Link
          to={actionTo}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accentSoft"
        >
          {actionLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2 sm:gap-4">
        {movies.map((movie, index) => (
          <MoviePosterCard key={movie.id} movie={movie} wide={index === 0} priority={index < 3} />
        ))}
      </div>
    </section>
  );
};

export default ContentRow;