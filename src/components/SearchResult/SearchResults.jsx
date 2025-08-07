import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SearchResults.css";
import DarkMode from "../DarkMode/DarkMode";

const API_KEY = "183928bab7fc630ed0449e4f66ec21bd";

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get search query from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      searchMovies(query);
    }
  }, [query]);

  const searchMovies = async (searchQuery) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&page=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}?from=search`);
  };

  if (loading) {
    return (
      <div className="search-loading">
        <div className="spinner"></div>
        <p>Searching for "{query}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-error">
        <h2>Search Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1>Search Results for "{query}"</h1>
        <p>{searchResults.length} movies found</p>
      </div>
      <DarkMode/>

      {searchResults.length === 0 ? (
        <div className="no-results">
          <h2>No movies found</h2>
          <p>Try searching with different keywords</p>
        </div>
      ) : (
        <div className="search-results-grid">
          <button className="back-button" onClick={handleGoBack}>
            <span className="back-icon">←</span>
            Back
          </button>
          
          {searchResults.map((movie) => (
            <div
              key={movie.id}
              className="search-movie-card"
              onClick={() => handleMovieClick(movie.id)}
            >
              <div className="search-movie-poster">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className="search-poster-image"
                  />
                ) : (
                  <div className="search-poster-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="search-movie-info">
                <h3 className="search-movie-title">{movie.title}</h3>
                <div className="search-movie-meta">
                  <span className="search-rating">
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="search-year">
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : "TBA"}
                  </span>
                </div>
                <p className="search-overview">
                  {movie.overview
                    ? movie.overview.length > 100
                      ? movie.overview.substring(0, 100) + "..."
                      : movie.overview
                    : "No description available"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
