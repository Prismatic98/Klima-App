import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    MdFoggy,
    MdLocalFireDepartment,
    MdOutlineAcUnit, MdOutlineAir, MdOutlineBeachAccess, MdOutlineFlood,
    MdOutlineThunderstorm,
    MdOutlineWbSunny
} from "react-icons/md";

const WeatherModal = ({ modalIsOpen, closeModal, warnings }) => {
    const { t, i18n } = useTranslation();
    if (!modalIsOpen) return null;

    // Funktion, um das passende Icon und die Farben basierend auf dem Modus zu definieren
    const getWarningIcon = (mode) => {
        switch (mode) {
            case 'heavy rain':
            case 'very heavy rain':
            case 'persistent rain':
            case 'heavy persistent rain':
            case 'extremely persistent rain':
            case 'extremely heavy rain':
                return (
                    <MdOutlineBeachAccess className="weather-modal__icon weather-modal__icon--rain" />
                );
            case 'high UV Index':
            case 'strong heat':
            case 'extreme heat':
                return (
                    <MdLocalFireDepartment className="weather-modal__icon weather-modal__icon--heat" />
                );
            case 'wind gusts':
            case 'gale-force gusts':
            case 'storm-force gusts':
            case 'violent storm gusts':
            case 'hurricane-force gusts':
            case 'extreme hurricane-force gusts':
            case 'strong wind':
            case 'storm':
                return (
                    <MdOutlineAir className="weather-modal__icon weather-modal__icon--wind" />
                );
            case 'fog':
            case 'thaw':
            case 'heavy thaw':
                return (
                    <MdFoggy className="weather-modal__icon weather-modal__icon--fog" />
                );
            case 'Überflutung':
                return (
                    <MdOutlineFlood className="weather-modal__icon weather-modal__icon--flood" />
                );
            case 'thunderstorms':
            case 'heavy thunderstorms':
            case 'heavy thunderstorms with gale- or storm-force gusts':
            case 'heavy thunderstorms with heavy rain':
            case 'heavy thunderstorms with gale- or storm-force gusts and heavy rain':
            case 'heavy thunderstorms with gale- or storm-force gusts, heavy rain and hail':
            case 'heavy thunderstorms with gale- or storm-force gusts and very heavy rain':
            case 'severe thunderstorms':
            case 'severe thunderstorms with violent storm or hurricane-force gusts':
            case 'severe thunderstorms with violent storm or hurricane-force gusts and very heavy rain':
            case 'severe thunderstorms with violent storm or hurricane-force gusts, very heavy rain and hail':
            case 'extreme thunderstorms':
            case 'extreme thunderstorms with gale- or storm-force gusts, extremely heavy rain and hail':
            case 'extreme thunderstorms with hurricane-force gusts, extremely heavy rain and hail':
            case 'extreme thunderstorms with extreme hurricane-force gusts':
            case 'extreme thunderstorms with extreme hurricane-force gusts and very heavy rain heavy rain and hail':
            case 'extreme thunderstorms with extreme hurricane-force gusts, very heavy rain and hail':
                return (
                    <MdOutlineThunderstorm className="weather-modal__icon weather-modal__icon--storm" />
                );
            case 'frost':
            case 'light snowfall':
            case 'snowfall':
            case 'heavy snowfall':
            case 'extremely heavy snowfall':
            case 'snow drifts':
            case 'heavy snow drifts':
            case 'extremely heavy snow drifts':
            case 'powerline vibrations':
            case 'severe frost':
            case 'slight risk of icy surfaces':
            case 'black ice':
            case 'extreme black ice':
            case 'icy surfaces':
                return (
                    <MdOutlineAcUnit className="weather-modal__icon weather-modal__icon--frost" />
                );
            default:
                return (
                    <MdOutlineWbSunny className="weather-modal__icon" />
                );
        }
    };

    return (
        <div className="weather-modal__container modal--weather">
            <div className="weather-modal__backdrop" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="weather-modal__wrapper">
                <div className="weather-modal__header">
                    <h3 className="weather-modal__headline">{t('weatherModal.weatherAlerts')}</h3>
                </div>
                <div className="weather-modal__content">
                    {warnings.map((warning, index) => (
                        <div key={index} className="weather-modal__warning">
                            <div className="weather-modal__icon-container">
                                {getWarningIcon(warning.mode)}
                            </div>
                            <div className="weather-modal__warning-content">
                                <h4 className="weather-modal__warning-headline">{warning.headline}</h4>
                                <p className="weather-modal__warning-text">{warning.textContent}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="weather-modal__footer">
                    <div className="modal__button-container">
                        <button
                            type="button"
                            className="weather-modal__button"
                            onClick={closeModal}
                        >
                            {t('general.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherModal;
