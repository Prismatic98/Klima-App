import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdBugReport, MdOutlineArrowBack } from 'react-icons/md';
import {
    BsSunFill,
    BsCloudFill,
    BsCloudMoonFill,
    BsFillCloudSunFill,
    BsFillCloudFog2Fill,
    BsWind,
    BsCloudRainFill,
    BsCloudSleetFill,
    BsCloudSnowFill,
    BsCloudHailFill,
    BsCloudLightningFill,
} from 'react-icons/bs';

const getWeatherIcon = (weatherData) => {
    switch (weatherData.icon) {
        case "clear-day":
            return <BsSunFill className="icon" />;
        case "partly-cloudy-day":
            return <BsFillCloudSunFill  className="icon" />;
        case "partly-cloudy-night":
            return <BsCloudMoonFill className="icon" />;
        case "cloudy":
            return <BsCloudFill className="icon" />;
        case "fog":
            return <BsFillCloudFog2Fill className="icon" />;
        case "wind":
            return <BsWind className="icon" />;
        case "rain":
            return <BsCloudRainFill className="icon" />;
        case "sleet":
            return <BsCloudSleetFill className="icon" />;
        case "snow":
            return <BsCloudSnowFill className="icon" />;
        case "hail":
            return <BsCloudHailFill />; // Überprüfe, ob es ein spezifisches Hail-Icon gibt
        case "thunderstorm":
            return <BsCloudLightningFill className="icon" />;
        default:
            return <BsCloudFill className="icon" />;
    }
};

const Header = ({ title, setDebugModalIsOpen, setWeatherDataModalIsOpen, weatherData }) => {
    const location = useLocation(); // React Router Hook zum Abrufen des aktuellen Pfads
    const navigate = useNavigate(); // React Router Hook für Navigation
    const [weatherIcon, setWeatherIcon] = useState('');
    const [temperature, setTemperature] = useState('');

    // Funktion, um zur vorherigen Seite zurückzukehren
    const goBack = () => {
        navigate(-1); // Zurück zur vorherigen Seite
    };

    useEffect(() => {
        if (weatherData) {
            setWeatherIcon(getWeatherIcon(weatherData));
            setTemperature(weatherData.temperature);
        }
    }, [weatherData]);

    return (
        <header>
            {location.pathname !== '/' ? (
                <button onClick={goBack} className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <MdOutlineArrowBack className="icon" />
                </button>
            ) : (
                <button
                    onClick={() => setWeatherDataModalIsOpen(true)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    aria-label="Wetter"
                >
                    {weatherIcon}
                    <span className="text-sm">{temperature}°C</span>
                </button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
            <button
                onClick={() => setDebugModalIsOpen(true)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                aria-label="Test-Benachrichtigung"
            >
                <MdBugReport className="icon" size={25} />
            </button>
        </header>
    );
};

export default Header;
