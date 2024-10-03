import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Header from "../components/Header";
import Map from "../components/Map";
import Footer from "../components/Footer";
import WeatherModal from "../components/WeatherModal";
import DebugModal from "../components/DebugModal";
import {calculateDistance, canSendNotification, sendNotification} from "../scripts/main";
import Loading from "../components/Loading";
import WeatherDataModal from "../components/WeatherDataModal";

const Home = ({warnings, addresses, coolPlaces, drinkPlaces, isLoading, setIsLoading, loadingMessage, setLoadingMessage, weatherData}) => {
    const {t} = useTranslation();
    const [route, setRoute] = useState([]);
    const [routeLength, setRouteLength] = useState(0);
    const [routeDuration, setRouteDuration] = useState(0);
    const [routeStartAddress, setRouteStartAddress] = useState('');
    const [routeEndAddress, setRouteEndAddress] = useState('');
    const [isWeatherModalOpen, setWeatherIsModalOpen] = useState(false);
    const [debugModalIsOpen, setDebugModalIsOpen] = useState(false);
    const [weatherDataModalIsOpen, setWeatherDataModalIsOpen] = useState(false);
    const [debugContent, setDebugContent] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);

    // Speichere die Originalmethoden von console
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };

    // Erstelle eine Funktion, die den Konsoleninhalt auf der Seite anzeigt
    const displayConsole = (type, args) => {
        const message = `[${type}] ${args.join(' ')}`;
        setDebugContent([...debugContent, JSON.stringify(message)]);
    };

    // Überschreibe die console.log Methode
    console.log = function (...args) {
        originalConsole.log.apply(console, args);
        displayConsole('log', args);
    };

    // Überschreibe console.error
    console.error = function (...args) {
        originalConsole.error.apply(console, args);
        displayConsole('error', args);
    };

    // Überschreibe console.warn
    console.warn = function (...args) {
        originalConsole.warn.apply(console, args);
        displayConsole('warn', args);
    };

    // Überschreibe console.info
    console.info = function (...args) {
        originalConsole.info.apply(console, args);
        displayConsole('info', args);
    };

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({lat: latitude, lng: longitude});
                },
                (error) => {
                    console.error("Error retrieving location:", error);
                },
                {
                    maximumAge: 10000,
                    timeout: 5000,
                    enableHighAccuracy: true, // Höhere Genauigkeit anfordern
                }
            );

            return () => {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                }
            };
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [coolPlaces, drinkPlaces]);

    useEffect(() => {
        setWeatherIsModalOpen(warnings.length > 0);
    }, [warnings]);

    return (
        <div className="wrapper">
            <Header
                title={t('home.title')}
                setDebugModalIsOpen={() => setDebugModalIsOpen(!debugModalIsOpen)}
                setWeatherDataModalIsOpen={() => setWeatherDataModalIsOpen(!weatherDataModalIsOpen)}
                weatherData={weatherData}/>
            <WeatherDataModal modalIsOpen={weatherDataModalIsOpen} closeModal={() => setWeatherDataModalIsOpen(false)} headline={'Wetter'} weatherData={weatherData}></WeatherDataModal>
            <DebugModal modalIsOpen={debugModalIsOpen} closeModal={() => setDebugModalIsOpen(false)} mode={'information'} headline={'Konsoleninhalt'} debugContent={debugContent}></DebugModal>
            <WeatherModal
                modalIsOpen={isWeatherModalOpen}
                closeModal={() => setWeatherIsModalOpen(false)}
                warnings={warnings}
            />
            <div className="content">
                <Map
                    route={route} setRoute={setRoute}
                    routeLength={routeLength} routeDuration={routeDuration}
                    setRouteLength={setRouteLength}
                    setRouteDuration={setRouteDuration}
                     routeStartAddress={routeStartAddress} setRouteStartAddress={setRouteStartAddress}
                     routeEndAddress={routeEndAddress} setRouteEndAddress={setRouteEndAddress}
                     coolPlaces={coolPlaces}
                     drinkPlaces={drinkPlaces}
                     currentPosition={currentPosition}
                     isLoading={isLoading} setIsLoading={setIsLoading}
                     loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage}
                />
            </div>
            <Footer route={route}
                    setRoute={setRoute}
                    setRouteLength={setRouteLength}
                    setRouteDuration={setRouteDuration}
                    routeStartAddress={routeStartAddress} setRouteStartAddress={setRouteStartAddress}
                    routeEndAddress={routeEndAddress} setRouteEndAddress={setRouteEndAddress}
                    addresses={addresses}
                    coolPlaces={coolPlaces}
                    drinkPlaces={drinkPlaces}
                    currentPosition={currentPosition}
                    isLoading={isLoading} setIsLoading={setIsLoading}
                    loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage}
            />
            <Loading message={loadingMessage} isLoading={isLoading}/>
        </div>
    );
};

export default Home;
