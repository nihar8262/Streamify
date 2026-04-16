import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Download, Film, MoonStar, SunMedium, Trash2, Upload } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';

const buildPosterUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;

const Profile = () => {
  const { theme, watchlist, clearWatchlist, importWatchlist, exportWatchlist, notify } = useAppContext();
  const fileInputRef = useRef(null);
  const [sortBy, setSortBy] = useState('recent');
  const [yearFilter, setYearFilter] = useState('all');

  const availableYears = useMemo(() => {
    return [...new Set(watchlist
      .map((movie) => (movie.release_date || '').slice(0, 4))
      .filter(Boolean))].sort((left, right) => Number(right) - Number(left));
  }, [watchlist]);

  const filteredWatchlist = useMemo(() => {
    const movies = yearFilter === 'all'
      ? watchlist
      : watchlist.filter((movie) => (movie.release_date || '').startsWith(yearFilter));

    const sortedMovies = [...movies];

    if (sortBy === 'release') {
      sortedMovies.sort((left, right) => (right.release_date || '').localeCompare(left.release_date || ''));
      return sortedMovies;
    }

    sortedMovies.sort((left, right) => (right.savedAt || '').localeCompare(left.savedAt || ''));
    return sortedMovies;
  }, [sortBy, watchlist, yearFilter]);

  const handleExport = () => {
    if (!watchlist.length) {
      notify('Save movies before exporting your watchlist');
      return;
    }

    const blob = new Blob([exportWatchlist()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'streamify-watchlist.json';
    anchor.click();
    URL.revokeObjectURL(url);
    notify('Watchlist exported as JSON');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const fileText = await selectedFile.text();
      const parsedValue = JSON.parse(fileText);
      importWatchlist(parsedValue);
    } catch {
      notify('Invalid watchlist JSON file');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-28 pt-2 sm:px-6 lg:px-8 xl:pb-12">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-glow backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accentSoft">Profile</p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">Your Streamify lounge</h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Keep quick access to saved movies, manage your viewing shortlist, and switch between the cinematic dark theme and the brighter editorial light theme.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/80 px-4 py-3 text-white dark:bg-white/10 dark:text-white">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60 dark:text-white/60">
                <Bookmark className="h-4 w-4" /> Saved
              </div>
              <p className="mt-2 text-2xl font-semibold">{watchlist.length}</p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-soft dark:bg-white/10 dark:text-white dark:shadow-none">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">
                {theme === 'dark' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />} Theme
              </div>
              <p className="mt-2 text-2xl font-semibold capitalize">{theme}</p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-soft dark:bg-white/10 dark:text-white dark:shadow-none sm:col-span-1 col-span-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">
                <Film className="h-4 w-4" /> Mode
              </div>
              <p className="mt-2 text-xl font-semibold">Curated Watchlist</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Saved picks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your personal shortlist is stored locally on this device.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-accent/40 hover:text-slate-950 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <Upload className="h-4 w-4" /> Import JSON
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-accent/40 hover:text-slate-950 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
          {watchlist.length > 0 && (
            <button
              type="button"
              onClick={clearWatchlist}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 active:scale-[0.98] dark:text-red-200"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Sort</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="recent">Saved recently</option>
            <option value="release">Release year</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Year</span>
          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">All release years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <div className="rounded-2xl bg-slate-950/5 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Showing <span className="font-semibold text-slate-950 dark:text-white">{filteredWatchlist.length}</span> of <span className="font-semibold text-slate-950 dark:text-white">{watchlist.length}</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </section>

      {watchlist.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-soft dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">No saved movies yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Add movies from the hero banner, detail page, or content rows to build your personal watchlist.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accentSoft active:scale-[0.98]"
          >
            Browse movies
          </Link>
        </div>
      ) : filteredWatchlist.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-soft dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">No matches for this filter</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try switching back to all years or sorting by recently saved to see the rest of your watchlist.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWatchlist.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-200 dark:bg-slate-800">
                {buildPosterUrl(movie.backdrop_path || movie.poster_path) ? (
                  <img
                    src={buildPosterUrl(movie.backdrop_path || movie.poster_path)}
                    alt={movie.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{movie.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{movie.release_date || 'Release date unavailable'}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Saved {movie.savedAt ? new Date(movie.savedAt).toLocaleDateString() : 'recently'}</p>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-500">⭐ {Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>

                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{movie.overview || 'A saved movie waiting for your next viewing session.'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;