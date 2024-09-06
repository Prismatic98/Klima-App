import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import Header from "../components/Header";
import Map from "../components/Map";
import Footer from "../components/Footer";
import WeatherModal from "../components/WeatherModal";

const Home = ({ warnings }) => {
    const { t, i18n } = useTranslation();
    const [route, setRoute] = useState([]);
    const [isWeatherModalOpen, setWeatherIsModalOpen] = useState(false);

    useEffect(() => {
        setWeatherIsModalOpen(warnings.length > 0);
    }, [warnings]);

    return (
        <div className="container">
            <Header title={t('home.title')}/>
            <WeatherModal
                isOpen={isWeatherModalOpen}
                onClose={() => setWeatherIsModalOpen(false)}
                warnings={warnings} />
            <div className="content">
                <Map route={route} setRoute={setRoute}/>
            </div>
            <Footer setRoute={setRoute}/>
        </div>
    );
};

export default Home;
