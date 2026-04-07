import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCarousel.css';
import { fetchMoviesByType } from '../../api/tmdb';

const MovieCarousel = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    if (!dateString) return 'Coming Soon';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="carousel-loading">
        <div className="carousel-spinner"></div>
        <p>Loading upcoming movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-loading">
        <h3>Error loading movies</h3>
        <p>{error}</p>
        <button onClick={fetchUpcomingMovies}>Try Again</button>
      </div>
    );
  }

  if (upcomingMovies.length === 0) {
    return (
      <div className="carousel-loading">
        <p>No upcoming movies available</p>
      </div>
    );
  }

  const currentMovie = upcomingMovies[currentIndex];

  return (
    <section className="movie-carousel">

      <div className="carousel-container">
        <div 
          className="carousel-backdrop"
          style={{
            backgroundImage: currentMovie?.backdrop_path 
              ? `url(https://image.tmdb.org/t/p/original${currentMovie.backdrop_path})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="carousel-overlay"></div>
        </div>

        <div className="carousel-content">
          <div className="carousel-movie-info">
            <h1 className="carousel-movie-title">{currentMovie?.title || 'Unknown Title'}</h1>
            <div className="carousel-movie-meta">
              <span className="carousel-release-date">
                📅 {formatDate(currentMovie?.release_date)}
              </span>
              <span className="carousel-rating">
                ⭐ {currentMovie?.vote_average?.toFixed(1) || 'N/A'}/10
              </span>
            </div>
            <p className="carousel-overview">
              {currentMovie?.overview ? (
                currentMovie.overview.length > 150 
                  ? currentMovie.overview.substring(0, 150) + '...'
                  : currentMovie.overview
              ) : 'No overview available.'}
            </p>
            <button 
              className="carousel-watch-button"
              onClick={() => handleMovieClick(currentMovie?.id)}
            >
              View Details
            </button>
          </div>

          <div className="carousel-poster">
            {currentMovie?.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
                alt={currentMovie?.title}
                className="carousel-poster-image"
              />
            ) : (
              <div className="carousel-poster-placeholder">
                <span>No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button className="carousel-nav carousel-nav-prev" onClick={goToPrevious}>
          ❮
        </button>
        <button className="carousel-nav carousel-nav-next" onClick={goToNext}>
          ❯
        </button>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {upcomingMovies.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Movie Thumbnails */}
      <div className="carousel-thumbnails">
        {upcomingMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          >
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="thumbnail-image"
              />
            ) : (
              <div className="thumbnail-placeholder">
                <span>No Image</span>
              </div>
            )}
            <div className="thumbnail-overlay">
              <h4 className="thumbnail-title">{movie.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MovieCarousel;