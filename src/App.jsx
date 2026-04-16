import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import SingleMovieCard from './components/SingleMovieCard/SingleMovieCard'
import SearchResults from './components/SearchResult/SearchResults';
import TopGrossing from './components/TopGrossing/TopGrossing';
import GenreExplorer from './components/GenreExplorer/GenreExplorer';
import Navbar from './components/Navbar/Navbar';
import Profile from './components/Profile/Profile';


const App = () => {
    return (
      <Routes>
                    <Route element={<Navbar />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/movie/:id" element={<SingleMovieCard />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/top-grossing" element={<TopGrossing />} />
                        <Route path="/genres" element={<GenreExplorer />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
      </Routes>
    );
};

export default App;
