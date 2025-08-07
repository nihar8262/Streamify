import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Navbar.css";
import DarkMode from "../DarkMode/DarkMode";

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results page with query parameter
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(""); // Clear search input
        }
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <nav className='navbar'>
            <h1>Streamify</h1>

            <div className='search_container'>
                <form onSubmit={handleSearch} className='search_form'>
                    <input
                        type='text'
                        placeholder='Search for movies...'
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        className='search_input'
                    />
                    <button type='submit' className='search_button'>
                        🔍
                    </button>
                </form>
            </div>

            <div className='navbar_links'>
                <DarkMode />
            </div>
        </nav>
    );
};

export default Navbar;