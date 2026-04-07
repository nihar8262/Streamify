import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import "./Navbar.css";
import DarkMode from "../DarkMode/DarkMode";

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { to: '/', label: 'Home' },
        { to: '/top-grossing', label: 'Top 50 Grossing' },
        { to: '/genres', label: 'Genres' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results page with query parameter
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(""); // Clear search input
            setIsMenuOpen(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, location.search]);

    const handleBrandClick = () => {
        navigate('/');
        setIsMenuOpen(false);
    };

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    const renderSearchForm = (containerClassName) => (
        <div className={containerClassName}>
            <form onSubmit={handleSearch} className='search_form'>
                <input
                    type='text'
                    placeholder='Search for movies...'
                    value={searchQuery}
                    onChange={handleInputChange}
                    className='search_input'
                />
                <button type='submit' className='search_button'>
                    🔍
                </button>
            </form>
        </div>
    );

    return (
        <>
            {isMenuOpen && (
                <button
                    type='button'
                    className='navbar_overlay'
                    aria-label='Close navigation menu'
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
                <div className='navbar_brand_row'>
                    <button type='button' className='navbar_brand' onClick={handleBrandClick}>
                        Streamify
                    </button>

                    <div className='navbar_controls'>
                        {renderSearchForm('search_container search_container_desktop')}
                        <button
                            type='button'
                            className='nav_menu_toggle'
                            aria-label='Toggle navigation menu'
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen((currentState) => !currentState)}
                        >
                            ☰
                        </button>
                    </div>
                </div>

                <div className={`navbar_menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className='navbar_links'>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => isActive ? 'navbar_link active' : 'navbar_link'}
                                onClick={handleNavClick}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {renderSearchForm('search_container search_container_mobile')}

                    <div className='navbar_menu_footer'>
                        <DarkMode />
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;