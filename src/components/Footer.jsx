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
import {getPageText} from "../scripts/main";

const Footer = ({ setRoute, routeStartAddress, setRouteStartAddress, routeEndAddress, setRouteEndAddress }) => {  // setRoute wird als Prop empfangen
    const { t } = useTranslation();
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [allAddresses, setAllAddresses] = useState([]);
    const [startAddressSuggestions, setStartAddressSuggestions] = useState([]);
    const [endAddressSuggestions, setEndAddressSuggestions] = useState([]);
    const [routePreference, setRoutePreference] = useState(savedSettings?.routePreference ?? 5);
    const location = useLocation();
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
        const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';

        const params = new URLSearchParams();

        const routeLogic = routePreference;

        params.append('application', 'DerendorfPlan');
        params.append('situation', routeLogic);
        params.append('query', routeLogic);
        params.append('part_StartingBuilding', JSON.stringify({ name: routeStartAddress }));
        params.append('part_EndingBuilding', JSON.stringify({ name: routeEndAddress }));

        if (routeLogic === 'ClimateBestPathNearCoolAreas') {
            params.append('part_CoolPlaces', '');
            params.append('param_routeLengthWeight', '30');
            params.append('param_bioclimateWeigth', '50');
            params.append('param_coolPlaceMinDistanceWeight', '10');
            params.append('param_coolPlaceAvgDistanceWeight', '10');
            params.append('param_coolPlaceMaxDistanceWeight', '10');
            params.append('param_coolPlaceMaxDistance', savedSettings?.coolPlaceDistance ?? '5');
            params.append('param_maxDerivationRouteLength', '1.2');
            params.append('param_maxDerivationBioclimate', '');
        }

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

        // Funktion zur Bestimmung der Farbe basierend auf der bioclimateSituation
        const getColorBasedOnBioclimate = (bioclimateSituation) => {
            if (bioclimateSituation >= 9) {
                return '#d73027'; // Rot (unangenehm)
            } else if (bioclimateSituation >= 7) {
                return '#fdae61'; // Orange (weniger angenehm)
            } else if (bioclimateSituation >= 5) {
                return '#fee08b'; // Gelb (neutral)
            } else if (bioclimateSituation >= 3) {
                return '#66bd63'; // Hellgrün (angenehm)
            } else {
                return '#1a9850'; // Grün (sehr angenehm)
            }
        };

        const getCoordinates = (entity) => {
            const coordinates = [];
            if (entity) {
                const fromBioclimateSituation = entity.attributes.bioclimatesituation;
                const fromColor = getColorBasedOnBioclimate(fromBioclimateSituation);

                // Verarbeite fromEntity basierend auf dem PolygonType
                if (entity.attributes.position.PolygonType === 'Line') {
                    const fromPoints = entity.attributes.position.PolygonPoints;
                    fromPoints.forEach((point) => {
                        coordinates.push({
                            lat: point.y,
                            lng: point.x,
                            bioclimateSituation: fromBioclimateSituation,
                            color: fromColor
                        });
                    });
                } else if (entity.attributes.position.PolygonType === 'Polygone') {
                    const fromX = entity.attributes.position.xCentral;
                    const fromY = entity.attributes.position.yCentral;
                    const fromBounds = entity.attributes.position.PolygonPoints;

                    coordinates.push({
                        lat: fromY,
                        lng: fromX,
                        bioclimateSituation: fromBioclimateSituation,
                        color: fromColor,
                        bounds: fromBounds
                    });
                } else {
                    const x = entity.attributes.position.xCentral;
                    const y = entity.attributes.position.yCentral;

                    coordinates.push({
                        lat: y,
                        lng: x,
                        bioclimateSituation: fromBioclimateSituation,
                        color: fromColor
                    });
                }
            }
            return coordinates;
        }

        fetch(preparedQueryUrl, options)
            .then(response => response.json())
            .then(data => {
                if (data.result && data.result.length > 0) {
                    const bigRoute = [];
                    // Schleife durch die Schritte
                    data.result[0].forEach(step => {
                        let coordinates = getCoordinates(step.fromEntity);
                        if (coordinates.length > 0)
                            bigRoute.push(coordinates);
                        coordinates = getCoordinates(step.toEntity);
                        if (coordinates.length > 0)
                            bigRoute.push(coordinates);
                    });

                    bigRoute.pop();

                    setRoute(bigRoute);     // Update React Property
                    goToHome();
                    closeOverlay();
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
                                            setEndAddressSuggestions([]);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="setting-item">
                            <label className="block text-gray-700 text-sm font-bold mb-2">{t('settings.routePreference')}:</label>
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
