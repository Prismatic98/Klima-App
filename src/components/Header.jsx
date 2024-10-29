import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {MdOutlineArrowBack} from "react-icons/md";
import { MdNotifications } from "react-icons/md";

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

const Header = ({ title, setDebugModalIsOpen, setWeatherDataModalIsOpen, setNotificationsModalIsOpen, weatherData, notifications }) => {
    const location = useLocation(); // React Router Hook zum Abrufen des aktuellen Pfads
    const navigate = useNavigate(); // React Router Hook für Navigation
    const [weatherIcon, setWeatherIcon] = useState('');
    const [temperature, setTemperature] = useState('');
    const [clickCount, setClickCount] = useState(0); // Zähler für Klicks

    const goBack = () => {
        navigate(-1);
    };

    const handleTitleClick = () => {
        setClickCount(prevCount => prevCount + 1);

        if (clickCount + 1 === 6) {
            setDebugModalIsOpen(true);
            setClickCount(0);
        }
    };

    useEffect(() => {
        if (weatherData) {
            setWeatherIcon(getWeatherIcon(weatherData));
            setTemperature(Math.round(weatherData.temperature).toString());
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
                    onClick={setWeatherDataModalIsOpen}
                    className="flex flex-col items-center absolute left-4 top-1/2 transform -translate-y-1/2"
                    aria-label="Wetter"
                >
                    {weatherIcon}
                    <span className="text-sm">{temperature}°C</span>
                </button>
            )}
            <h1
                onClick={handleTitleClick}
            >
                {title}
            </h1>
            {location.pathname === '/' && (
                <button onClick={setNotificationsModalIsOpen} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <MdNotifications className="icon" />
                    {notifications.length > 0 && (
                        <span className="notifications-count">
                            {notifications.length}
                        </span>
                    )}
                </button>
            )}
        </header>
    );
};

export default Header;
