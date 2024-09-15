import React, {useEffect, useState, useRef} from 'react';
import {MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Polygon} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {MdMyLocation} from 'react-icons/md';
import {sendNotification, calculateDistance, canSendNotification} from "../scripts/main";
import LocationModal from "./LocationModal";

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

const Map = ({route, routeStartAddress, routeEndAddress}) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [heading, setHeading] = useState(0); // Blickrichtung
    const mapRef = useRef(); // Referenz zur Karte
    const isMapCentered = useRef(false); // Variable, um den Zustand der Zentrierung zu verfolgen
    const headingHistory = useRef([]); // Array zur Speicherung der letzten Kompasswerte
    const [useCompass, setUseCompass] = useState(false); // Zustand für die Nutzung der Compass-Daten
    const [locationModalIsOpen, setLocationModalIsOpen] = useState(false);
    const [locationNear, setLocationNear] = useState(null);

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

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    setCurrentPosition([latitude, longitude]);
                    if (!isMapCentered.current && mapRef.current && mapRef.current.setView) {
                        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
                        isMapCentered.current = true; // Markiere die Karte als zentriert
                    }

                    const targetLat = 51.236123; // Beispielkoordinaten
                    const targetLng = 6.7940113; // Beispielkoordinaten
                    const targetName = 'Kühler Platz im Stadtpark'

                    const distance = calculateDistance(latitude, longitude, targetLat, targetLng);

                    if (distance < 100 && canSendNotification({name: targetName})) { // Wenn der Benutzer weniger als 100 Meter entfernt ist
                        sendNotification("Standort in der Nähe", {
                            body: "Yessss es klappt.",
                            icon: "/android/android-launchericon-512-512.png",
                            tag: "example-notification"
                        }); // Funktion zum Auslösen der Benachrichtigung
                        setLocationModalIsOpen(true);
                        setLocationNear({
                            name: "Kühler Platz im Stadtpark",
                            description: "Dieser Platz bietet viel Schatten und ist ideal zum Entspannen an heißen Tagen.",
                            type: "waterFountain",  // Mögliche Werte: 'coolPlace', 'waterFountain', etc.
                            distance: distance.toFixed(2),      // Distanz zum aktuellen Standort in Metern
                            coordinates: {      // Optional: Koordinaten des Ortes
                                lat: 51.245091,
                                lng: 6.7957591
                            }
                        });
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

    const currentLocationIcon = new L.DivIcon({
        html: useCompass ? `<div style="transform: rotate(${heading}deg);">${currentLocationIconSVG}</div>` : fallbackLocationIconSVG,
        iconSize: [40, 40],
        className: 'current-location-icon',
    });

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
        if (route.length > 0 && mapRef.current) {
            const bounds = new L.LatLngBounds(
                route.map(segment => {
                    return segment.map(point => [point.lat, point.lng])
                })
            );
            mapRef.current.fitBounds(bounds, {padding: [50, 50]});  // Füge Padding hinzu, damit die Route nicht zu nah am Rand ist
        }
    }, [route]);

    return (
        <div>
            <LocationModal modalIsOpen={locationModalIsOpen} closeModal={() => setLocationModalIsOpen(false)} mode={'information'} headline={'Trinkbrunnen'} textContent={'Beispieltext'} location={locationNear}></LocationModal>
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

                {/* Schleife durch die Segmente in der Route */}
                {route.length > 0 && route.map((segment, segmentIndex) => (
                    <React.Fragment key={segmentIndex}>
                        {/* Zeichne die Linie für jedes Segment */}
                        {segment.length > 0 && (
                            <Polyline
                                positions={segment.map(point => [point.lat, point.lng])}
                                color={segment[0].color}  // Verwende die Farbe des ersten Punktes im Segment
                                weight={6}
                                opacity={0.9}
                                lineCap="round"
                            />
                        )}

                        {/* Zeichne das Polygon, wenn bounds existieren */}
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
                        {/* Startpunkt */}
                        <Marker position={[route[0][0].lat, route[0][0].lng]} icon={startIcon}>
                            <Popup>{routeStartAddress}</Popup>
                        </Marker>

                        {/* Endpunkt */}
                        <Marker position={[route[route.length - 1][route[route.length - 1].length - 1].lat, route[route.length - 1][route[route.length - 1].length - 1].lng]} icon={endIcon}>
                            <Popup>{routeEndAddress}</Popup>
                        </Marker>
                    </>
                )}

                {/* Marker für die aktuelle Position */}
                {currentPosition && (
                    <Marker position={currentPosition} icon={currentLocationIcon}>
                        <Popup>Your location</Popup>
                    </Marker>
                )}

                {/* Button zum Zentrieren der Karte auf die aktuelle Position */}
                <CenterButton />
            </MapContainer>
        </div>
    );
};

export default Map;
