import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MdClose, MdRoute, MdMyLocation, MdSwapVert, MdLocationOn, MdInfo} from "react-icons/md";
import InfoModal from "./InfoModal";

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
                        getRoute,
                        stopover,
                        setStopover,
                        currentPosition,
                        isLoading, setIsLoading, loadingMessage, setLoadingMessage
                    }) => {
    const {t} = useTranslation();
    const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
    const [infoModalHeadline, setInfoModalHeadline] = useState('');
    const [infoModalContent, setInfoModalContent] = useState('');
    const [infoModalHint, setInfoModalHint] = useState('');

    const handleRoutePreferenceChange = (e) => {
        const value = e.target.value;
        setRoutePreference(value);
    };

    /*const swapAddresses = () => {
        const temp = routeStartAddress;
        setRouteStartAddress(routeEndAddress);
        setRouteEndAddress(temp);
    };*/

    if (!showModal) return null;

    const openInfoModal = (topic) => {
        let content = '';
        let headline = '';
        let hint = ''

        switch (topic) {
            case 'routePreference':
                headline = t('settings.routePreference');
                content = t('settings.information.routePreference');
                hint = 'Änderungen an dieser Stelle werden nicht gespeichert, sie gelten nur für die aktuelle Route.';
                break;
            case 'stopover':
                headline = t('settings.stopover');
                content = t('settings.information.stopover');
                break;
        }

        setInfoModalHeadline(headline);
        setInfoModalContent(content);
        setInfoModalHint(hint);
        setInfoModalIsOpen(true);
    }

    return (
        <div className="modal modal--route" onClick={closeModal}>
            <InfoModal modalIsOpen={infoModalIsOpen} closeModal={() => setInfoModalIsOpen(false)} headline= {infoModalHeadline} content={infoModalContent} hint={infoModalHint}></InfoModal>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <MdLocationOn className="icon icon--information"/>
                    <h2 className="modal__headline">{t('footer.planRoute')}</h2>
                </div>
                <div className="modal__content">
                    {/* Startadresse */}
                    <div className="setting-item relative">
                        <label className="settings__label">{t('settings.startAddress')}:</label>
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
                        {routeStartAddress ? (
                            <MdClose
                                className="settings__input-clear"
                                onClick={() => {
                                    setRouteStartAddress('');
                                    filterStartAddressSuggestions('');
                                }}
                                aria-label={t('general.clear')}
                            />
                        ) : (
                            <MdMyLocation
                                className="settings__input-clear"
                                onClick={() => {
                                    setRouteStartAddress(`${currentPosition.lat}, ${currentPosition.lng}`);
                                }}
                                aria-label={t('settings.useCurrentLocation')}
                            />
                        )}

                        {startAddressSuggestions.length > 0 && (
                            <ul className="address-suggestions">
                                {startAddressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setRouteStartAddress(suggestion.name);
                                            filterStartAddressSuggestions(""); // Clear suggestions after selection
                                        }}
                                    >
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Button zum Vertauschen der Adressen */}
                    {/*<div className="text-center my-2">
                        <button
                            type="button"
                            className="swap-button bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
                            onClick={swapAddresses}
                        >
                            <MdSwapVert className="text-lg" />
                            <span className="sr-only">{t('settings.swapAddresses')}</span>
                        </button>
                    </div>*/}

                    {/* Zieladresse */}
                    <div className="setting-item relative">
                        <label className="settings__label">{t('settings.targetAddress')}:</label>
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
                        {routeEndAddress && (
                            <MdClose
                                className="settings__input-clear"
                                onClick={() => {
                                    setRouteEndAddress('');
                                    filterEndAddressSuggestions('');
                                }}
                                aria-label={t('general.clear')}
                            />
                        )}
                        {endAddressSuggestions.length > 0 && (
                            <ul className="address-suggestions">
                                {endAddressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setRouteEndAddress(suggestion.name);
                                            filterEndAddressSuggestions(""); // Clear suggestions after selection
                                        }}
                                    >
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Route Preference Slider */}
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
                    <div className="settings-item">
                        <div className="settings__label-wrapper mt-2">
                            <label
                                className="settings__label"
                            >
                                Zwischenhalt einfügen
                            </label>
                            <MdInfo className="icon text-blue-600" onClick={() => openInfoModal('stopover')}/>
                        </div>
                        <div className="setting-item flex justify-between">
                            <div className="settings__label-wrapper mb-3">
                                <label
                                    className="text-sm text-gray-600"
                                    htmlFor="drinkPlaceStop"
                                >
                                    Trinkmöglichkeit
                                </label>
                            </div>
                            <label className="settings-item switch">
                                <input
                                    id="drinkPlaceStop"
                                    type="checkbox"
                                    checked={stopover === 'Refillstation, Trinkbrunnen'}
                                    onChange={() => stopover === 'Refillstation, Trinkbrunnen' ? setStopover('') : setStopover('Refillstation, Trinkbrunnen')}
                                />
                                <span className="toggle round"></span>
                            </label>
                        </div>
                        <div className="setting-item flex justify-between">
                            <div className="settings__label-wrapper">
                                <label
                                    className="text-sm text-gray-600"
                                    htmlFor="coolPlaceStop"
                                >
                                    Kühler Ort
                                </label>
                            </div>
                            <label className="settings-item switch">
                                <input
                                    id="coolPlaceStop"
                                    type="checkbox"
                                    checked={stopover === 'Wasserspielplatz'}
                                    onChange={() => stopover === 'Wasserspielplatz' ? setStopover('') : setStopover('Wasserspielplatz')}
                                />
                                <span className="toggle round"></span>
                            </label>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal__footer">
                        <div className="button-container">
                            <button type="button" className="button__primary button__primary--cancel" onClick={closeModal}>
                                {t('general.abort')}
                            </button>
                            <button type="button" className="button__primary button__primary--submit" onClick={getRoute}>
                                {t('general.start')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteModal;
