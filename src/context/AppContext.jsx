import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'streamify-theme';
const WATCHLIST_KEY = 'streamify-watchlist';
const MAX_WATCHLIST_ITEMS = 40;
const TOAST_TTL = 2600;

const AppContext = createContext(null);

const compactMovie = (movie) => {
  if (!movie?.id) {
    return null;
  }

  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled',
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || null,
    vote_average: Number.isFinite(movie.vote_average) ? movie.vote_average : 0,
    overview: movie.overview || '',
    savedAt: movie.savedAt || new Date().toISOString(),
  };
};

const normalizeWatchlist = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seenIds = new Set();

  return items.reduce((result, item) => {
    const normalizedMovie = compactMovie(item);

    if (!normalizedMovie || seenIds.has(normalizedMovie.id)) {
      return result;
    }

    seenIds.add(normalizedMovie.id);
    result.push(normalizedMovie);
    return result;
  }, []).slice(0, MAX_WATCHLIST_ITEMS);
};

const readTheme = () => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return localStorage.getItem(THEME_KEY) || 'dark';
};

const readWatchlist = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedValue = localStorage.getItem(WATCHLIST_KEY);
    return savedValue ? normalizeWatchlist(JSON.parse(savedValue)) : [];
  } catch {
    return [];
  }
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(readTheme);
  const [watchlist, setWatchlist] = useState(readWatchlist);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const pushToast = (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((currentToasts) => [...currentToasts, { id, message }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, TOAST_TTL);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleWatchlist = (movie) => {
    const normalizedMovie = compactMovie(movie);

    if (!normalizedMovie) {
      return;
    }

    setWatchlist((currentWatchlist) => {
      const exists = currentWatchlist.some((savedMovie) => savedMovie.id === normalizedMovie.id);

      if (exists) {
        pushToast(`${normalizedMovie.title} removed from watchlist`);
        return currentWatchlist.filter((savedMovie) => savedMovie.id !== normalizedMovie.id);
      }

      pushToast(`${normalizedMovie.title} saved to watchlist`);
      return [normalizedMovie, ...currentWatchlist].slice(0, MAX_WATCHLIST_ITEMS);
    });
  };

  const clearWatchlist = () => {
    if (!watchlist.length) {
      return;
    }

    setWatchlist([]);
    pushToast('Watchlist cleared');
  };

  const importWatchlist = (items) => {
    const normalizedItems = normalizeWatchlist(items);

    setWatchlist((currentWatchlist) => normalizeWatchlist([...normalizedItems, ...currentWatchlist]));
    pushToast(`Imported ${normalizedItems.length} watchlist item${normalizedItems.length === 1 ? '' : 's'}`);
  };

  const exportWatchlist = () => JSON.stringify(watchlist, null, 2);

  const dismissToast = (toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  };

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    watchlist,
    watchlistCount: watchlist.length,
    toggleWatchlist,
    clearWatchlist,
    importWatchlist,
    exportWatchlist,
    notify: pushToast,
    isSaved: (movieId) => watchlist.some((movie) => movie.id === movieId),
  }), [theme, watchlist]);

  return (
    <AppContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl dark:bg-black/90"
          >
            <span className="line-clamp-2">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
};