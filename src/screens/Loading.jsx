import React from 'react';
import '../styles/Loading.scss';
import logo from '../logo_1.webp';

const Loading = ({ message }) => {
    return (
        <div className="loading-screen flex flex-col justify-center items-center h-screen">
            <div className="logo-container">
                <img src={logo} alt="Loading Logo" className="logo" />
                <div className="loading-pulse"></div>
            </div>
            <div className="progress-info mt-6 text-center">
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
};

export default Loading;
