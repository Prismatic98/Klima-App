import React from 'react';
import {MdError, MdLocationOn, MdOutlineAcUnit, MdOutlineWaterDrop} from 'react-icons/md';
import {useTranslation} from "react-i18next";

const LocationModal = ({modalIsOpen, closeModal, onRouteStart, location}) => {
    const {t} = useTranslation();
    if (!modalIsOpen || !location) return null;

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
                        <div className="location__info py-2">
                            <p className="">{t('locationModal.openingHours')}: <span className="font-bold">{location.attributes.betriebszeiten === "null" || location.attributes.betriebszeiten === " " ? t('general.noData') : location.attributes.betriebszeiten}</span></p>
                            <p className="">{t('locationModal.location')}: <span className="font-bold">{location.attributes.lage}</span></p>
                            {location.attributes.infolink !== "null" && (
                                <p className="">{t('locationModal.link')}: <span className="font-bold">{location.attributes.infolink}</span></p>
                            )}
                            <p className="">{t('locationModal.distance')}: <span className="font-bold">~{location.distance}m</span></p>
                        </div>
                        <p className="py-2">{t('locationModal.startRoute')}</p>
                        {location.attributes.lage === 'drinnen' && (
                            <div className="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 my-3 shadow-md" role="alert">
                                <div className="flex">
                                    <MdError className="flex-shrink-0 fill-current h-6 w-6 text-blue-500 mr-4" />
                                    <div>
                                        <p className="font-bold">{t('locationModal.hint')}</p>
                                        <p className="text-sm">{t('locationModal.hintInside')}</p>
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
