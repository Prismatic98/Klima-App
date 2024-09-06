import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    MdHome,
    MdSearch,
    MdOutlineSettings,
    MdClose,
    MdRoute,
    MdWaterDrop,
    MdOutlineAcUnit
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';

const Footer = ({ setRoute }) => {  // setRoute wird als Prop empfangen
    const { t } = useTranslation();
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [allAddresses, setAllAddresses] = useState([]);
    const [startAddressSuggestions, setStartAddressSuggestions] = useState([]);
    const [endAddressSuggestions, setEndAddressSuggestions] = useState([]);
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 5);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddressSuggestions = () => {
            const preparedQueryUrl = '/EntityServerAPI/entities';

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
        setShowOverlay(true);
    };

    const closeOverlay = () => {
        setShowOverlay(false);
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

    const handleRoutePreferenceChange = (e) => {
        const value = e.target.value;
        setRoutePreference(value);
    };

    // Funktion zur Ausführung der Anfrage bei Klick auf "Los"
    const getRoute = () => {
        const preparedQueryUrl = '/ContextServerAPI/predefined';

        const params = new URLSearchParams();
        params.append('application', 'DerendorfPlan');
        params.append('situation', 'ClimateBestPath');
        params.append('query', 'ClimateBestPath');
        params.append('part_StartingBuilding', JSON.stringify({ name: startAddress }));
        params.append('part_EndingBuilding', JSON.stringify({ name: endAddress }));
        params.append('param_breakAfterMS', '1000');
        params.append('param_resultSize', '1');
        params.append('param_maxOptSteps', '300');

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        };

        fetch(preparedQueryUrl, options)
            .then(response => response.json())
            .then(data => {
                if (data.result && data.result.length > 0) {
                    const coordinates = [];
                    data.result[0].forEach(step => {
                        if (step.toEntity) {
                            if (step.fromEntity.attributes.polygonType === 'Line') {
                                const points = step.toEntity.attributes.position.PolygonPoints;
                                points.forEach(point => {
                                    coordinates.push([point.y, point.x]);
                                });
                            } else {
                                const x = step.toEntity.attributes.position.xCentral;
                                const y = step.toEntity.attributes.position.yCentral;
                                coordinates.push([y, x]);
                            }
                        }
                    });
                    setRoute(coordinates);  // Route wird gesetzt
                    goToHome();
                    closeOverlay();  // Overlay wird geschlossen
                }
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div className="footer__wrapper">
            <footer className="footer">
                <MdHome className="footer__icon" onClick={goToHome} />

                {/*{location.pathname === '/' && (*/}
                    <div className="footer__button-container">
                        <button className="footer__button footer__button--big" onClick={closeOverlay}>
                            {isSearchActive ? (
                                <MdClose className="footer__icon footer__icon--big" />
                            ) : (
                                <MdSearch className="footer__icon footer__icon--big" />
                            )}
                        </button>

                        <div className="half-circle-button-wrapper">
                            <div className={"footer__button half-circle-button half-circle-button"+ (showButtons ? '--show' : '--hidden')} onClick={handleRouteClick}>
                                <MdRoute className="footer__icon"/>
                            </div>
                            <div className={"footer__button half-circle-button half-circle-button"+ (showButtons ? '--show' : '--hidden')} >
                                <MdWaterDrop className="footer__icon"/>
                            </div>
                            <div className={"footer__button half-circle-button half-circle-button"+ (showButtons ? '--show' : '--hidden')} >
                                <MdOutlineAcUnit className="footer__icon"/>
                            </div>
                        </div>
                    </div>
                {/*)}*/}

                <MdOutlineSettings className="footer__icon" onClick={goToSettings} />
            </footer>

            {showOverlay && (
                <div className="overlay" onClick={closeOverlay}>
                    <div className="overlay__content" onClick={(e) => e.stopPropagation()}>
                        <h2>{t('footer.planRoute')}</h2>

                        <input
                            type="text"
                            placeholder={t('footer.input_startAddress_placeholder') + "..."}
                            className="search-container__input"
                            value={startAddress}
                            onChange={(e) => {
                                setStartAddress(e.target.value);
                                filterStartAddressSuggestions(e.target.value);
                            }}
                        />
                        {startAddressSuggestions.length > 0 && (
                            <ul className="address-suggestions">
                                {startAddressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setStartAddress(suggestion);
                                            setStartAddressSuggestions([]);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <input
                            type="text"
                            placeholder={t('footer.input_targetAddress_placeholder') + "..."}
                            className="search-container__input"
                            value={endAddress}
                            onChange={(e) => {
                                setEndAddress(e.target.value);
                                filterEndAddressSuggestions(e.target.value);
                            }}
                        />
                        {endAddressSuggestions.length > 0 && (
                            <ul className="address-suggestions">
                                {endAddressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setEndAddress(suggestion);
                                            setEndAddressSuggestions([]);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="slidecontainer">
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

                        <div className="overlay__button-container">
                            <button
                                className="overlay__button--cancel bg-red-600"
                                onClick={closeOverlay}
                            >
                                {t('footer.abort')}
                            </button>
                            <button
                                className="overlay__button--submit bg-blue-600"
                                onClick={getRoute}
                            >
                                {t('footer.start')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Footer;
