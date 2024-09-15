import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Header from "../components/Header";
import Map from "../components/Map";
import Footer from "../components/Footer";
import WeatherModal from "../components/WeatherModal";
import DebugModal from "../components/DebugModal";

const Home = ({warnings}) => {
    const {t} = useTranslation();
    const [route, setRoute] = useState([]);
    const [routeStartAddress, setRouteStartAddress] = useState('');
    const [routeEndAddress, setRouteEndAddress] = useState('');
    const [isWeatherModalOpen, setWeatherIsModalOpen] = useState(false);
    const [debugModalIsOpen, setDebugModalIsOpen] = useState(false);
    const [debugContent, setDebugContent] = useState([]);

    // Speichere die Originalmethoden von console
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };

    // Erstelle eine Funktion, die den Konsoleninhalt auf der Seite anzeigt
    const displayConsole = (type, args) => {
        const message = `[${type}] ${args.join(' ')}`;
        setDebugContent([...debugContent, message]);
    };

    // Überschreibe die console.log Methode
    console.log = function (...args) {
        originalConsole.log.apply(console, args);
        displayConsole('log', args);
    };

    // Überschreibe console.error
    console.error = function (...args) {
        originalConsole.error.apply(console, args);
        displayConsole('error', args);
    };

    // Überschreibe console.warn
    console.warn = function (...args) {
        originalConsole.warn.apply(console, args);
        displayConsole('warn', args);
    };

    // Überschreibe console.info
    console.info = function (...args) {
        originalConsole.info.apply(console, args);
        displayConsole('info', args);
    };

    useEffect(() => {
        setWeatherIsModalOpen(warnings.length > 0);
    }, [warnings]);

    return (
        <div className="wrapper">
            <Header title={t('home.title')} setModalIsOpen={() => setDebugModalIsOpen(!debugModalIsOpen)}/>
            <DebugModal modalIsOpen={debugModalIsOpen} closeModal={() => setDebugModalIsOpen(false)} mode={'information'} headline={'Konsoleninhalt'} debugContent={debugContent}></DebugModal>
            <WeatherModal
                modalIsOpen={isWeatherModalOpen}
                closeModal={() => setWeatherIsModalOpen(false)}
                warnings={warnings}
            />
            <div className="content">
                <Map route={route} setRoute={setRoute}
                     routeStartAddress={routeStartAddress}
                     routeEndAddress={routeEndAddress}/>
            </div>
            <Footer setRoute={setRoute}
                    routeStartAddress={routeStartAddress} setRouteStartAddress={setRouteStartAddress}
                    routeEndAddress={routeEndAddress} setRouteEndAddress={setRouteEndAddress} />
        </div>
    );
};

export default Home;
