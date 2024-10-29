import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import Home from './screens/Home.jsx';
import Settings from './screens/Settings.jsx';
import './App.scss';
import Loading from './screens/Loading';
import Tutorial from './screens/Tutorial'; // Importiere den Tutorial Screen
import {getAddresses, getClimatePlaces} from "./scripts/routeFunctions";
import {getCurrentDate} from "./scripts/main";

const App = () => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const [debugContent, setDebugContent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [warnings, setWarnings] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [drinkPlaces, setDrinkPlaces] = useState([]);
    const [coolPlaces, setCoolPlaces] = useState([]);
    const [showTutorial, setShowTutorial] = useState(!localStorage.getItem('tutorialFinished'));
    const [weatherData, setWeatherData] = useState(null);
    const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('notifications')) ?? []);

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
        if (!showTutorial) {
            // Starte das Laden der Daten nach dem Tutorial
            fetchAllData();
        }
    }, [showTutorial]); // Führe fetchAllData nur aus, wenn das Tutorial abgeschlossen ist

    const fetchAllData = async () => {
        setIsFetching(true);
        await fetchWeatherData();
        await fetchWeatherWarnings();
        await fetchAddresses();
        await fetchCoolPlaces();
        await fetchDrinkPlaces();

        setLoadingMessage(t('loading.waitingForPermission'));
        navigator.permissions.query({ name: "geolocation" }).then(async (result) => {
            if (result.state === "prompt") {
                navigator.geolocation.getCurrentPosition(
                    (position) => console.log(position)
                );
            }
            Notification.requestPermission().then(async (permission) => {
                let settings = JSON.parse(localStorage.getItem('userSettings'));
                if (permission === 'granted') {
                    if (settings)
                        settings.notificationsEnabled = true;
                    else
                        settings = {notificationsEnabled: true}
                    localStorage.setItem('userSettings', JSON.stringify(settings));
                } else {
                    if (settings)
                        settings.notificationsEnabled = false;
                    else
                        settings = {notificationsEnabled: false}
                    localStorage.setItem('userSettings', JSON.stringify(settings));
                }
                setIsFetching(false); // Setze den Ladezustand auf fertig
            });
        });
    };

    // Wetterwarnungen abrufen
    const fetchWeatherWarnings = async () => {
        try {
            setLoadingMessage(t('loading.weatherAlerts'));
            const preparedQueryUrl = 'https://api.brightsky.dev/alerts?lat=51.24652&lon=6.79181';

            const response = await fetch(preparedQueryUrl, {
                method: "GET",
                mode: 'cors',
            });
            const data = await response.json();

            if (data.alerts) {
                setWarnings(prevWarnings => [
                    ...prevWarnings,
                    ...data.alerts.map(alert => ({
                        mode: alert.event_en,
                        headline: i18n.language === 'de' ? alert.headline_de : alert.headline_en,
                        textContent: i18n.language === 'de' ? alert.instruction_de : alert.instruction_en,
                    })),
                ]);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Wetterwarnungen:', error);
        }
    };

    function findClosestTimestamp(objectsArray) {
        const now = new Date(); // Aktuelle Zeit in UTC

        return objectsArray.reduce((closest, current) => {
            // Beide Timestamps in Millisekunden in UTC konvertieren
            const closestTime = Date.parse(closest.timestamp); // ISO 8601 konvertiert korrekt mit Zeitzonenoffset
            const currentTime = Date.parse(current.timestamp); // ISO 8601 konvertiert korrekt mit Zeitzonenoffset
            const nowTime = now.getTime(); // Aktuelle UTC-Zeit

            const closestDiff = Math.abs(closestTime - nowTime);
            const currentDiff = Math.abs(currentTime - nowTime);

            return currentDiff < closestDiff ? current : closest;
        });
    }



    const fetchWeatherData = async () => {
        try {
            const currentDate = getCurrentDate();
            setLoadingMessage(t('loading.weatherData'));
            const preparedQueryUrl = 'https://api.brightsky.dev/weather?lat=51.24652&lon=6.79181&date=' + currentDate;

            const response = await fetch(preparedQueryUrl, {
                method: "GET",
                mode: 'cors',
            });
            const data = await response.json();
            if (data.weather) {
                const currentWeatherData = findClosestTimestamp(data.weather);
                setWeatherData(currentWeatherData);

                console.log(localStorage);
                console.log(currentWeatherData)
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Wetterdaten:', error);
        }
    };

    // Adressen abrufen
    const fetchAddresses = async () => {
        try {
            setLoadingMessage(t('loading.addresses'));
            const data = await getAddresses();
            console.log(data)
            setAddresses(data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Adressen:', error);
        }
    };

    const fetchCoolPlaces = async () => {
        try {
            setLoadingMessage(t('loading.coolPlaces'));
            const data = await getClimatePlaces(["Wasserspielplatz", "KuehlerOrtInnen"]);
            setCoolPlaces(data);
        } catch (error) {
            console.error('Fehler beim Abrufen der kühlen Orte:', error);
        }
    };

    const fetchDrinkPlaces = async () => {
        try {
            setLoadingMessage(t('loading.drinkPlaces'));
            const data = await getClimatePlaces(["Refillstation", "Trinkbrunnen"]);

            setDrinkPlaces(data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Trinkplätze:', error);
        }
    };

    const handleFinishTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('tutorialFinished', 'true');
    }

    // Wenn das Tutorial noch angezeigt werden soll
    if (showTutorial) {
        return (
            <Tutorial onFinish={handleFinishTutorial} />
        );
    }

    // Wenn die Daten noch geladen werden, zeige den Loading Screen an
    if (isFetching) {
        return (
            <Loading message={loadingMessage} />
        );
    }

    return (
        <Router basename="/Klima-App">
            <Routes>
                <Route path="/" element={<Home warnings={warnings} addresses={addresses} drinkPlaces={drinkPlaces}
                                               coolPlaces={coolPlaces} isLoading={isLoading} setIsLoading={setIsLoading}
                                               loadingMessage={loadingMessage}
                                               setLoadingMessage={setLoadingMessage}
                                                weatherData={weatherData}
                                                notifications={notifications} setNotifications={setNotifications}
                                                debugContent={debugContent}/>}/>
                <Route path="/settings" element={<Settings weatherData={weatherData}
                                                           notifications={notifications} setNotifications={setNotifications}
                                                            debugContent={debugContent}/>} />
            </Routes>
        </Router>
    );
};

export default App;
