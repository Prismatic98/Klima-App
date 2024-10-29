import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Header from "../components/Header";
import Map from "../components/Map";
import Footer from "../components/Footer";
import WeatherModal from "../components/WeatherModal";
import DebugModal from "../components/DebugModal";
import NotificationsModal from "../components/NotificationsModal";
import {calculateDistance, canSendNotification, sendNotification} from "../scripts/main";
import Loading from "../components/Loading";
import WeatherDataModal from "../components/WeatherDataModal";
import {getRoute} from "../scripts/routeFunctions";

const Home = ({warnings, addresses, coolPlaces, drinkPlaces, isLoading, setIsLoading, loadingMessage, setLoadingMessage, weatherData, notifications, setNotifications, debugContent}) => {
    const {t} = useTranslation();
    const [route, setRoute] = useState([]);
    const [routeLength, setRouteLength] = useState(0);
    const [routeDuration, setRouteDuration] = useState(0);
    const [routeStartAddress, setRouteStartAddress] = useState('');
    const [routeEndAddress, setRouteEndAddress] = useState('');
    const [isWeatherModalOpen, setWeatherIsModalOpen] = useState(false);
    const [debugModalIsOpen, setDebugModalIsOpen] = useState(false);
    const [notificationsModalIsOpen, setNotificationsModalIsOpen] = useState(false);
    const [weatherDataModalIsOpen, setWeatherDataModalIsOpen] = useState(false);
    const [locationModalIsOpen, setLocationModalIsOpen] = useState(false);
    const [locationNear, setLocationNear] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);

    const openLocationModal = (place, placeType, distance) => {
        if (!distance)
            distance = calculateDistance(currentPosition.lat, currentPosition.lng, place.attributes.position.yCentral, place.attributes.position.xCentral);
        setLocationModalIsOpen(true);
        console.log(place);
        setLocationNear({
            name: place.name,
            description: 'Bei diesem Ort handelt es sich um folgendes: ',
            specificType: place.entitytype,
            generalType: placeType,
            distance: parseInt(distance), // Distanz zum aktuellen Standort in Metern
            coordinates: {
                lat: place.attributes.position.yCentral,
                lng: place.attributes.position.xCentral
            },
            attributes: place.attributes
        });
    }

    const locationSuccessCallback = (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        setIsLoading(false);
    }

    const locationErrorCallback = (error) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.warn("Location retrieval timed out.");
                break;
            default:
                console.error("An unknown error occurred while retrieving location.");
                break;
        }
        setIsLoading(false);
    }

    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationSuccessCallback(position);
            },
            (error) => {
                locationErrorCallback(error);
            },
            {
                maximumAge: 30000,
                timeout: 10000,
                enableHighAccuracy: true,
            }
        );
    }

    const watchLocation = () => {
        return navigator.geolocation.watchPosition(
            (position) => {
                locationSuccessCallback(position);
            },
            (error) => {
                locationErrorCallback(error);
            },
            {
                maximumAge: 30000,
                timeout: 10000,
                enableHighAccuracy: true,
            }
        );
    }

    useEffect(() => {
        if (navigator.geolocation) {
            setIsLoading(true);
            setLoadingMessage(t('loading.location'));

            getCurrentLocation();

            const watchId = watchLocation();

            return () => {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    setIsLoading(false);
                }
            };
        } else {
            console.error("Geolocation is not supported by this browser.");
            setIsLoading(false);
        }
    }, [coolPlaces, drinkPlaces]);



    useEffect(() => {
        setWeatherIsModalOpen(warnings.length > 0);
    }, [warnings]);

    return (
        <div className="wrapper">
            <Header
                title={t('home.title')}
                setDebugModalIsOpen={() => setDebugModalIsOpen(!debugModalIsOpen)}
                setWeatherDataModalIsOpen={() => setWeatherDataModalIsOpen(!weatherDataModalIsOpen)}
                weatherData={weatherData}
                setNotificationsModalIsOpen={() => setNotificationsModalIsOpen(!notificationsModalIsOpen)}
                notifications={notifications}
            />
            <WeatherDataModal modalIsOpen={weatherDataModalIsOpen} closeModal={() => setWeatherDataModalIsOpen(false)} headline={'Wetter'} weatherData={weatherData}></WeatherDataModal>
            <DebugModal modalIsOpen={debugModalIsOpen} closeModal={() => setDebugModalIsOpen(false)} mode={'information'} headline={'Konsoleninhalt'} debugContent={debugContent}></DebugModal>
            <NotificationsModal modalIsOpen={notificationsModalIsOpen} closeModal={() => setNotificationsModalIsOpen(false)} notifications={notifications} setNotifications={setNotifications} openLocationModal={openLocationModal}></NotificationsModal>
            <WeatherModal
                modalIsOpen={isWeatherModalOpen}
                closeModal={() => setWeatherIsModalOpen(false)}
                warnings={warnings}
            />
            <div className="content">
                <Map
                    route={route} setRoute={setRoute}
                    routeLength={routeLength} routeDuration={routeDuration}
                    setRouteLength={setRouteLength}
                    setRouteDuration={setRouteDuration}
                     routeStartAddress={routeStartAddress} setRouteStartAddress={setRouteStartAddress}
                     routeEndAddress={routeEndAddress} setRouteEndAddress={setRouteEndAddress}
                     coolPlaces={coolPlaces}
                     drinkPlaces={drinkPlaces}
                     currentPosition={currentPosition}
                     isLoading={isLoading} setIsLoading={setIsLoading}
                     loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage}
                    notifications={notifications} setNotifications={setNotifications}
                    locationModalIsOpen={locationModalIsOpen} setLocationModalIsOpen={setLocationModalIsOpen}
                    locationNear={locationNear} openLocationModal={openLocationModal} setNotificationsModal={setNotificationsModalIsOpen}
                />
            </div>
            <Footer route={route}
                    setRoute={setRoute}
                    setRouteLength={setRouteLength}
                    setRouteDuration={setRouteDuration}
                    routeStartAddress={routeStartAddress} setRouteStartAddress={setRouteStartAddress}
                    routeEndAddress={routeEndAddress} setRouteEndAddress={setRouteEndAddress}
                    addresses={addresses}
                    coolPlaces={coolPlaces}
                    drinkPlaces={drinkPlaces}
                    currentPosition={currentPosition}
                    isLoading={isLoading} setIsLoading={setIsLoading}
                    loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage}
            />
            <Loading message={loadingMessage} isLoading={isLoading}/>
        </div>
    );
};

export default Home;
