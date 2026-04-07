import React, { useEffect, useState } from "react";

import "./DarkMode.css";

const DarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    const setDarkTheme = () => {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("selectedTheme", "dark");
    };

    const setLightTheme = () => {
        document.body.setAttribute("data-theme", "light");
        localStorage.setItem("selectedTheme", "light");
    };

    useEffect(() => {
        const selectedTheme = localStorage.getItem("selectedTheme");
        const nextIsDarkMode = selectedTheme !== "light";
        setIsDarkMode(nextIsDarkMode);

        if (nextIsDarkMode) {
            setDarkTheme();
        } else {
            setLightTheme();
        }
    }, []);

    const toggleTheme = (e) => {
        if (e.target.checked) {
            setDarkTheme();
            setIsDarkMode(true);
        } else {
            setLightTheme();
            setIsDarkMode(false);
        }
    };

    return (
        <div className='dark_mode'>
            <label className='bb8-toggle' htmlFor='darkmode-toggle'>
                <input
                    className='bb8-toggle__checkbox'
                    type='checkbox'
                    id='darkmode-toggle'
                    onChange={toggleTheme}
                    checked={isDarkMode}
                />

                <div className='bb8-toggle__container'>
                    <div className='bb8-toggle__scenery'>
                        <div className='bb8-toggle__star'></div>
                        <div className='bb8-toggle__star'></div>
                        <div className='bb8-toggle__star'></div>
                        <div className='bb8-toggle__star'></div>
                        <div className='bb8-toggle__star'></div>
                        <div className='bb8-toggle__star'></div>
                        <div className='bb8-toggle__star'></div>
                        <div className='tatto-1'></div>
                        <div className='tatto-2'></div>
                        <div className='gomrassen'></div>
                        <div className='hermes'></div>
                        <div className='chenini'></div>
                        <div className='bb8-toggle__cloud'></div>
                        <div className='bb8-toggle__cloud'></div>
                        <div className='bb8-toggle__cloud'></div>
                    </div>

                    <div className='bb8'>
                        <div className='bb8__head-container'>
                            <div className='bb8__antenna'></div>
                            <div className='bb8__antenna'></div>
                            <div className='bb8__head'></div>
                        </div>
                        <div className='bb8__body'></div>
                    </div>

                    <div className='artificial__hidden'>
                        <div className='bb8__shadow'></div>
                    </div>
                </div>
            </label>
        </div>
    );
};

export default DarkMode;
