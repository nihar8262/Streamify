import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../Navbar/Navbar';
import { fetchTopGrossingMovies } from '../../api/tmdb';
import './TopGrossing.css';

const TopGrossing = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1969 }, (_, index) => String(currentYear - index));

  useEffect(() => {
    const loadTopGrossingMovies = async () => {
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

  const formatRevenue = (revenue) => {
    if (!Number.isFinite(revenue) || revenue <= 0) {
      return 'Unknown';
    }

    if (revenue >= 1000000000) {
      return `$${(revenue / 1000000000).toFixed(2)}B`;
    }

    return `$${(revenue / 1000000).toFixed(1)}M`;
  };

  const formatRating = (rating) => Number.isFinite(rating) ? rating.toFixed(1) : 'N/A';

  return (
    <div className="top-grossing-page">
      <Navbar />

      <main className="top-grossing-shell">
        <section className="top-grossing-hero">
          <div>
            <p className="top-grossing-kicker">Box Office Rankings</p>
            <h1>Top 50 Highest Grossing Movies</h1>
            <p className="top-grossing-copy">
              Browse the biggest theatrical earners, then narrow the chart by release year.
            </p>
          </div>

          <div className="top-grossing-controls">
            <label htmlFor="grossing-year" className="top-grossing-label">Release year</label>
            <select
              id="grossing-year"
              className="top-grossing-select"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="top-grossing-summary">
          <div className="summary-card">
            <span className="summary-label">Showing</span>
            <strong>{movies.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Filter</span>
            <strong>{selectedYear || 'All Years'}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Sorted by</span>
            <strong>Revenue</strong>
          </div>
        </section>

        {loading && (
          <section className="top-grossing-state">
            <div className="spinner"></div>
            <p>Loading top grossing movies...</p>
          </section>
        )}

        {!loading && error && (
          <section className="top-grossing-state error">
            <h2>Could not load rankings</h2>
            <p>{error}</p>
          </section>
        )}

        {!loading && !error && (
          <section className="top-grossing-list">
            {movies.map((movie, index) => (
              <button
                type="button"
                key={movie.id}
                className="grossing-row"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <span className="grossing-rank">#{index + 1}</span>

                <div className="grossing-poster-wrap">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="grossing-poster"
                    />
                  ) : (
                    <div className="grossing-poster placeholder">No Image</div>
                  )}
                </div>

                <div className="grossing-main">
                  <h2>{movie.title}</h2>
                  <p>{movie.release_date || 'Release date unavailable'}</p>
                </div>

                <div className="grossing-metrics">
                  <span className="grossing-pill rating">⭐ {formatRating(movie.vote_average)}</span>
                  <span className="grossing-pill revenue">💰 {formatRevenue(movie.revenue)}</span>
                </div>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default TopGrossing;