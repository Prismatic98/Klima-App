import React, { useState } from 'react';
import {FaHome, FaSearch, FaCog, FaTimes} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
    // State, um die Sichtbarkeit des Suchfeldes zu steuern
    const [isSearchActive, setIsSearchActive] = useState(false);
    const location = useLocation(); // React Router Hook zum Abrufen des aktuellen Pfads
    const navigate = useNavigate(); // React Router Hook für Navigation

    // Funktion zum Umschalten der Suchfeld-Sichtbarkeit
    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
    };

    const goToHome = () => {
        navigate('/'); // Navigiere zum Home Screen
    };

    const goToSettings = () => {
        navigate('/settings'); // Navigiere zum Settings Screen
    };

    return (
        <div className="footer__wrapper">
            {/* Eingabefeld wird über dem Footer angezeigt */}
            {isSearchActive && (
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Adresse eingeben..."
                        className="search-container__input"
                    />
                </div>
            )}

            <footer className="footer">
                <FaHome className="footer__icon" onClick={goToHome}/>

                {location.pathname === '/' && (
                    <div className="footer__button-container">
                        <button
                            className="footer__button"
                            onClick={toggleSearch}
                        >
                            {isSearchActive ? (
                                <FaTimes className="footer__button--icon" />
                            ) : (
                                <FaSearch className="footer__button--icon" />
                            )}
                        </button>
                    </div>
                )}

                <FaCog className="footer__icon" onClick={goToSettings}/>
            </footer>
        </div>
    );
};

export default Footer;
