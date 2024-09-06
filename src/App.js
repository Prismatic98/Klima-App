import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n'; // Stelle sicher, dass i18n initialisiert wird
import Home from './screens/Home.jsx';
import Settings from './screens/Settings.jsx';
import './App.scss';
import Loading from './components/Loading';
import Header from "./components/Header";

const App = () => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        // Funktion zur API-Anfrage mit fetch
        const fetchWeatherWarnings = async () => {
            try {
                const preparedQueryUrl = 'https://api.brightsky.dev/alerts?lat=51.24652&lon=6.79181';

                fetch(preparedQueryUrl, {
                    method: "GET",
                    mode: 'cors',
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.alerts) {
                            // Warnings in einem einzigen Setzen-Callback aktualisieren
                            setWarnings(prevWarnings => [
                                ...prevWarnings,
                                ...data.alerts.map(alert => ({
                                    mode: alert.event_en,
                                    headline: i18n.language === 'de' ? alert.headline_de : alert.headline_en,
                                    textContent: i18n.language === 'de' ? alert.instruction_de : alert.instruction_en,
                                }))
                            ]);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });

            } catch (error) {
                console.error('Fehler beim Abrufen der Wetterwarnungen:', error);
            } finally {
                setLoading(false); // Ladebildschirm ausblenden
            }
        };

        fetchWeatherWarnings();
    }, [i18n]); // Abhängigkeit hinzufügen, damit i18n bei Bedarf aktualisiert wird

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <Router basename="/Klima-App">
            <Routes>
                <Route path="/" element={<Home warnings={warnings}/>} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
};

console.log('App is running!');

export default App;
