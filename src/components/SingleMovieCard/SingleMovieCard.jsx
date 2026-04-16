import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  Globe,
  Play,
  Plus,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieVideos,
  fetchSimilarMovies,
} from '../../api/tmdb';
import { useAppContext } from '../../context/AppContext';
import {
  formatFullDate,
  formatRating,
  formatRevenue,
  formatRuntime,
  formatYear,
  getImageUrl,
  trimOverview,
} from '../../lib/movieUtils';
import MoviePosterCard from '../ui/MoviePosterCard';

const selectTrailer = (videos) => {
  const youtubeVideos = videos.filter((video) => video.site === 'YouTube');

  return youtubeVideos.find((video) => video.type === 'Trailer' && video.official)
    || youtubeVideos.find((video) => video.type === 'Trailer')
    || youtubeVideos.find((video) => video.type === 'Teaser')
    || youtubeVideos[0]
    || null;
};

const SingleMovieCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useAppContext();
  const [movieData, setMovieData] = useState(null);
  const [cast, setCast] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        setError(null);

        const [details, videosResponse, creditsResponse, similarResponse] = await Promise.all([
          fetchMovieDetails(id),
          fetchMovieVideos(id),
          fetchMovieCredits(id),
          fetchSimilarMovies(id, 1),
        ]);

        setMovieData(details);
        setTrailer(selectTrailer(videosResponse.results || []));
        setCast((creditsResponse.cast || []).slice(0, 10));
        setRelatedMovies(similarResponse.results || []);
        setCurrentPage(1);
        setHasMoreMovies((similarResponse.results || []).length > 0);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovie();
    }
  }, [id]);

  const loadMoreMovies = async () => {
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await fetchSimilarMovies(id, nextPage);
      const nextResults = response.results || [];

      if (!nextResults.length) {
        setHasMoreMovies(false);
        return;
      }

      setRelatedMovies((currentMovies) => {
        const existingIds = new Set(currentMovies.map((movie) => movie.id));
        return [...currentMovies, ...nextResults.filter((movie) => !existingIds.has(movie.id))];
      });
      setCurrentPage(nextPage);
      setHasMoreMovies(Boolean(nextResults.length));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
        <div className="relative overflow-hidden rounded-[24px] bg-slate-200 dark:bg-white/10 sm:rounded-[32px]">
          <div className="h-[420px] sm:h-[520px]" />
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
        </div>
      </div>
    );
  }

  if (error || !movieData) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Movie not available</h2>
        <p className="text-slate-500 dark:text-slate-400">{error || 'No movie data available.'}</p>
      </div>
    );
  }

  const trailerWatchUrl = trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  const trailerEmbedUrl = trailer?.key ? `https://www.youtube.com/embed/${trailer.key}` : null;
  const saved = isSaved(movieData.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
      <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black text-white shadow-glow sm:rounded-[36px]">
        <div
          className="absolute inset-0 bg-cover bg-center lg:bg-fixed"
          style={{
            backgroundImage: getImageUrl(movieData.backdrop_path, 'original')
              ? `url(${getImageUrl(movieData.backdrop_path, 'original')})`
              : 'linear-gradient(135deg, #7C5CFF, #C084FC)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-accent/20" />

        <div className="relative px-5 py-5 sm:px-8 lg:px-10 lg:py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/15 active:scale-[0.98] sm:px-4 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="mt-6 grid gap-6 px-1 sm:mt-8 sm:gap-8 sm:px-0 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end">
            <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[22px] border border-white/15 bg-white/10 p-2.5 backdrop-blur sm:max-w-[280px] sm:rounded-[28px] sm:p-3 lg:mx-0 lg:max-w-[320px]">
              {getImageUrl(movieData.poster_path) ? (
                <img
                  src={getImageUrl(movieData.poster_path)}
                  alt={movieData.title}
                  className="h-full w-full rounded-[18px] object-cover shadow-2xl sm:rounded-[22px]"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-[18px] bg-white/10 text-sm text-white/70 sm:rounded-[22px]">No poster</div>
              )}
            </div>

            <div className="min-w-0 space-y-5 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-accentSoft backdrop-blur sm:text-xs sm:tracking-[0.3em]">
                  <Sparkles className="h-3.5 w-3.5" /> Elite Detail View
                </div>
                <h1 className="break-words text-center text-[1.85rem] font-semibold leading-tight sm:text-5xl sm:leading-none lg:text-left lg:text-6xl">{movieData.title}</h1>
                <p className="text-center text-xs text-white/70 sm:text-sm lg:text-left">{formatFullDate(movieData.release_date)}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pr-1 sm:gap-3 sm:pr-0 lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><Star className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" /> {formatRating(movieData.vote_average)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {formatRuntime(movieData.runtime)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><Wallet className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4" /> {formatRevenue(movieData.revenue)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">🎬 {formatYear(movieData.release_date)}</span>
              </div>

              {movieData.genres?.length > 0 && (
                <div className="scrollbar-none flex gap-2 overflow-x-auto px-0.5 pb-1 sm:px-0">
                  {movieData.genres.map((genre) => (
                    <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur sm:px-4 sm:py-2 sm:text-sm">{genre.name}</span>
                  ))}
                </div>
              )}

              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base sm:leading-7">{trimOverview(movieData.overview, 320)}</p>

              <div className="mx-0.5 flex flex-col gap-2 rounded-[20px] border border-white/10 bg-black/35 p-3 backdrop-blur-2xl sm:mx-0 sm:flex-row sm:flex-wrap sm:gap-3 sm:rounded-[24px] sm:p-3 md:sticky md:top-32 md:z-10 xl:top-6">
                {trailerWatchUrl && (
                  <a
                    href={trailerWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100 active:scale-[0.98] sm:w-auto sm:px-5"
                  >
                    <Play className="h-4 w-4 fill-current" /> Watch Trailer
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => toggleWatchlist(movieData)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] sm:w-auto sm:px-5"
                >
                  {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {saved ? 'Saved to watchlist' : 'Add to watchlist'}
                </button>

                {movieData.homepage && (
                  <a
                    href={movieData.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] sm:w-auto sm:px-5"
                  >
                    <Globe className="h-4 w-4" /> Official Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {trailerEmbedUrl && (
        <section className="rounded-[24px] border border-white/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none sm:rounded-[32px] sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Trailer</h2>
          <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-black sm:rounded-[28px]">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={trailerEmbedUrl}
                title={`${movieData.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {cast.length > 0 && (
        <section className="rounded-[24px] border border-white/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none sm:rounded-[32px] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Cast</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The faces that shape the story.</p>
            </div>
          </div>

          <div className="scrollbar-none mt-5 flex gap-3 overflow-x-auto pb-2 sm:gap-4">
            {cast.map((person) => (
              <div key={person.cast_id || person.credit_id} className="w-[140px] shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-white/80 shadow-soft dark:bg-white/5 dark:shadow-none sm:w-[170px] sm:rounded-[24px]">
                <div className="aspect-[3/4] overflow-hidden bg-slate-200 dark:bg-white/10">
                  {getImageUrl(person.profile_path, 'w300') ? (
                    <img src={getImageUrl(person.profile_path, 'w300')} alt={person.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
                  )}
                </div>
                <div className="space-y-1 p-3 sm:p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{person.name}</h3>
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{person.character || 'Cast member'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {relatedMovies.length > 0 && (
        <section className="rounded-[24px] border border-white/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none sm:rounded-[32px] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Recommendations</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">More titles with matching tone, audience, or franchise pull.</p>
            </div>
          </div>

          <div className="scrollbar-none mt-5 flex gap-3 overflow-x-auto pb-2 sm:gap-4">
            {relatedMovies.map((movie) => (
              <MoviePosterCard key={movie.id} movie={movie} />
            ))}
          </div>

          {hasMoreMovies && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/15"
                onClick={loadMoreMovies}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load More Results'}
                {!loadingMore && <ExternalLink className="h-4 w-4" />}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SingleMovieCard;