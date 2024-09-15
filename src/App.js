import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import Home from './screens/Home.jsx';
import Settings from './screens/Settings.jsx';
import './App.scss';
import Loading from './components/Loading';
import {getAddresses} from "./scripts/routeFunctions";

const App = () => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [warnings, setWarnings] = useState([]);
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            await fetchWeatherWarnings();
            await fetchAddresses();
            setLoading(false);
        };

        fetchAllData();
    }, [i18n]); // Abhängigkeit für Sprachwechsel

    // Wetterwarnungen abrufen
    const fetchWeatherWarnings = async () => {
        try {
            setLoadingMessage("Lade Wetterwarnungen...");
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
                    }))
                ]);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Wetterwarnungen:', error);
        }
    };

    // Adressen abrufen
    const fetchAddresses = async () => {
        try {
            setLoadingMessage("Lade Adressen...");
            const data = await getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Adressen:', error);
        }
    };

    if (loading) {
        return (
            <Loading message={loadingMessage} />
        );
    }

    return (
        <Router basename="/Klima-App">
            <Routes>
                <Route path="/" element={<Home warnings={warnings} addresses={addresses} />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
};

console.log('App is running!');

export default App;
