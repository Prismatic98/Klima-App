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

// Standard Leaflet Icons
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

const Map = ({route, setRoute, routeLength, routeDuration, setRouteLength, setRouteDuration, routeStartAddress, setRouteStartAddress, routeEndAddress, setRouteEndAddress, coolPlaces, drinkPlaces, currentPosition, isLoading, setIsLoading, loadingMessage, setLoadingMessage}) => {
    const {t} = useTranslation();
    const [heading, setHeading] = useState(0); // Blickrichtung
    const headingHistory = useRef([]); // Array zur Speicherung der letzten Kompasswerte
    const [useCompass, setUseCompass] = useState(false); // Zustand für die Nutzung der Compass-Daten
    const [locationModalIsOpen, setLocationModalIsOpen] = useState(false);
    const [locationNear, setLocationNear] = useState(null);
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

            if (distance < 200 && canSendNotification({ name: place.name })) { // Wenn der Benutzer weniger als 100 Meter entfernt ist
                sendNotification(`In der Nähe: ${place.name}`, {
                    body: `Sie befinden sich in der Nähe von ${place.name}.`,
                    icon: "/android/android-launchericon-512-512.png",
                    tag: `notification-${place.id}`
                });
                openLocationModal(place, placeType, distance);
            }
        }
    };

    const openLocationModal = (place, placeType, distance) => {
        if (!distance)
            distance = calculateDistance(currentPosition.lat, currentPosition.lng, place.attributes.position.yCentral, place.attributes.position.xCentral);
        setLocationModalIsOpen(true);
        console.log(place);
        setLocationNear({
            name: place.name,
            description: 'Bei diesem Ort handelt es sich um folgendes: ',
            specificType: place.attributes.typ,
            generalType: placeType,
            distance: parseInt(distance), // Distanz zum aktuellen Standort in Metern
            coordinates: {
                lat: place.attributes.position.yCentral,
                lng: place.attributes.position.xCentral
            }
        });
    }

    const currentLocationIcon = new L.DivIcon({
        html: useCompass ? `<div style="transform: rotate(${heading}deg);">${currentLocationIconSVG}</div>` : fallbackLocationIconSVG,
        iconSize: [40, 40],
        className: 'current-location-icon',
    });

    const handleStartRoute = async () => {
        setLocationModalIsOpen(false);
        setIsLoading(true);
        setLoadingMessage(t('loading.route'));
        setRouteStartAddress(`${currentPosition.lat}, ${currentPosition.lng}`);
        setRouteEndAddress(locationNear.name);
        const routeObject = await getRouteToCoolPlace(currentPosition, locationNear.name);
        console.log(routeObject);
        setIsLoading(false);
        setRoute(routeObject.route);
        setRouteLength(routeObject.routeLength);
        setRouteDuration(routeObject.routeDuration);
    }

    const RouteInfoContainer = () => {
        const map = useMap();
        const bounds = new L.LatLngBounds(
            route.map(segment => {
                return segment.map(point => [point.lat, point.lng])
            })
        );
        map.fitBounds(bounds, {padding: [50, 50]});

        return (
            <div className="route-info-container">
                {/* Start- und Endpunkt */}
                <div className="route-info">
                    <div className="info-item">
                        <MdLocationOn className="info-icon" />
                        <span className="info-text">{routeStartAddress}</span>
                    </div>
                </div>

                {/* Distanz und Dauer */}
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
    }

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
        const handleOrientation = (event) => {
            if (event.absolute && event.alpha !== null) {
                let compassHeading = event.alpha;
                if (compassHeading < 0) {
                    compassHeading += 360; // Sicherstellen, dass der Wert im Bereich 0° bis 360° liegt
                }
                let invertedHeading = 360 - compassHeading;

                const smoothedHeading = smoothCompassValue(invertedHeading) - 52;
                setHeading(smoothedHeading);
                setUseCompass(true); // Compass-Daten erfolgreich verwendet
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
            <LocationModal modalIsOpen={locationModalIsOpen} closeModal={() => setLocationModalIsOpen(false)} onRouteStart={() => handleStartRoute()} location={locationNear} />
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


                {/* Schleife durch die Segmente in der Route */}
                {route.length > 0 && route.map((segment, segmentIndex) => (
                    <React.Fragment key={segmentIndex}>
                        {segment.length > 0 && (
                            <Polyline
                                positions={segment.map(point => [point.lat, point.lng])}
                                color={segment[0].color}
                                weight={6}
                                opacity={0.9}
                                lineCap="round"
                            />
                        )}

                        {segment[0].bounds && (
                            <Polygon
                                positions={segment[0].bounds.map(point => [point.y, point.x])}
                                color={segment[0].color}
                                fillOpacity={0.3}
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
                        <Popup>{place.name}</Popup>
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
                        <Popup>{place.name}</Popup>
                    </Marker>
                ))}

                {/* Button zum Zentrieren der Karte auf die aktuelle Position */}
                <CenterButton />
            </MapContainer>
        </div>
    );
};

export default Map;
