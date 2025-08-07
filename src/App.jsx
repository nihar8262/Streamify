import React from "react";
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home' // or whatever your main page component is
import SingleMovieCard from './components/SingleMovieCard/SingleMovieCard' // or whatever your single movie component is
import SearchResults from './components/SearchResult/SearchResults';
import "./App.css";


const App = () => {
    return (
      <div className="app"> {/* Add this wrapper */}
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<SingleMovieCard />} />
          <Route path="/search" element={<SearchResults />} />
      </Routes>
  </div>
    );
};

export default App;
