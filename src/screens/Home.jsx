import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Header from "../components/Header";
import Map from "../components/Map";
import Footer from "../components/Footer";
import WeatherModal from "../components/WeatherModal";

const Home = ({warnings}) => {
    const {t, i18n} = useTranslation();
    const [route, setRoute] = useState([]);
    const [routeStartAddress, setRouteStartAddress] = useState('Hochschule Duesseldorf');
    const [routeEndAddress, setRouteEndAddress] = useState('Buscher Muehle');
    const [isWeatherModalOpen, setWeatherIsModalOpen] = useState(false);

    useEffect(() => {
        setWeatherIsModalOpen(warnings.length > 0);
    }, [warnings]);

    return (
        <div className="wrapper">
            <Header title={t('home.title')}/>
            <WeatherModal
                isOpen={isWeatherModalOpen}
                onClose={() => setWeatherIsModalOpen(false)}
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
