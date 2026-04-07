import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../Navbar/Navbar';
import { fetchGenres, fetchMoviesByGenre } from '../../api/tmdb';
import './GenreExplorer.css';

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
  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSort, setSelectedSort] = useState('popularity.desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1969 }, (_, index) => String(currentYear - index));

  useEffect(() => {
    const loadGenres = async () => {
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
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      if (!selectedGenreId) {
        setMovies([]);
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
    setCurrentPage(1);
  }, [selectedGenreId, selectedSort, selectedYear]);

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

  const paginationPages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) {
      return true;
    }

    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="genre-page">
      <Navbar />

      <main className="genre-shell">
        <section className="genre-hero">
          <p className="genre-kicker">Genre Explorer</p>
          <h1>Filter Movies by Genre</h1>
          <p>Pick a genre and browse popular titles without extra filters getting in the way.</p>
        </section>

        <section className="genre-chip-bar">
          {loadingGenres && <p>Loading genres...</p>}

          {!loadingGenres && genres.map((genre) => (
            <button
              type="button"
              key={genre.id}
              className={String(genre.id) === selectedGenreId ? 'genre-chip active' : 'genre-chip'}
              onClick={() => handleGenreChange(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </section>

        <section className="genre-filters">
          <div className="genre-filter-field">
            <label htmlFor="genre-year-filter">Filter by year</label>
            <select
              id="genre-year-filter"
              value={selectedYear}
              onChange={handleYearChange}
              className="genre-filter-select"
            >
              <option value="">All years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="genre-filter-field">
            <label htmlFor="genre-sort-filter">Sort results</label>
            <select
              id="genre-sort-filter"
              value={selectedSort}
              onChange={handleSortChange}
              className="genre-filter-select"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="genre-grid-header">
          <div>
            <h2>{selectedGenre ? selectedGenre.name : 'Movies'}</h2>
            <p>{totalResults} results · Page {currentPage} of {totalPages}</p>
          </div>
        </section>

        {loadingMovies && (
          <section className="genre-state">
            <div className="spinner"></div>
            <p>Loading movies...</p>
          </section>
        )}

        {!loadingMovies && !loadingGenres && error && (
          <section className="genre-state error">
            <h2>Could not load this genre</h2>
            <p>{error}</p>
          </section>
        )}

        {!loadingMovies && !error && (
          <>
            <section className="genre-grid">
              {movies.map((movie) => (
                <button
                  type="button"
                  key={movie.id}
                  className="genre-card"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <div className="genre-card-poster">
                    {movie.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} />
                    ) : (
                      <div className="genre-card-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="genre-card-body">
                    <h3>{movie.title}</h3>
                    <div className="genre-card-meta">
                      <span>⭐ {Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                      <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </section>

            {movies.length > 0 && totalPages > 1 && (
              <section className="genre-pagination" aria-label="Genre pagination">
                <button
                  type="button"
                  className="genre-page-button genre-page-button-nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="genre-page-numbers">
                  {paginationPages.map((page, index) => {
                    const previousPage = paginationPages[index - 1];
                    const shouldShowGap = previousPage && page - previousPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {shouldShowGap && <span className="genre-page-gap">…</span>}
                        <button
                          type="button"
                          className={page === currentPage ? 'genre-page-button active' : 'genre-page-button'}
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
                  className="genre-page-button genre-page-button-nav"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default GenreExplorer;