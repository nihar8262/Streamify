import React from "react";
import MovieList from "./MovieList/MovieList";
import MovieCarousel from "./MovieCarousel/MovieCarousel";

const Home = () => {
  return (
    <div className="mx-auto flex w-full max-w-[90%] flex-col gap-7 px-4 pb-[90px] sm:px-6 lg:gap-8 lg:px-8 xl:pb-12">
      <MovieCarousel />

      <div className="space-y-7 lg:space-y-8">
        <MovieList type="now_playing" title="Trending Now" />
        <MovieList type="popular" title="Popular" />
        <MovieList type="top_rated" title="Top Rated" />
        <MovieList type="upcoming" title="Upcoming" />
      </div>
    </div>
  );
};

export default Home;
