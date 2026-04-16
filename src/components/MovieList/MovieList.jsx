import React, { useEffect, useState } from 'react';

import { fetchMoviesByType } from '../../api/tmdb';
import ContentRow from '../ui/ContentRow';

const descriptions = {
  now_playing: 'Fresh releases and current standouts.',
  popular: 'The most watched picks across the platform.',
  top_rated: 'Critically loved movies with serious staying power.',
  upcoming: 'Worth bookmarking before opening weekend.',
};

const MovieList = ({ type, title }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await fetchMoviesByType(type);
        setMovies(data.results || []);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [type]);

  return (
    <ContentRow
      title={title}
      subtitle={descriptions[type]}
      actionTo={type === 'top_rated' ? '/top-grossing' : '/genres'}
      movies={movies}
      loading={loading}
    />
  );
};

export default MovieList;
