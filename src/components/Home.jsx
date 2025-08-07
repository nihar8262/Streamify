import React from "react";
import "./Home.css";
import Fire from "../assets/fire.png";
import Star from "../assets/glowing-star.png";
import Party from "../assets/partying-face.png";
import Navbar from "./Navbar/Navbar";
import MovieList from "./MovieList/MovieList";
import MovieCarousel from "./MovieCarousel/MovieCarousel";

const Home = () => {
  return (
    <div>
      <Navbar />
      <MovieCarousel />
      <div className="home">
        <MovieList type="popular" title="Popular" emoji={Fire} />
        <MovieList type="top_rated" title="Top Rated" emoji={Star} />
        <MovieList type="upcoming" title="Upcoming" emoji={Party} />
      </div>
    </div>
  );
};

export default Home;
