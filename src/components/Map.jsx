import React, {useEffect, useState, useRef} from 'react';
import {MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Polygon} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    MdClose,
    MdMyLocation,
    MdOutlineAcUnit,
    MdWaterDrop,
    MdDirectionsWalk,
    MdAccessTime,
    MdLocationOn, MdArrowRight, MdArrowForward
} from 'react-icons/md';

import ReactDOMServer from 'react-dom/server';
import {sendNotification, calculateDistance, canSendNotification} from "../scripts/main";
import LocationModal from "./LocationModal";
import {useTranslation} from "react-i18next";
import {getRoute, getRouteToCoolPlace} from "../scripts/routeFunctions";

const startIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const endIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const Map = ({
                 route,
                 setRoute,
                 routeLength,
                 routeDuration,
                 setRouteLength,
                 setRouteDuration,
                 routeStartAddress,
                 setRouteStartAddress,
                 routeEndAddress,
                 setRouteEndAddress,
                 coolPlaces,
                 drinkPlaces,
                 currentPosition,
                 notifications,
                 setNotifications,
                 isLoading,
                 setIsLoading,
                 loadingMessage,
                 setLoadingMessage,
                 locationModalIsOpen,
                 setLocationModalIsOpen,
                 locationNear,
                 openLocationModal,
                 setNotificationsModal,
                hasFitBounds,
                setHasFitBounds
             }) => {
    const {t} = useTranslation();
    const [heading, setHeading] = useState(0); // Blickrichtung
    const headingHistory = useRef([]); // Array zur Speicherung der letzten Kompasswerte
    const [useCompass, setUseCompass] = useState(false); // Zustand für die Nutzung der Compass-Daten
    const [isMapCentered, setIsMapCentered] = useState(false);

    const currentLocationIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#007bff" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-navigation">
      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
    </svg>
    `;

    const fallbackLocationIconSVG = `
    <div class="location-pulse"></div>
    <div class="location-dot"></div>
    `;

    const coolPlaceIcon = () => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="pin"></div>
               <div class="pin-icon">
                   ${ReactDOMServer.renderToString(<MdOutlineAcUnit style={{ fontSize: '18px', color: '#fff' }} />)}
               </div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -42]
        });
    };

    const drinkPlaceIcon = () => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="pin"></div>
               <div class="pin-icon">
                   ${ReactDOMServer.renderToString(<MdWaterDrop style={{ fontSize: '18px', color: '#fff' }} />)}
               </div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -42]
        });
    };

    const smoothCompassValue = (newHeading) => {
        const maxHistorySize = 10; // Anzahl der Werte, die für die Glättung gespeichert werden
        const weightFactor = 0.7; // Faktor, der den Einfluss der neueren Werte gewichtet
        const lastHeading = headingHistory.current.length ? headingHistory.current[headingHistory.current.length - 1] : newHeading;

        let delta = newHeading - lastHeading;

        if (delta > 180) {
            delta -= 360;
        } else if (delta < -180) {
            delta += 360;
        }

        const adjustedHeading = lastHeading + delta;

        headingHistory.current.push(adjustedHeading);

        if (headingHistory.current.length > maxHistorySize) {
            headingHistory.current.shift(); // Entferne den ältesten Wert
        }

        let weightedSum = 0;
        let weightSum = 0;

        headingHistory.current.forEach((value, index) => {
            const weight = Math.pow(weightFactor, headingHistory.current.length - index - 1);
            weightedSum += value * weight;
            weightSum += weight;
        });

        let smoothedHeading = weightedSum / weightSum;

        if (smoothedHeading < 0) {
            smoothedHeading += 360;
        } else if (smoothedHeading >= 360) {
            smoothedHeading -= 360;
        }

        return smoothedHeading;
    };

    const checkDistanceAndNotify = (place, placeType) => {
        if (currentPosition) {
            const { xCentral: targetLng, yCentral: targetLat } = place.attributes.position;
            const distance = calculateDistance(currentPosition.lat, currentPosition.lng, targetLat, targetLng);

            if (canSendNotification({ name: place.name }, distance)) {
                sendNotification(`In der Nähe: ${place.name}`, {
                    body: `Sie befinden sich in der Nähe von ${place.name}.`,
                    icon: "/android/android-launchericon-512-512.png",
                    tag: `notification-${place.id}`
                });
                setNotifications(prevNotifications => {
                    const updatedNotifications = [
                        ...prevNotifications,
                        {
                            place,
                            placeType,
                            distance
                        }
                    ];

                    // Benachrichtigungen im localStorage speichern
                    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

                    return updatedNotifications;
                });
            }
        }
    };

    const currentLocationIcon = new L.DivIcon({
        html: useCompass ? `<div style="transform: rotate(${heading}deg);">${currentLocationIconSVG}</div>` : fallbackLocationIconSVG,
        iconSize: [40, 40],
        className: 'current-location-icon',
    });

    const handleStartRouteToCoolPlace = async () => {
        setLocationModalIsOpen(false);
        setNotificationsModal(false);
        setIsLoading(true);
        setLoadingMessage(t('loading.route'));
        setRouteStartAddress(`${currentPosition.lat}, ${currentPosition.lng}`);
        setRouteEndAddress(locationNear.name);
        const routeObject = await getRouteToCoolPlace(currentPosition, locationNear.name, 'line');
        console.log(routeObject);
        setIsLoading(false);
        setRoute(routeObject.route);
        setRouteLength(routeObject.routeLength);
        setRouteDuration(routeObject.routeDuration);
    }

    const RouteInfoContainer = () => {
        const map = useMap();

        useEffect(() => {
            // fitBounds nur einmal ausführen, wenn die Route geladen wird und noch nicht zentriert wurde
            if (!hasFitBounds && route.length > 0) {
                const bounds = new L.LatLngBounds(
                    route.map((segment) => segment.map((point) => [point.lat, point.lng]))
                );
                map.fitBounds(bounds, { padding: [50, 50] });

                // Setze hasFitBounds auf true, um zu verhindern, dass fitBounds erneut aufgerufen wird
                setHasFitBounds(true);
            }
        }, [map, route, hasFitBounds]);

        return (
            <div className="route-info-container">
                {/* Weitere Details zur Route */}
                <div className="route-info">
                    <div className="info-item">
                        <MdLocationOn className="info-icon" />
                        <span className="info-text">{routeStartAddress}</span>
                    </div>
                </div>
                <div className="route-info">
                    <div className="info-item w-100 flex-grow">
                        <div className="info-item">
                            <MdArrowForward className="info-icon" />
                            <span className="info-text">{routeEndAddress}</span>
                        </div>
                    </div>
                </div>
                <div className="route-info__icons">
                    <div className="route-info__icon-wrapper route-info__length">
                        <MdDirectionsWalk className="info-icon" />
                        <span>{routeLength}m</span>
                    </div>
                    <div className="route-info__icon-wrapper route-info__duration">
                        <MdAccessTime className="info-icon" />
                        <span>{routeDuration} min</span>
                    </div>
                </div>
            </div>
        );
    };

    const CurrentPositionMarker = () => {
        const map = useMap();
        if (!isMapCentered) {
            map.setView(currentPosition, map.getZoom());
            setIsMapCentered(true);
        }

        return (
            <Marker position={currentPosition} icon={currentLocationIcon}>
                <Popup>{t('general.currentLocation')}</Popup>
            </Marker>
        );
    }

    const CenterButton = () => {
        const map = useMap();

        const handleCenterClick = () => {
            if (currentPosition) {
                map.setView(currentPosition, map.getZoom());
            }
        };

        return (
            <button onClick={handleCenterClick} className="map__center-button">
                <MdMyLocation size={24} color="#fff"/>
            </button>
        );
    };

    useEffect(() => {
        // Durchlaufe coolPlaces und drinkPlaces und prüfe die Distanz
        coolPlaces.forEach((place) => checkDistanceAndNotify(place, 'coolPlace'));
        drinkPlaces.forEach((place) => checkDistanceAndNotify(place, 'drinkPlace'));
    }, [currentPosition]);

    useEffect(() => {
        if (window.DeviceOrientationEvent) {
            setUseCompass(true); // Setze direkt auf true, wenn die API unterstützt wird
        } else {
            console.warn("Device Orientation API is not supported by this browser.");
            setUseCompass(false); // Setze auf false, wenn die API nicht unterstützt wird
        }
        const handleOrientation = (event) => {
            if (event.absolute && event.alpha !== null) {
                let compassHeading = event.alpha;
                if (compassHeading < 0) {
                    compassHeading += 360; // Sicherstellen, dass der Wert im Bereich 0° bis 360° liegt
                }
                let invertedHeading = 360 - compassHeading;

                const smoothedHeading = smoothCompassValue(invertedHeading) - 55;
                setHeading(smoothedHeading);
            }
        };

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);

        window.addEventListener('deviceorientation', handleOrientation, true);

        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return (
        <div>
            <LocationModal modalIsOpen={locationModalIsOpen} closeModal={() => setLocationModalIsOpen(false)} onRouteStart={() => handleStartRouteToCoolPlace()} location={locationNear} />
            <MapContainer
                center={currentPosition || [51.245091, 6.7957591]}
                zoom={15}
                className="map"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Route Info Container */}
                {route.length > 0 && (
                    <RouteInfoContainer/>
                )}

                {route.length > 0 && route.map((segment, segmentIndex) => (
                    <React.Fragment key={segmentIndex}>
                        {segment.length > 0 && (
                            <Polyline
                                positions={segment.map(point => [point.lat, point.lng])}
                                color="#2563eb" // Weiche Standardfarbe (hellblau)
                                weight={10}
                                opacity={1}
                                lineCap="round"
                            />
                        )}
                    </React.Fragment>
                ))}

                {route.length > 0 && route.map((segment, segmentIndex) => (
                    <React.Fragment key={segmentIndex}>
                        {segment.length > 0 && (
                            <Polyline
                                positions={segment.map(point => [point.lat, point.lng])}
                                color={segment[0].color || "#2563eb"} // Weiche Standardfarbe (hellblau)
                                weight={6}
                                opacity={1}
                                lineCap="round"
                                dashArray={segment[0].lineStroke === 'dash' ? "1, 10" : null}
                                eventHandlers={{
                                    click: (e) => {
                                        const map = e.target._map;
                                        const popup = L.popup()
                                            .setLatLng(e.latlng)
                                            .setContent(`
                                <div style="text-align: center;">
                                    <strong>${segment[0].name?.split('_')[0]}</strong>
                                </div>
                            `)
                                            .openOn(map);
                                    },
                                    mouseover: (e) => {
                                        e.target.setStyle({
                                            color: "#2980b9",
                                            weight: 7,
                                        });
                                    },
                                    mouseout: (e) => {
                                        e.target.setStyle({
                                            color: segment[0].color || "#2563eb",
                                            weight: 6,
                                        });
                                    }
                                }}
                            />
                        )}

                        {segment[0].bounds && (
                            <Polygon
                                positions={segment[0].bounds.map(point => [point.y, point.x])}
                                color={segment[0].color || "#2563eb"}
                                fillOpacity={0.2}
                            />
                        )}
                    </React.Fragment>
                ))}


                {/* Markierungen für Start- und Endpunkt */}
                {route.length > 0 && (
                    <>
                        <Marker position={[route[0][0].lat, route[0][0].lng]} icon={startIcon}>
                            <Popup>{routeStartAddress}</Popup>
                        </Marker>
                        <Marker position={[route[route.length - 1][route[route.length - 1].length - 1].lat, route[route.length - 1][route[route.length - 1].length - 1].lng]} icon={endIcon}>
                            <Popup>{routeEndAddress}</Popup>
                        </Marker>
                    </>
                )}

                {/* Marker für die aktuelle Position */}
                {currentPosition && (
                    <CurrentPositionMarker/>
                )}

                {/* Marker für coolPlaces */}
                {coolPlaces && coolPlaces.length > 0 && coolPlaces.map((place, index) => (
                    <Marker
                        key={index}
                        position={[place.attributes.position.yCentral, place.attributes.position.xCentral]}
                        icon={coolPlaceIcon()}
                        eventHandlers={{ click: () => openLocationModal(place, 'coolPlace') }}
                    >
                    </Marker>
                ))}

                {/* Marker für drinkPlaces */}
                {drinkPlaces && drinkPlaces.length > 0 && drinkPlaces.map((place, index) => (
                    <Marker
                        key={index}
                        position={[place.attributes.position.yCentral, place.attributes.position.xCentral]}
                        icon={drinkPlaceIcon()}
                        eventHandlers={{ click: () => openLocationModal(place, 'drinkPlace') }}
                    >
                    </Marker>
                ))}

                {/* Button zum Zentrieren der Karte auf die aktuelle Position */}
                <CenterButton />
            </MapContainer>
        </div>
    );
};

export default Map;
