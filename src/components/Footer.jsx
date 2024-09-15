import React, {useState, useEffect} from 'react';
import {
    MdHome,
    MdSearch,
    MdOutlineSettings,
    MdClose,
    MdWaterDrop,
    MdOutlineAcUnit, MdFeedback, MdStopCircle, MdRecordVoiceOver, MdEditLocationAlt
} from 'react-icons/md';
import {useNavigate} from 'react-router-dom';
import FeedbackModal from "./FeedbackModal";
import RouteModal from "./RouteModal"
import {useSpeechSynthesis} from "react-speech-kit";
import {getPageText} from "../scripts/main";
import {getRoute} from "../scripts/routeFunctions";

const Footer = ({setRoute, routeStartAddress, setRouteStartAddress, routeEndAddress, setRouteEndAddress}) => {  // setRoute wird als Prop empfangen
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    let {speak, cancel, speaking, voices} = useSpeechSynthesis();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loadedVoices, setLoadedVoices] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [allAddresses, setAllAddresses] = useState([]);
    const [startAddressSuggestions, setStartAddressSuggestions] = useState([]);
    const [endAddressSuggestions, setEndAddressSuggestions] = useState([]);
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 'ClimateBestPath');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddressSuggestions = () => {
            const preparedQueryUrl = 'http://localhost:8080/EntityServerAPI/entities';

            fetch(preparedQueryUrl, {
                'bypass-tunnel-reminder': '*'
            })
                .then(response => response.json())
                .then(data => {
                    const names = data.map(value => value.name);
                    setAllAddresses(names);
                })
                .catch(error => {
                    console.error(error);
                });
        };

        fetchAddressSuggestions();
    }, []);

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
        setShowButtons(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        toggleSearch();
    };

    const filterStartAddressSuggestions = (query) => {
        if (query) {
            const filteredSuggestions = allAddresses.filter(address =>
                address.toLowerCase().includes(query.toLowerCase())
            );
            setStartAddressSuggestions(filteredSuggestions);
        } else {
            setStartAddressSuggestions([]);
        }
    };

    const filterEndAddressSuggestions = (query) => {
        if (query) {
            const filteredSuggestions = allAddresses.filter(address =>
                address.toLowerCase().includes(query.toLowerCase())
            );
            setEndAddressSuggestions(filteredSuggestions);
        } else {
            setEndAddressSuggestions([]);
        }
    };

    const handleStartRoute = async () => {
        const route = await getRoute(routePreference, routeStartAddress, routeEndAddress);
        setRoute(route);
        goToHome();
        closeModal();
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
                <FeedbackModal modalIsOpen={showFeedbackForm} closeModal={() => setShowFeedbackForm(false)}></FeedbackModal>
                <MdHome className="footer__icon" onClick={goToHome}/>

                {isSpeaking ? (
                    <MdStopCircle className="footer__icon" onClick={isSpeaking ? handleCancel : handleSpeak}/> // Zeige das Abbrechen-Icon an
                ) : (
                    <MdRecordVoiceOver className="footer__icon" onClick={isSpeaking ? handleCancel : handleSpeak}/> // Zeige das Vorlesen-Icon an
                )}

                <div className="footer__button-container">
                    <button className="footer__button footer__button--big" onClick={closeModal}>
                        {isSearchActive ? (
                            <MdClose className="footer__icon footer__icon--big"/>
                        ) : (
                            <MdSearch className="footer__icon footer__icon--big"/>
                        )}
                    </button>

                    <div className="half-circle-button-wrapper">
                        <div
                            className={"footer__button half-circle-button half-circle-button" + (showButtons ? '--show' : '--hidden')}
                            onClick={handleRouteClick}>
                            <MdEditLocationAlt className="footer__icon"/>
                        </div>
                        <div
                            className={"footer__button half-circle-button half-circle-button" + (showButtons ? '--show' : '--hidden')}>
                            <MdWaterDrop className="footer__icon"/>
                        </div>
                        <div
                            className={"footer__button half-circle-button half-circle-button" + (showButtons ? '--show' : '--hidden')}>
                            <MdOutlineAcUnit className="footer__icon"/>
                        </div>
                    </div>
                </div>

                <MdFeedback className="footer__icon" onClick={() => setShowFeedbackForm(!showFeedbackForm)}/>
                <MdOutlineSettings className="footer__icon" onClick={goToSettings}/>
            </footer>

            <RouteModal showModal={showModal} closeModal={closeModal} routeStartAddress={routeStartAddress}
                          setRouteStartAddress={setRouteStartAddress} routeEndAddress={routeEndAddress}
                          setRouteEndAddress={setRouteEndAddress} startAddressSuggestions={startAddressSuggestions}
                          filterStartAddressSuggestions={filterStartAddressSuggestions}
                          endAddressSuggestions={endAddressSuggestions}
                          filterEndAddressSuggestions={filterEndAddressSuggestions} routePreference={routePreference}
                          setRoutePreference={setRoutePreference} getRoute={handleStartRoute}/>
        </div>
    );
};

export default Footer;
