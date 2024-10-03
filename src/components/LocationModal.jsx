import React from 'react';
import {MdError, MdLocationOn, MdOutlineAcUnit, MdOutlineWaterDrop} from 'react-icons/md';
import {useTranslation} from "react-i18next";

const LocationModal = ({modalIsOpen, closeModal, onRouteStart, location}) => {
    const {t} = useTranslation();
    if (!modalIsOpen || !location) return null;

    // Definiere das Icon und die Farben basierend auf dem Typ des Ortes
    let icon;
    switch (location.generalType) {
        case 'coolPlace':
            icon = <MdOutlineAcUnit className="icon icon--default"/>;
            break;
        case 'waterFountain':
            icon = <MdOutlineWaterDrop className="icon icon--default"/>;
            break;
        default:
            icon = <MdLocationOn className="icon icon--default"/>;
            break;
    }

    return (
        <div className={`modal modal--location`} onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className={`modal__header`}>
                    <div className={`icon-container--header`}>
                        {icon}
                    </div>
                    <h2 className="modal__headline">{location.name}</h2>
                </div>
                <div className="modal__content">
                    <div className="modal__text">
                        <p>{location.description} <span className="font-bold">{location.specificType}</span></p>
                        <p className="py-2">Möchten Sie eine Route zu diesem Ort von Ihrer aktuellen Position starten?</p>
                        <p className="text-sm font-bold">Distanz: ~{location.distance} Meter</p>
                        {location.specificType === 'Refillstation' && (
                            <div className="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 my-3 shadow-md" role="alert">
                                <div className="flex">
                                    <MdError className="flex-shrink-0 fill-current h-6 w-6 text-blue-500 mr-4" />
                                    <div>
                                        <p className="font-bold">Hinweis</p>
                                        <p className="text-sm">{t('locationModal.hintRefillStation')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="button-container">
                        <button
                            type="button"
                            className="button__primary button__primary--cancel bg-red-600"
                            onClick={closeModal}
                        > {t('general.abort')}
                        </button>
                        <button
                            type="button"
                            className="button__primary button__primary--submit bg-blue-600"
                            onClick={onRouteStart}
                        > {t('general.start')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
