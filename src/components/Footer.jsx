import React, {useState, useEffect} from 'react';
import {
    MdHome,
    MdSearch,
    MdOutlineSettings,
    MdClose,
    MdWaterDrop,
    MdOutlineAcUnit, MdFeedback, MdStopCircle, MdRecordVoiceOver, MdEditLocationAlt, MdMap, MdLocationOn
} from 'react-icons/md';
import {useNavigate, useLocation} from 'react-router-dom';
import FeedbackModal from "./FeedbackModal";
import RouteModal from "./RouteModal"
import {useSpeechSynthesis} from "react-speech-kit";
import {getPageText} from "../scripts/main";
import {getClimatePlaces, getRoute} from "../scripts/routeFunctions";
import {useTranslation} from "react-i18next";

const Footer = ({
                    route, setRoute, setRouteLength, setRouteDuration, routeStartAddress, setRouteStartAddress, routeEndAddress, setRouteEndAddress,
                    addresses, currentPosition, isLoading, setIsLoading, loadingMessage, setLoadingMessage
                }) => {  // setRoute wird als Prop empfangen
    const {t} = useTranslation();
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    let {speak, cancel, speaking, voices} = useSpeechSynthesis();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loadedVoices, setLoadedVoices] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [stopover, setStopover] = useState('');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [startAddressSuggestions, setStartAddressSuggestions] = useState([]);
    const [endAddressSuggestions, setEndAddressSuggestions] = useState([]);
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 50);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
        setShowButtons(!isSearchActive);
    };

    const goToHome = () => {
        navigate('/');
    };

    const goToSettings = () => {
        navigate('/settings');
    };

    const handleRouteClick = () => {
        setShowRouteModal(!showRouteModal);
        toggleSearch();
    };

    const closeModal = () => {
        setShowRouteModal(false);
        toggleSearch();
    };

    const filterStartAddressSuggestions = (query) => {
        if (query) {
            const filteredSuggestions = addresses.filter(address =>
                address.name.toLowerCase().includes(query.toLowerCase())
            );
            setStartAddressSuggestions(filteredSuggestions);
        } else {
            setStartAddressSuggestions([]);
        }
    };

    const filterEndAddressSuggestions = (query) => {
        if (query) {
            const filteredSuggestions = addresses.filter(address =>
                address.name.toLowerCase().includes(query.toLowerCase())
            );
            setEndAddressSuggestions(filteredSuggestions);
        } else {
            setEndAddressSuggestions([]);
        }
    };

    /*const handleShowCoolPlaces = async () => {
        const places = await getClimatePlaces(["Wasserspielplatz"]);
        setCoolPlaces(places);
        console.log(places)
        goToHome();
        closeModal();
    }*/

    /*const handleShowDrinkPlaces = async () => {
        const places = await getClimatePlaces(["Refillstation", "Trinkbrunnen"]);
        setDrinkPlaces(places);
        console.log(places[0]);
        goToHome();
        closeModal();
    }*/

    const handleStartRoute = async () => {
        closeModal();
        goToHome();
        setIsLoading(true);
        setLoadingMessage(t('loading.route'));
        const routeObject = await getRoute(routePreference, routeStartAddress, routeEndAddress, stopover);
        console.log(routeObject);
        setIsLoading(false);
        setRoute(routeObject.route);
        setRouteLength(routeObject.routeLength);
        setRouteDuration(routeObject.routeDuration);
    }

    const handleSpeak = () => {
        const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
        const voice = loadedVoices[savedSettings?.selectedVoice ?? 0];
        if (!speaking) {
            speak({
                text: getPageText(),
                voice: voice,
            });
            setIsSpeaking(true);
        }
    };

    const handleCancel = () => {
        cancel();
        setIsSpeaking(false);
    };

    const getActiveIcon = () => {
        if (isSpeaking) {
            return 'speak';
        } else if (showFeedbackForm) {
            return 'feedback';
        } else if (location.pathname === '/settings') {
            return 'settings';
        } else if (location.pathname === '/') {
            return 'map';
        }
    }

    useEffect(() => {
        if (voices.length > 0) {
            setLoadedVoices(voices);
        }
    }, [voices]);

    useEffect(() => {
        if (!speaking && isSpeaking) {
            setIsSpeaking(false);
        }
    }, [speaking, isSpeaking]);

    return (
        <div className="footer__wrapper">
            <footer className="footer">
                <FeedbackModal modalIsOpen={showFeedbackForm} closeModal={() => setShowFeedbackForm(false)} />
                <div className={`footer__item ${getActiveIcon() === 'map' ? 'footer__item--active' : ''}`} onClick={goToHome}>
                    <div className="icon-wrapper">
                        <MdMap className="icon" />
                    </div>
                    <span className="footer__label">{t('footer.map')}</span>
                </div>

                <div className={`footer__item ${getActiveIcon() === 'speak' ? 'footer__item--active' : ''}`} onClick={isSpeaking ? handleCancel : handleSpeak}>
                    <div className="icon-wrapper">
                        {isSpeaking ? (
                            <MdStopCircle className="icon" />
                        ) : (
                            <MdRecordVoiceOver className="icon" />
                        )}
                    </div>
                    <span className="footer__label">{isSpeaking ? t('footer.stop') : t('footer.speak')}</span>
                </div>

                {location.pathname === '/' && (
                    <div className="footer__item footer__item--primary">
                        {route.length > 0 ? (
                            <button className="button__dot button__dot--big bg-rose-600" onClick={() => setRoute([])}>
                                <div className="icon-wrapper">
                                    <MdClose className="icon icon--medium" />
                                </div>
                            </button>
                        ) : (
                            <button className={`button__dot button__dot--big ${isLoading ? 'button--disabled' : ''}`} onClick={handleRouteClick}>
                                <div className="icon-wrapper">
                                    {isSearchActive ? (
                                        <MdClose className="icon icon--medium" />
                                    ) : (
                                        <MdLocationOn className="icon icon--medium" />
                                    )}
                                </div>
                            </button>
                        )}
                        <span className="footer__label">{isSearchActive || route.length > 0 ? t('general.abort') : t('footer.route')}</span>

                        {/*<div className="half-circle-button-wrapper">
                            <div className={"button__dot half-circle-button half-circle-button" + (showButtons ? '--show' : '--hidden')} onClick={handleRouteClick}>
                                <div className="icon-wrapper">
                                    <MdEditLocationAlt className="icon" />
                                </div>
                                <span className="footer__label">{t('footer.editRoute')}</span>
                            </div>

                            <div className={"button__dot half-circle-button half-circle-button" + (showButtons ? '--show' : '--hidden')}>
                                <div className="icon-wrapper">
                                    <MdWaterDrop className="icon" />
                                </div>
                                <span className="footer__label">{t('footer.drinkPlaces')}</span>
                            </div>

                            <div className={"button__dot half-circle-button half-circle-button" + (showButtons ? '--show' : '--hidden')}>
                                <div className="icon-wrapper">
                                    <MdOutlineAcUnit className="icon" />
                                </div>
                                <span className="footer__label">{t('footer.coolPlaces')}</span>
                            </div>
                        </div>*/}
                    </div>
                )}

                <div className={`footer__item ${getActiveIcon() === 'feedback' ? 'footer__item--active' : ''}`} onClick={() => setShowFeedbackForm(!showFeedbackForm)}>
                    <div className="icon-wrapper">
                        <MdFeedback className="icon" />
                    </div>
                    <span className="footer__label">{t('footer.feedback')}</span>
                </div>

                <div className={`footer__item ${getActiveIcon() === 'settings' ? 'footer__item--active' : ''}`} onClick={goToSettings}>
                    <div className="icon-wrapper">
                        <MdOutlineSettings className="icon" />
                    </div>
                    <span className="footer__label">{t('footer.options')}</span>
                </div>
            </footer>


            <RouteModal showModal={showRouteModal} closeModal={closeModal} routeStartAddress={routeStartAddress}
                        setRouteStartAddress={setRouteStartAddress} routeEndAddress={routeEndAddress}
                        setRouteEndAddress={setRouteEndAddress} startAddressSuggestions={startAddressSuggestions}
                        filterStartAddressSuggestions={filterStartAddressSuggestions}
                        endAddressSuggestions={endAddressSuggestions}
                        filterEndAddressSuggestions={filterEndAddressSuggestions} routePreference={routePreference}
                        setRoutePreference={setRoutePreference} getRoute={handleStartRoute} currentPosition={currentPosition}
                        stopover={stopover} setStopover={setStopover}
                        isLoading={isLoading} setIsLoading={setIsLoading}
                        loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage}
            />
        </div>
    );
};

export default Footer;
