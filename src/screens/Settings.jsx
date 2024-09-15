import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { useSpeechSynthesis } from 'react-speech-kit';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { voices } = useSpeechSynthesis();
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const [route, setRoute] = useState([]);
    const [routeStartAddress, setRouteStartAddress] = useState('');
    const [routeEndAddress, setRouteEndAddress] = useState('');
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 'ClimateBestPath');
    const [notificationsEnabled, setNotificationsEnabled] = useState(savedSettings?.notificationsEnabled ?? true);
    const [coolPlaceDistance, setCoolPlaceDistance] = useState(savedSettings?.coolPlaceDistance ?? 5);
    const [language, setLanguage] = useState(savedSettings?.language ?? (i18n.language || 'de'));
    const [contextInfoEnabled, setContextInfoEnabled] = useState(savedSettings?.contextInfoEnabled ?? true);
    const [selectedVoice, setSelectedVoice] = useState(savedSettings?.selectedVoice ?? 0);

    // Hilfsfunktion zum Speichern der Einstellungen
    const saveSettings = (newSettings) => {
        const updatedSettings = {
            notificationsEnabled,
            coolPlaceDistance,
            routePreference,
            language,
            contextInfoEnabled,
            selectedVoice,
            ...newSettings
        };
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    };

    // Event-Handler mit direkter Speicherung im localStorage
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

    const handleRoutePreferenceChange = (e) => {
        const value = e.target.value;
        setRoutePreference(value);
        saveSettings({ routePreference: value });
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

    const handleSelectedVoiceChange = (e) => {
        const value = e.target.value;
        setSelectedVoice(value);
        saveSettings({ selectedVoice: value });
    };

    return (
        <div className="settings min-h-screen flex flex-col">
            <Header title={t('settings.title')} />
            <div className="content flex-grow p-6 space-y-8 bg-white rounded-lg max-w-lg mx-auto">

                {/* Distanz zu kühlen Orten */}
                <div className="setting-item slidecontainer">
                    <label
                        className="settings__label"
                        htmlFor="coolPlaceDistanceRange"
                    >
                        {t('settings.coolPlaceDistance')}:
                    </label>
                    <input
                        type="range"
                        id="coolPlaceDistanceRange"
                        aria-label={t('settings.coolPlaceDistanceAria')}
                        min="0"
                        max="10"
                        step="1"
                        value={coolPlaceDistance}
                        className="slider w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        onChange={handleCoolPlaceDistanceChange}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                        {coolPlaceDistance} {t('settings.meters')}
                    </p>
                </div>

                {/* Routenpräferenz */}
                <div className="setting-item">
                    <label
                        className="settings__label"
                        htmlFor="routePreferenceSelect"
                    >
                        {t('settings.routePreference')}:
                    </label>
                    <select
                        id="routePreferenceSelect"
                        aria-label={t('settings.routePreferenceAria')}
                        value={routePreference}
                        onChange={handleRoutePreferenceChange}
                        className="block w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                    >
                        <option value="ClimateBestPath">{t('settings.coolRoutes')}</option>
                        <option value="ShortestPath">{t('settings.fastRoutes')}</option>
                    </select>
                </div>

                {/* Spracheinstellung */}
                <div className="setting-item">
                    <label
                        className="settings__label"
                        htmlFor="languageSelect"
                    >
                        {t('settings.language')}:
                    </label>
                    <select
                        id="languageSelect"
                        aria-label={t('settings.languageAria')}
                        value={language}
                        onChange={handleLanguageChange}
                        className="block w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                    >
                        <option value="de">{t('settings.german')}</option>
                        <option value="en">{t('settings.english')}</option>
                    </select>
                </div>

                {/* Push-Benachrichtigungen */}
                <div className="setting-item flex items-center justify-between">
                    <label
                        className="settings__label"
                        htmlFor="notificationsToggle"
                    >
                        {t('settings.notifications')}:
                    </label>
                    <label className="settings-item switch">
                        <input
                            id="notificationsToggle"
                            aria-label={t('settings.notificationsAria')}
                            type="checkbox"
                            checked={notificationsEnabled}
                            onChange={handleNotificationToggle}
                        />
                        <span className="toggle round"></span>
                    </label>
                </div>

                {/* Kontextbezogene Informationen */}
                <div className="setting-item flex items-center justify-between">
                    <label
                        className="settings__label"
                        htmlFor="contextInfoToggle"
                    >
                        {t('settings.contextInfo')}:
                    </label>
                    <label className="settings-item switch">
                        <input
                            id="contextInfoToggle"
                            aria-label={t('settings.contextInfoAria')}
                            type="checkbox"
                            checked={contextInfoEnabled}
                            onChange={handleContextInfoToggle}
                        />
                        <span className="toggle round"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <label
                        className="settings__label"
                        htmlFor="voiceSelect"
                    >
                        {t('settings.voiceSelection')}:
                    </label>
                    <select
                        id="voiceSelect"
                        aria-label={t('settings.voiceSelectionAria')}
                        value={selectedVoice}
                        onChange={handleSelectedVoiceChange}
                        className="block w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                    >
                        {voices.map((voice, index) => (
                            <option key={index} value={index}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <Footer setRoute={setRoute}
                    routeStartAddress={routeStartAddress} setRouteStartAddress={setRouteStartAddress}
                    routeEndAddress={routeEndAddress} setRouteEndAddress={setRouteEndAddress} />
        </div>

    );
};

export default Settings;
