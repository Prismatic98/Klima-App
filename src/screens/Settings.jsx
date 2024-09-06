import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

    // States für die Einstellungen
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 5);
    const [notificationsEnabled, setNotificationsEnabled] = useState(savedSettings?.notificationsEnabled ?? true);
    const [coolPlaceDistance, setCoolPlaceDistance] = useState(savedSettings?.coolPlaceDistance ?? 500);
    const [interest, setInterest] = useState(savedSettings?.interest ?? 'cool');
    const [language, setLanguage] = useState(savedSettings?.language ?? (i18n.language || 'de'));
    const [contextInfoEnabled, setContextInfoEnabled] = useState(savedSettings?.contextInfoEnabled ?? true);

    // Hilfsfunktion zum Speichern der Einstellungen
    const saveSettings = (newSettings) => {
        const updatedSettings = {
            routePreference,
            notificationsEnabled,
            coolPlaceDistance,
            interest,
            language,
            contextInfoEnabled,
            ...newSettings
        };
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    };

    // Event-Handler mit direkter Speicherung im localStorage
    const handleRoutePreferenceChange = (e) => {
        const value = e.target.value;
        setRoutePreference(value);
        saveSettings({ routePreference: value });
    };

    const handleNotificationToggle = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        saveSettings({ notificationsEnabled: newValue });
    };

    const handleCoolPlaceDistanceChange = (e) => {
        const value = e.target.value;
        setCoolPlaceDistance(value);
        saveSettings({ coolPlaceDistance: value });
    };

    const handleInterestChange = (e) => {
        const value = e.target.value;
        setInterest(value);
        saveSettings({ interest: value });
    };

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        setLanguage(selectedLanguage);
        i18n.changeLanguage(selectedLanguage);  // Sprache in i18n ändern
        saveSettings({ language: selectedLanguage });
    };

    const handleContextInfoToggle = () => {
        const newValue = !contextInfoEnabled;
        setContextInfoEnabled(newValue);
        saveSettings({ contextInfoEnabled: newValue });
    };

    return (
        <div className="settings min-h-screen flex flex-col">
            <Header title={t('settings.title')} />
            <div className="content flex-grow p-6 space-y-8 bg-white rounded-lg max-w-lg mx-auto">
                <div className="setting-item slidecontainer">
                    <label className="block text-gray-700 text-sm font-bold mb-2">{t('settings.routePreference')}:</label>
                    <input type="range"
                           min="0"
                           max="10"
                           value={routePreference}
                           className="slider w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                           onChange={handleRoutePreferenceChange}/>
                    <p className="text-sm text-gray-600 mt-2">
                        {routePreference < 5 ? t('settings.coolRoute') : t('settings.fastRoute')}
                    </p>
                </div>

                <div className="setting-item slidecontainer">
                    <label className="block text-gray-700 text-sm font-bold mb-2">{t('settings.coolPlaceDistance')}:</label>
                    <input type="range"
                           min="0"
                           max="500"
                           step="50"
                           value={coolPlaceDistance}
                           className="slider w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                           onChange={handleCoolPlaceDistanceChange}/>
                    <p className="text-sm text-gray-600 mt-2">{coolPlaceDistance} {t('settings.meters')}</p>
                </div>

                <div className="setting-item">
                    <label className="block text-gray-700 text-sm font-bold mb-2">{t('settings.interest')}:</label>
                    <select
                        value={interest}
                        onChange={handleInterestChange}
                        className="block w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                    >
                        <option value="cool">{t('settings.coolRoutes')}</option>
                        <option value="fast">{t('settings.fastRoutes')}</option>
                    </select>
                </div>

                <div className="setting-item">
                    <label className="block text-gray-700 text-sm font-bold mb-2">{t('settings.language')}:</label>
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="block w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                    >
                        <option value="de">{t('settings.german')}</option>
                        <option value="en">{t('settings.english')}</option>
                    </select>
                </div>

                <div className="setting-item flex items-center justify-between">
                    <label className="max-w-80 block text-gray-700 text-sm font-bold">{t('settings.notifications')}:</label>
                    <label className="settings-item switch">
                        <input
                            type="checkbox"
                            checked={notificationsEnabled}
                            onChange={handleNotificationToggle}
                        />
                        <span className="toggle round"></span>
                    </label>
                </div>

                <div className="setting-item flex items-center justify-between">
                    <label className="max-w-80 block text-gray-700 text-sm font-bold">{t('settings.contextInfo')}:</label>
                    <label className="settings-item switch">
                        <input
                            type="checkbox"
                            checked={contextInfoEnabled}
                            onChange={handleContextInfoToggle}
                        />
                        <span className="toggle round"></span>
                    </label>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Settings;
