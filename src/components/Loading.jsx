import React from 'react';
import { MdWbSunny, MdCloud, MdAcUnit } from 'react-icons/md'; // Sonne, Wolke, Schneeflocke Icons aus Material Design

const Loading = () => {
    return (
        <div className="loading-screen flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 text-white">
            {/* Wetter-Symbol-Animation */}
            <div className="weather-loader flex justify-center items-center space-x-6">
                <MdWbSunny className="icon-sun animate-bounce" size={50} />
                <MdCloud className="icon-cloud animate-bounce" size={50} />
                <MdAcUnit className="icon-snow animate-bounce" size={50} />
            </div>
            <div className="progress-info mt-6 text-center">
                <p className="text-sm">Klima-Daten werden abgerufen...</p>
            </div>
        </div>
    );
};

export default Loading;
