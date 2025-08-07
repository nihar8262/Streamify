import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './SingleMovieCard.css'

const API_KEY = '183928bab7fc630ed0449e4f66ec21bd';

const SingleMovieCard = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [movieData, setMovieData] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        const data = await response.json();
        
        console.log('Movie Data:', data);
        console.log('Title:', data.title);
        console.log('Overview:', data.overview);
        console.log('Release Date:', data.release_date);
        console.log('Rating:', data.vote_average);
        
        setMovieData(data);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

  useEffect(() => {
    const fetchRelatedMovies = async () => {
      try {
        // Get similar movies based on name similarity and genre/company
        const relatedMoviesData = await fetchSimilarMoviesByNameAndGenre();
        
        setRelatedMovies(relatedMoviesData);
        setCurrentPage(1);
        setHasMoreMovies(relatedMoviesData.length >= 10);
      } catch (error) {
        console.error('Error fetching related movies:', error);
      }
    };

    if (id && movieData) {
      fetchRelatedMovies();
    }
  }, [id, movieData]);

  const fetchSimilarMoviesByNameAndGenre = async () => {
    try {
      let allSimilarMovies = [];
      
      // First, search for movies with similar names
      if (movieData.title) {
        // Extract key words from the movie title (remove common words)
        const titleWords = movieData.title
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove special characters
          .split(' ')
          .filter(word => 
            word.length > 2 && 
            !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'part', 'movie', 'film'].includes(word)
          );

        // Search for movies with similar titles
        for (const word of titleWords.slice(0, 3)) { // Use first 3 significant words
          try {
            const searchResponse = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(word)}&page=1`
            );
            const searchData = await searchResponse.json();
            
            if (searchData.results) {
              // Filter movies that share title words and are not the current movie
              const similarNameMovies = searchData.results.filter(movie => 
                movie.id !== parseInt(id) && 
                movie.title.toLowerCase().includes(word)
              );
              allSimilarMovies = [...allSimilarMovies, ...similarNameMovies];
            }
          } catch (searchError) {
            console.error(`Error searching for movies with word "${word}":`, searchError);
          }
        }
      }

      // Then, get movies by genre
      if (movieData.genres && movieData.genres.length > 0) {
        const genreIds = movieData.genres.map(genre => genre.id).join(',');
        const genreResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`
        );
        const genreData = await genreResponse.json();
        
        if (genreData.results) {
          allSimilarMovies = [...allSimilarMovies, ...genreData.results];
        }
      }

      // Then, get movies by production company
      if (movieData.production_companies && movieData.production_companies.length > 0) {
        const companyIds = movieData.production_companies.map(company => company.id).join(',');
        const companyResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_companies=${companyIds}&sort_by=popularity.desc&page=1`
        );
        const companyData = await companyResponse.json();
        
        if (companyData.results) {
          allSimilarMovies = [...allSimilarMovies, ...companyData.results];
        }
      }

      // Remove duplicates and current movie
      const uniqueMovies = allSimilarMovies.filter((movie, index, self) => {
        return movie.id !== parseInt(id) && 
               index === self.findIndex(m => m.id === movie.id);
      });

      // Sort by name similarity first, then by popularity and rating
      const sortedMovies = uniqueMovies.sort((a, b) => {
        // Check if movies have similar names to the current movie
        const aNameSimilarity = calculateNameSimilarity(movieData.title, a.title);
        const bNameSimilarity = calculateNameSimilarity(movieData.title, b.title);
        
        // If one has higher name similarity, prioritize it
        if (aNameSimilarity !== bNameSimilarity) {
          return bNameSimilarity - aNameSimilarity;
        }
        
        // If name similarity is equal, sort by popularity and rating
        const scoreA = (a.popularity || 0) * 0.7 + (a.vote_average || 0) * 0.3;
        const scoreB = (b.popularity || 0) * 0.7 + (b.vote_average || 0) * 0.3;
        return scoreB - scoreA;
      });

      return sortedMovies.slice(0, 10);
    } catch (error) {
      console.error('Error fetching similar movies by name and genre:', error);
      
      // Fallback to regular similar movies API
      try {
        const fallbackResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}&page=1`
        );
        const fallbackData = await fallbackResponse.json();
        return fallbackData.results?.filter(movie => movie.id !== parseInt(id)).slice(0, 10) || [];
      } catch (fallbackError) {
        console.error('Fallback similar movies failed:', fallbackError);
        return [];
      }
    }
  };

  const calculateNameSimilarity = (title1, title2) => {
    if (!title1 || !title2) return 0;
    
    const words1 = title1.toLowerCase().split(' ').filter(word => word.length > 2);
    const words2 = title2.toLowerCase().split(' ').filter(word => word.length > 2);
    
    let commonWords = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        commonWords++;
      }
    });
    
    return commonWords / Math.max(words1.length, words2.length);
  };

  const loadMoreMovies = async () => {
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const newMovies = await loadMoreSimilarMovies(nextPage);

      // Add new movies to existing ones, avoiding duplicates
      setRelatedMovies(prevMovies => {
        const existingIds = prevMovies.map(movie => movie.id);
        const uniqueNewMovies = newMovies.filter(movie => !existingIds.includes(movie.id));
        return [...prevMovies, ...uniqueNewMovies];
      });
      
      setCurrentPage(nextPage);
      setHasMoreMovies(newMovies.length > 0);
      
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreSimilarMovies = async (page) => {
    try {
      let allSimilarMovies = [];
      
      // Get more movies by genre
      if (movieData.genres && movieData.genres.length > 0) {
        const genreIds = movieData.genres.map(genre => genre.id).join(',');
        const genreResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=${page}`
        );
        const genreData = await genreResponse.json();
        
        if (genreData.results) {
          allSimilarMovies = [...allSimilarMovies, ...genreData.results];
        }
      }

      // Get more movies by production company
      if (movieData.production_companies && movieData.production_companies.length > 0) {
        const companyIds = movieData.production_companies.map(company => company.id).join(',');
        const companyResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_companies=${companyIds}&sort_by=popularity.desc&page=${page}`
        );
        const companyData = await companyResponse.json();
        
        if (companyData.results) {
          allSimilarMovies = [...allSimilarMovies, ...companyData.results];
        }
      }

      // Remove duplicates and current movie
      const uniqueMovies = allSimilarMovies.filter((movie, index, self) => {
        return movie.id !== parseInt(id) && 
               index === self.findIndex(m => m.id === movie.id);
      });

      // Sort by name similarity first, then by popularity and rating
      const sortedMovies = uniqueMovies.sort((a, b) => {
        const aNameSimilarity = calculateNameSimilarity(movieData.title, a.title);
        const bNameSimilarity = calculateNameSimilarity(movieData.title, b.title);
        
        if (aNameSimilarity !== bNameSimilarity) {
          return bNameSimilarity - aNameSimilarity;
        }
        
        const scoreA = (a.popularity || 0) * 0.7 + (a.vote_average || 0) * 0.3;
        const scoreB = (b.popularity || 0) * 0.7 + (b.vote_average || 0) * 0.3;
        return scoreB - scoreA;
      });

      return sortedMovies.slice(0, 10);
    } catch (error) {
      console.error('Error loading more similar movies:', error);
      return [];
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const formatRevenue = (revenue) => {
    if (revenue >= 1000000000) {
      return `$${(revenue / 1000000000).toFixed(1)}B`;
    } else if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue > 0) {
      return `$${revenue.toLocaleString()}`;
    }
    return 'N/A';
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading movie details...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-icon">←</span>
        Back
      </button>
      <h2>Oops! Something went wrong</h2>
      <p>{error}</p>
    </div>
  );
  
  if (!movieData) return (
    <div className="error-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-icon">←</span>
        Back
      </button>
      <h2>Movie not found</h2>
      <p>No movie data available</p>
    </div>
  );

  return (
    <div className="movie-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-icon">←</span>
        Back
      </button>
      
      <div 
        className="movie-backdrop"
        style={{
          backgroundImage: movieData.backdrop_path 
            ? `url(https://image.tmdb.org/t/p/original${movieData.backdrop_path})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>
      
      <div className="movie-content">
        <div className="movie-poster">
          {movieData.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`}
              alt={movieData.title}
              className="poster-image"
            />
          ) : (
            <div className="poster-placeholder">
              <span>No Image Available</span>
            </div>
          )}
        </div>
        
        <div className="movie-info">
          <h1 className="movie-title">{movieData.title}</h1>
          
          <div className="movie-meta">
            <span className="release-date">
              <i className="icon">📅</i>
              {new Date(movieData.release_date).getFullYear()}
            </span>
            <span className="rating">
              <i className="icon">⭐</i>
              {movieData.vote_average?.toFixed(1)}/10
            </span>
            <span className="runtime">
              <i className="icon">⏱️</i>
              {movieData.runtime ? `${movieData.runtime} min` : 'N/A'}
            </span>
            {movieData.revenue && movieData.revenue > 0 && (
              <span className="revenue">
                <i className="icon">💰</i>
                {formatRevenue(movieData.revenue)}
              </span>
            )}
          </div>
          
          {movieData.genres && (
            <div className="genres">
              {movieData.genres.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          
          <div className="overview">
            <h3>Overview</h3>
            <p>{movieData.overview || 'No overview available.'}</p>
          </div>

          {/* Movie Actions */}
          <div className="movie-actions">
            {movieData.homepage && (
              <a 
                href={movieData.homepage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="homepage-button"
              >
                <i className="icon">🌐</i>
                Official Website
              </a>
            )}
          </div>
          
          {movieData.production_companies && movieData.production_companies.length > 0 && (
            <div className="production-info">
              <h4>Production Companies</h4>
              <div className="production-companies">
                {movieData.production_companies.slice(0, 3).map(company => (
                  <span key={company.id} className="company">
                    {company.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <div className="related-movies-section">
          <div className="related-movies-container">
            <h2 className="related-movies-title">Movies You Might Like</h2>
            <div className="related-movies-grid">
              {relatedMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className="related-movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <div className="related-movie-poster">
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="related-poster-image"
                      />
                    ) : (
                      <div className="related-poster-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="related-movie-info">
                    <h4 className="related-movie-title">{movie.title}</h4>
                    <div className="related-movie-meta">
                      <span className="related-rating">
                        ⭐ {movie.vote_average?.toFixed(1)}
                      </span>
                      <span className="related-year">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMoreMovies && (
              <div className="load-more-container">
                <button 
                  className="load-more-button" 
                  onClick={loadMoreMovies}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="load-more-spinner"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Results'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
};

export default SingleMovieCard