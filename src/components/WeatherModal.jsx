import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    MdFoggy,
    MdLocalFireDepartment,
    MdOutlineAcUnit, MdOutlineAir, MdOutlineBeachAccess, MdOutlineFlood,
    MdOutlineThunderstorm, MdOutlineWarning,
    MdOutlineWbSunny
} from "react-icons/md";

const WeatherModal = ({ modalIsOpen, closeModal, warnings }) => {
    const { t, i18n } = useTranslation();
    if (!modalIsOpen) return null;

    const getWarningIcon = (mode) => {
        switch (mode) {
            case 'heavy rain':
            case 'very heavy rain':
            case 'persistent rain':
            case 'heavy persistent rain':
            case 'extremely persistent rain':
            case 'extremely heavy rain':
                return (
                    <MdOutlineBeachAccess className="icon icon--large icon--rain" />
                );
            case 'high UV Index':
            case 'strong heat':
            case 'extreme heat':
                return (
                    <MdLocalFireDepartment className="icon icon--large icon--heat" />
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
                    <MdOutlineAir className="icon icon--large icon--wind" />
                );
            case 'fog':
            case 'thaw':
            case 'heavy thaw':
                return (
                    <MdFoggy className="icon icon--large icon--fog" />
                );
            case 'Überflutung':
                return (
                    <MdOutlineFlood className="icon icon--large icon--flood" />
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
                    <MdOutlineThunderstorm className="icon icon--large icon--storm" />
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
                    <MdOutlineAcUnit className="icon icon--large icon--frost" />
                );
            default:
                return (
                    <MdOutlineWbSunny className="icon icon--large icon--default" />
                );
        }
    };

    return (
        <div className="modal modal--weather" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className={`icon-container--header`}>
                        <MdOutlineWarning className="icon icon--default"/>
                    </div>
                    <h2 className="modal__headline">{t('weatherModal.weatherAlerts')}</h2>
                </div>
                <div className="modal__content">
                    {warnings.map((warning, index) => (
                        <div key={index} className="modal__warning">
                            <div className="icon-container">
                                {getWarningIcon(warning.mode)}
                            </div>
                            <div className="modal__warning-content">
                                <h4 className="modal__warning-headline">{warning.headline}</h4>
                                <p className="modal__warning-text">{warning.textContent}</p>
                            </div>
                        </div>
                    ))}
                    <div className="button-container">
                        <button
                            type="button"
                            className="button__primary button__primary--submit"
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
