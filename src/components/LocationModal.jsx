import React from 'react';
import {MdLocationOn, MdOutlineWaterDrop} from 'react-icons/md';
import {useTranslation} from "react-i18next"; // Importiere Icons

const LocationModal = ({modalIsOpen, closeModal, onRouteStart, location}) => {
    const {t} = useTranslation();
    if (!modalIsOpen || !location) return null;

    // Definiere das Icon und die Farben basierend auf dem Typ des Ortes
    let icon, bgClass;
    switch (location.type) {
        case 'coolPlace':
            icon = <MdLocationOn className="modal__icon"/>;
            bgClass = 'bg-blue-500'; // Blaue Farbe für kühle Orte
            break;
        case 'waterFountain':
            icon = <MdOutlineWaterDrop className="modal__icon"/>;
            bgClass = 'bg-teal-500'; // Türkise Farbe für Trinkbrunnen
            break;
        default:
            icon = <MdLocationOn className="modal__icon"/>;
            bgClass = 'bg-gray-500'; // Standardfarbe
            break;
    }

    return (
        <div className="modal modal--location" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className={`modal__header`}>
                    <div className={`modal__icon-container ${bgClass}`}>
                        {icon}
                    </div>
                    <h2 className="modal__headline">{location.name}</h2>
                </div>
                <div className="modal__content">
                    <div className="modal__text">
                        <p>{location.description}</p>
                        <p>Distanz: {location.distance} Meter</p> {/* Anzeige der Distanz */}
                    </div>
                    <div className="modal__button-container">
                        <button
                            type="button"
                            className="modal__button modal__button--cancel bg-red-600"
                            onClick={closeModal}
                        > {t('footer.abort')}
                        </button>
                        <button
                            type="button"
                            className="modal__button modal__button--submit bg-blue-600"
                            onClick={onRouteStart}
                        > {t('footer.start')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
