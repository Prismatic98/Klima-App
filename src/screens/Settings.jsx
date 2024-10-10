import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { useSpeechSynthesis } from 'react-speech-kit';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DebugModal from "../components/DebugModal";
import {MdInfo} from "react-icons/md";
import InfoModal from "../components/InfoModal";
import WeatherDataModal from "../components/WeatherDataModal";
import NotificationsModal from "../components/NotificationsModal";

const Settings = ({ weatherData, notifications, setNotifications }) => {
    const { t, i18n } = useTranslation();
    const { voices } = useSpeechSynthesis();
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 50);
    const [notificationsEnabled, setNotificationsEnabled] = useState(savedSettings?.notificationsEnabled ?? true);
    const [coolPlaceDistance, setCoolPlaceDistance] = useState(savedSettings?.coolPlaceDistance ?? 200);
    const [language, setLanguage] = useState(savedSettings?.language ?? (i18n.language || 'de'));
    const [contextInfoEnabled, setContextInfoEnabled] = useState(savedSettings?.contextInfoEnabled ?? true);
    // const [selectedVoice, setSelectedVoice] = useState(savedSettings?.selectedVoice ?? 0);
    const [debugModalIsOpen, setDebugModalIsOpen] = useState(false);
    const [notificationsModalIsOpen, setNotificationsModalIsOpen] = useState(false);
    const [weatherDataModalIsOpen, setWeatherDataModalIsOpen] = useState(false);
    const [debugContent, setDebugContent] = useState([]);
    const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
    const [infoModalHeadline, setInfoModalHeadline] = useState('');
    const [infoModalContent, setInfoModalContent] = useState('');

    // Hilfsfunktion zum Speichern der Einstellungen
    const saveSettings = (newSettings) => {
        const updatedSettings = {
            notificationsEnabled,
            coolPlaceDistance,
            routePreference,
            language,
            contextInfoEnabled,
            // selectedVoice,
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

    const openInfoModal = (topic) => {
        let content = '';
        let headline = '';

        switch (topic) {
            case 'coolPlaceDistance':
                headline = t('settings.coolPlaceDistance');
                content = t('settings.information.coolPlaceDistance');
                break;
            case 'routePreference':
                headline = t('settings.routePreference');
                content = t('settings.information.routePreference');
                break;
            case 'notifications':
                headline = t('settings.notifications');
                content = t('settings.information.notifications');
                break;
            case 'contextInfo':
                headline = t('settings.contextInfo');
                content = t('settings.information.contextInfo');
                break;
        }

        setInfoModalHeadline(headline);
        setInfoModalContent(content);
        setInfoModalIsOpen(true);
    }

    /*const handleSelectedVoiceChange = (e) => {
        const value = e.target.value;
        setSelectedVoice(value);
        saveSettings({ selectedVoice: value });
    };*/

    return (
        <div className="settings min-h-screen flex flex-col">
            <Header
                title={t('settings.title')}
                setDebugModalIsOpen={() => setDebugModalIsOpen(!debugModalIsOpen)}
                setWeatherDataModalIsOpen={() => setWeatherDataModalIsOpen(!weatherDataModalIsOpen)}
                weatherData={weatherData}
                setNotificationsModalIsOpen={() => setNotificationsModalIsOpen(!notificationsModalIsOpen)}
                notifications={notifications}/>
            <WeatherDataModal modalIsOpen={weatherDataModalIsOpen} closeModal={() => setWeatherDataModalIsOpen(false)} headline={'Wetter'} weatherData={weatherData}></WeatherDataModal>
            <DebugModal modalIsOpen={debugModalIsOpen} closeModal={() => setDebugModalIsOpen(false)} mode={'information'} headline={'Konsoleninhalt'} debugContent={debugContent}></DebugModal>
            <NotificationsModal modalIsOpen={notificationsModalIsOpen} closeModal={() => setNotificationsModalIsOpen(false)} notifications={notifications} setNotifications={setNotifications}></NotificationsModal>
            <InfoModal modalIsOpen={infoModalIsOpen} closeModal={() => setInfoModalIsOpen(false)} headline= {infoModalHeadline} content={infoModalContent}></InfoModal>
            <div className="content flex-grow p-6 space-y-8 bg-white rounded-lg max-w-lg mx-auto">

                {/* Distanz zu kühlen Orten */}
                <div className="setting-item slidecontainer">
                    <div className="settings__label-wrapper">
                        <label
                            className="settings__label"
                            htmlFor="coolPlaceDistanceRange"
                        >
                            {t('settings.coolPlaceDistance')}
                        </label>
                        <MdInfo className="icon text-blue-600" onClick={() => openInfoModal('coolPlaceDistance')} />
                    </div>
                    <input
                        type="range"
                        id="coolPlaceDistanceRange"
                        aria-label={t('settings.coolPlaceDistanceAria')}
                        min="0"
                        max="1000"
                        step="5"
                        value={coolPlaceDistance}
                        className="slider w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        onChange={handleCoolPlaceDistanceChange}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                        {coolPlaceDistance} {t('settings.meters')}
                    </p>
                </div>

                {/* Routenpräferenz */}
                <div className="setting-item slidecontainer">
                    <div className="settings__label-wrapper">
                        <label
                            className="settings__label"
                            htmlFor="routePreferenceSlider"
                        >
                            {t('settings.routePreference')}
                        </label>
                        <MdInfo className="icon text-blue-600" onClick={() => openInfoModal('routePreference')}/>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('settings.coolRoutes')}</span>
                        <span className="text-sm text-gray-600">{t('settings.fastRoutes')}</span>
                    </div>
                    <input
                        type="range"
                        id="routePreferenceSlider"
                        aria-label={t('settings.routePreferenceAria')}
                        min="0"
                        max="100"
                        step="1"
                        value={routePreference}
                        className="slider w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        onChange={handleRoutePreferenceChange}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{100 - routePreference}%</span>
                        <span className="text-sm text-gray-600">{routePreference}%</span>
                    </div>
                </div>


                {/* Spracheinstellung */}
                <div className="setting-item">
                    <label
                        className="settings__label"
                        htmlFor="languageSelect"
                    >
                        {t('settings.language')}
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
                <div className="setting-item flex justify-between">
                    <div className="settings__label-wrapper">
                        <label
                            className="settings__label"
                            htmlFor="notificationsToggle"
                        >
                            {t('settings.notifications')}
                        </label>
                        <MdInfo className="icon text-blue-600" onClick={() => openInfoModal('notifications')}/>
                    </div>
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
                {/*<div className="setting-item flex justify-between">
                    <div className="settings__label-wrapper">
                        <label
                            className="settings__label"
                            htmlFor="contextInfoToggle"
                        >
                            {t('settings.contextInfo')}
                        </label>
                        <MdInfo className="icon text-blue-600" onClick={() => openInfoModal('contextInfo')}/>
                    </div>
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
                </div>*/}

                {/*<div className="setting-item">
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
                </div>*/}
            </div>
            <Footer/>
        </div>

    );
};

export default Settings;
