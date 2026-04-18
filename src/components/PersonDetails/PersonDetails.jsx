import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Film, MapPin, Sparkles, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchPersonDetails, fetchPersonMovieCredits } from '../../api/tmdb';
import { formatFullDate, formatYear, getImageUrl, trimOverview } from '../../lib/movieUtils';
import MoviePosterCard from '../ui/MoviePosterCard';

const getKnownForMovies = (credits) => {
  const castCredits = Array.isArray(credits?.cast) ? credits.cast : [];
  const uniqueMovies = Array.from(
    new Map(
      castCredits
        .filter((movie) => movie?.id && (movie.title || movie.original_title))
        .map((movie) => [movie.id, movie])
    ).values()
  );

  return uniqueMovies
    .sort((leftMovie, rightMovie) => {
      const leftDate = new Date(leftMovie.release_date || 0).getTime() || 0;
      const rightDate = new Date(rightMovie.release_date || 0).getTime() || 0;

      if (rightDate !== leftDate) {
        return rightDate - leftDate;
      }

      return (rightMovie.popularity || 0) - (leftMovie.popularity || 0);
    })
    .slice(0, 20);
};

const PersonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPersonData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [details, credits] = await Promise.all([
          fetchPersonDetails(id),
          fetchPersonMovieCredits(id),
        ]);

        setPerson(details);
        setRelatedMovies(getKnownForMovies(credits));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPersonData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[90%] flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
        <div className="relative overflow-hidden rounded-[24px] bg-slate-200 dark:bg-white/10 sm:rounded-[32px]">
          <div className="h-[420px] sm:h-[520px]" />
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Cast profile not available</h2>
        <p className="text-slate-500 dark:text-slate-400">{error || 'No cast data available.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[90%] flex-col gap-6 px-4 pb-28 sm:px-6 lg:px-8 xl:pb-12">
      <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black text-white shadow-glow sm:rounded-[36px]">
        <div className="absolute inset-0">
          {getImageUrl(person.profile_path, 'original') ? (
            <img
              src={getImageUrl(person.profile_path, 'original')}
              alt={person.name}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-accent to-fuchsia-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        </div>

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
              {getImageUrl(person.profile_path) ? (
                <img
                  src={getImageUrl(person.profile_path)}
                  alt={person.name}
                  className="h-full w-full rounded-[18px] object-cover shadow-2xl sm:rounded-[22px]"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-[18px] bg-white/10 text-sm text-white/70 sm:rounded-[22px]">No image</div>
              )}
            </div>

            <div className="min-w-0 space-y-5 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-accentSoft backdrop-blur sm:text-xs sm:tracking-[0.3em]">
                  <Sparkles className="h-3.5 w-3.5" /> Cast Detail View
                </div>
                <h1 className="break-words text-center text-[1.85rem] font-semibold leading-tight sm:text-5xl sm:leading-none lg:text-left lg:text-6xl">{person.name}</h1>
                <p className="text-center text-xs text-white/70 sm:text-sm lg:text-left">{person.known_for_department || 'Performer'}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pr-1 sm:gap-3 sm:pr-0 lg:justify-start">
                {person.birthday && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {formatFullDate(person.birthday)}</span>
                )}
                {person.place_of_birth && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {person.place_of_birth}</span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><Film className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {relatedMovies.length} related films</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"><Star className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" /> {Number.isFinite(person.popularity) ? person.popularity.toFixed(1) : 'N/A'}</span>
              </div>

              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base sm:leading-7">{person.biography ? trimOverview(person.biography, 900) : 'No biography available for this cast member yet.'}</p>

              <div className="grid gap-3 rounded-[20px] border border-white/10 bg-black/35 p-3 backdrop-blur-2xl sm:grid-cols-2 sm:rounded-[24px] sm:p-4 lg:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Known For</p>
                  <p className="mt-2 text-sm font-medium text-white">{person.known_for_department || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Born</p>
                  <p className="mt-2 text-sm font-medium text-white">{person.birthday ? formatYear(person.birthday) : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Also Known As</p>
                  <p className="mt-2 text-sm font-medium text-white">{person.also_known_as?.[0] || person.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:shadow-none sm:rounded-[32px] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Related Films</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Titles connected to this cast member's screen work.</p>
          </div>
        </div>

        {relatedMovies.length > 0 ? (
          <div className="scrollbar-none mt-5 flex gap-3 overflow-x-auto pb-2 sm:gap-4">
            {relatedMovies.map((movie) => (
              <MoviePosterCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/60 p-6 text-center text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
            No related films were found for this cast member.
          </div>
        )}
      </section>
    </div>
  );
};

export default PersonDetails;