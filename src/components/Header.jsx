import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Header = ({ title }) => {
    const location = useLocation(); // React Router Hook zum Abrufen des aktuellen Pfads
    const navigate = useNavigate(); // React Router Hook für Navigation

    // Funktion, um zur vorherigen Seite zurückzukehren
    const goBack = () => {
        navigate(-1); // Zurück zur vorherigen Seite
    };

    return (
        <header className="bg-blue-600 text-white py-4 flex items-center justify-center relative">
            {/* Zeige den Zurück-Pfeil an, wenn wir nicht auf dem Home-Screen sind */}
            {location.pathname !== '/' && (
                <button onClick={goBack} className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaArrowLeft className="text-white text-xl" />
                </button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
        </header>
    );
};

export default Header;
