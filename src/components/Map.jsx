import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MdMyLocation } from 'react-icons/md';

const Map = ({ route }) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [heading, setHeading] = useState(0); // Blickrichtung
    const mapRef = useRef(); // Referenz zur Karte
    const isMapCentered = useRef(false); // Variable, um den Zustand der Zentrierung zu verfolgen
    const headingHistory = useRef([]); // Array zur Speicherung der letzten Kompasswerte
    const [useCompass, setUseCompass] = useState(false); // Zustand für die Nutzung der Compass-Daten

    const currentLocationIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#007bff" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-navigation">
      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
    </svg>
    `;

    const fallbackLocationIconSVG = `
    <div class="location-pulse"></div>
    <div class="location-dot"></div>
    `;

    const smoothCompassValue = (newHeading) => {
        const maxHistorySize = 10; // Anzahl der Werte, die für die Glättung gespeichert werden
        const weightFactor = 0.7; // Faktor, der den Einfluss der neueren Werte gewichtet
        const lastHeading = headingHistory.current.length ? headingHistory.current[headingHistory.current.length - 1] : newHeading;

        // Berechne die Differenz zwischen dem letzten und dem neuen Heading
        let delta = newHeading - lastHeading;

        // Wenn die Differenz größer als 180° ist, korrigiere sie für den Übergang über 0°
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

        // Gewichteter gleitender Durchschnitt
        let weightedSum = 0;
        let weightSum = 0;

        headingHistory.current.forEach((value, index) => {
            const weight = Math.pow(weightFactor, headingHistory.current.length - index - 1);
            weightedSum += value * weight;
            weightSum += weight;
        });

        let smoothedHeading = weightedSum / weightSum;

        // Normalisiere den smoothedHeading wieder in den Bereich von 0° bis 360°
        if (smoothedHeading < 0) {
            smoothedHeading += 360;
        } else if (smoothedHeading >= 360) {
            smoothedHeading -= 360;
        }

        return smoothedHeading;
    };


    useEffect(() => {
        // Geolocation API zur Standortverfolgung
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition([latitude, longitude]);
                    console.log(currentPosition);
                    if (!isMapCentered.current && mapRef.current && mapRef.current.setView) {
                        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
                        isMapCentered.current = true; // Markiere die Karte als zentriert
                    }
                },
                (error) => {
                    console.error("Error retrieving location:", error);
                },
                {
                    maximumAge: 10000,
                    timeout: 5000,
                    enableHighAccuracy: true, // Höhere Genauigkeit anfordern
                }
            );

            // Aufräumen bei unmounten
            return () => {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                }
            };
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    useEffect(() => {
        // DeviceOrientationEvent zur Bestimmung der Blickrichtung
        const handleOrientation = (event) => {
            if (event.absolute && event.alpha !== null) {
                let compassHeading = event.alpha;
                if (compassHeading < 0) {
                    compassHeading += 360; // Sicherstellen, dass der Wert im Bereich 0° bis 360° liegt
                }
                let invertedHeading = 360 - compassHeading;

                // Glättung des Kompasswerts
                const smoothedHeading = smoothCompassValue(invertedHeading) - 45;
                setHeading(smoothedHeading);
                setUseCompass(true); // Compass-Daten erfolgreich verwendet
            }
        };

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);

        // Fallback für Browser, die 'deviceorientationabsolute' nicht unterstützen
        window.addEventListener('deviceorientation', handleOrientation, true);

        // Aufräumen bei unmounten
        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    // Icon für den aktuellen Standort
    const currentLocationIcon = new L.DivIcon({
        html: useCompass ? `<div style="transform: rotate(${heading}deg);">${currentLocationIconSVG}</div>` : fallbackLocationIconSVG,
        iconSize: [40, 40],
        className: 'current-location-icon',
    });

    // Funktion zum Zentrieren der Karte auf den aktuellen Standort
    const CenterButton = () => {
        const map = useMap(); // Zugriff auf die Map-Instanz

        const handleCenterClick = () => {
            if (currentPosition) {
                map.setView(currentPosition, map.getZoom()); // Zentriert die Karte auf den aktuellen Standort
            }
        };

        return (
            <button
                onClick={handleCenterClick}
                className="map__center-button"
            >
                <MdMyLocation size={24} color="#fff" /> {/* Google Maps-ähnliches Icon */}
            </button>
        );
    };

    return (
        <MapContainer
            center={currentPosition || [51.245091, 6.7957591]}
            zoom={15}
            className="map"
            ref={mapRef}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {route.length > 0 && (
                <Polyline positions={route} color="blue" />
            )}
            {currentPosition && (
                <Marker position={currentPosition} icon={currentLocationIcon}>
                    <Popup>Your location</Popup>
                </Marker>
            )}
            <CenterButton />
        </MapContainer>
    );
};

export default Map;
