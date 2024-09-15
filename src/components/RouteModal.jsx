import React from 'react';
import {useTranslation} from 'react-i18next';
import {MdOutgoingMail, MdRoute} from "react-icons/md";

const RouteModal = ({
                        showModal,
                        closeModal,
                        routeStartAddress,
                        setRouteStartAddress,
                        routeEndAddress,
                        setRouteEndAddress,
                        startAddressSuggestions,
                        filterStartAddressSuggestions,
                        endAddressSuggestions,
                        filterEndAddressSuggestions,
                        routePreference,
                        setRoutePreference,
                        getRoute
                    }) => {
    const {t} = useTranslation();

    const handleRoutePreferenceChange = (e) => {
        const value = e.target.value;
        setRoutePreference(value);
    };

    if (!showModal) return null; // Render nothing if modal is not visible

    return (
        <div className="modal modal--route" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className={`modal__icon-container modal__bg--information`}>
                        <MdRoute className="modal__icon modal__icon--information"/>
                    </div>
                    <h2 className="modal__headline">{t('footer.planRoute')}</h2>
                </div>
                <div className="modal__content">
                    <div className="setting-item">
                        <label
                            className="settings__label">{t('settings.startAddress')}:</label>
                        <input
                            type="text"
                            placeholder={t('footer.input_startAddress_placeholder') + "..."}
                            className="settings__input"
                            value={routeStartAddress}
                            onChange={(e) => {
                                setRouteStartAddress(e.target.value);
                                filterStartAddressSuggestions(e.target.value);
                            }}
                        />
                        {startAddressSuggestions.length > 0 && (
                            <ul className="address-suggestions">
                                {startAddressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setRouteStartAddress(suggestion);
                                            filterStartAddressSuggestions(""); // Clear suggestions after selection
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="setting-item">
                        <label
                            className="settings__label">{t('settings.targetAddress')}:</label>
                        <input
                            type="text"
                            placeholder={t('footer.input_targetAddress_placeholder') + "..."}
                            className="settings__input"
                            value={routeEndAddress}
                            onChange={(e) => {
                                setRouteEndAddress(e.target.value);
                                filterEndAddressSuggestions(e.target.value);
                            }}
                        />
                        {endAddressSuggestions.length > 0 && (
                            <ul className="address-suggestions">
                                {endAddressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setRouteEndAddress(suggestion);
                                            filterEndAddressSuggestions(""); // Clear suggestions after selection
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="setting-item">
                        <label
                            className="settings__label">{t('settings.routePreference')}:</label>
                        <select
                            value={routePreference}
                            onChange={handleRoutePreferenceChange}
                            className="block w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                        >
                            <option value="ClimateBestPath">{t('settings.coolRoutes')}</option>
                            <option value="ShortestPath">{t('settings.fastRoutes')}</option>
                            <option value="ClimateBestPathNearCoolAreas">{t('settings.coolAreasRoutes')}</option>
                        </select>
                    </div>
                    <div className="modal__footer">
                        <div className="modal__button-container">
                            <button type="button" className="modal__button modal__button--cancel"
                                    onClick={closeModal}>
                                {t('footer.abort')}
                            </button>
                            <button type="button" className="modal__button modal__button--submit"
                                    onClick={getRoute}>
                                {t('footer.start')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteModal;
