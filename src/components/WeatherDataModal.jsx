import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    MdInfo,
    MdWaterDrop,
    MdDeviceThermostat,
    MdAir,
    MdOutlineBeachAccess, MdFlashOn, MdSunny
} from 'react-icons/md';
import {BsCloudFill} from "react-icons/bs";

const getConditionTranslation = (condition, t) => {
    const conditionTranslations = {
        "dry": t('weather.dry'),
        "fog": t('weather.fog'),
        "rain": t('weather.rain'),
        "sleet": t('weather.sleet'),
        "snow": t('weather.snow'),
        "hail": t('weather.hail'),
        "thunderstorm": t('weather.thunderstorm'),
        "default": t('general.noData')
    };
    return conditionTranslations[condition] || conditionTranslations["default"];
};

const WeatherDataModal = ({ modalIsOpen, closeModal, headline, weatherData }) => {
    const { t } = useTranslation();

    if (!modalIsOpen) return null;

    return (
        <div className="modal modal--weather" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header modal__header--info">
                    <MdInfo className="icon icon--information" />
                    <h2 className="modal__headline">{headline}</h2>
                </div>
                <div className="modal__content">
                    <div className="modal__text">
                        {weatherData ? (
                            <div className="weather-info">
                                <div className="weather-info__item">
                                    <BsCloudFill className="icon icon--gray" />
                                    <span>{t('weather.condition')}: {weatherData.condition ? getConditionTranslation(weatherData.condition, t) : t('general.noData')}</span>
                                </div>

                                {/* Temperatur */}
                                <div className="weather-info__item">
                                    <MdDeviceThermostat className="icon icon--gray" />
                                    <span>{t('weather.temperature')}: {weatherData.temperature !== null ? `${Math.round(weatherData.temperature).toString()}°C` : t('general.noData')}</span>
                                </div>

                                {/* Windgeschwindigkeit */}
                                <div className="weather-info__item">
                                    <MdAir className="icon icon--gray" />
                                    <span>{t('weather.windSpeed')}: {weatherData.wind_speed !== null ? `${weatherData.wind_speed} km/h` : t('general.noData')}</span>
                                </div>

                                {/* Luftfeuchtigkeit */}
                                <div className="weather-info__item">
                                    <MdWaterDrop className="icon icon--gray" />
                                    <span>{t('weather.humidity')}: {weatherData.relative_humidity !== null ? `${weatherData.relative_humidity}%` : t('general.noData')}</span>
                                </div>

                                {/* Niederschlag */}
                                <div className="weather-info__item">
                                    <MdOutlineBeachAccess className="icon icon--gray" />
                                    <span>{t('weather.precipitationProbability')}: {weatherData.precipitation_probability !== null ? `${weatherData.precipitation_probability}%` : t('general.noData')}</span>
                                </div>

                                {/* Sonneneinstrahlung */}
                                <div className="weather-info__item">
                                    <MdSunny className="icon icon--gray" />
                                    <span>{t('weather.solarIrradiation')}: {weatherData.solar !== null ? `${weatherData.solar} kWh/m²` : t('general.noData')}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="weather-info__no-data">
                                {t('general.noDataAvailable')}
                            </div>
                        )}
                    </div>
                    <div className="modal__footer">
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
        </div>
    );
};

export default WeatherDataModal;
