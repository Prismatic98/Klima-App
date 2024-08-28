import React from 'react';
import Header from "../components/Header";
import Map from "../components/Map";
import Footer from "../components/Footer";

const Home = () => {
    return (
        <div className="container">
            <Header title="Klima App Düsseldorf" />
            <div className="content">
                <Map />
            </div>
            <Footer />
        </div>
    );
};

export default Home;
