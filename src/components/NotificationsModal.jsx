import React from 'react';
import {
    MdInfo,
    MdNotifications,
    MdClose, MdOutlineAcUnit, MdOutlineWaterDrop, MdLocationOn
} from 'react-icons/md';
import { useTranslation } from "react-i18next";

const NotificationsModal = ({ modalIsOpen, closeModal, notifications, setNotifications, openLocationModal }) => {
    const { t } = useTranslation();
    if (!modalIsOpen) return null;

    const deleteNotification = (index) => {
        const updatedNotifications = notifications.filter((_, i) => i !== index);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
    };

    return (
        <div className="modal modal--notifications" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className={`modal__header modal__header--notifications`}>
                    <MdNotifications className="icon" />
                    <h2 className="modal__headline">{t('general.notifications')}</h2>
                </div>
                <div className="modal__content">
                    <div>
                        {notifications.length > 0 && (
                            <p className="settings__label">{t('general.coolPlacesNear')}</p>
                        )}
                        <ul className="notifications-list">
                            {notifications.length === 0 ? (
                                <li className="empty-message">{t('general.noNotifications')}</li>
                            ) : (
                                notifications.map((notification, index) => (
                                    <li key={index} className="notification-item">
                                        <div className="notification-content">
                                            <div className="notification-name">
                                                <div className="notification-icon">
                                                    {notification.placeType === 'coolPlace' ? (
                                                        <MdOutlineAcUnit className="icon icon--primary"/>
                                                    ) : (
                                                        <MdOutlineWaterDrop className="icon icon--primary"/>
                                                    )}
                                                </div>
                                                {notification.place.name}
                                            </div>
                                            <div className="notification-details">
                                        <span className="notification-distance">
                                            {parseInt(notification.distance)}m
                                        </span>
                                                <div className="notification-buttons">
                                                    <button
                                                        type="button"
                                                        className="button__open"
                                                        onClick={() => openLocationModal(notification.place, notification.placeType, notification.distance)}
                                                    >
                                                        <MdInfo className="icon icon--small" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button__danger button__delete"
                                                        onClick={() => deleteNotification(index)}
                                                    >
                                                        <MdClose className="icon icon--small"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    <div className="modal__footer">
                        <div className="button-container">
                            <button
                                type="button"
                                className="button__primary button__primary--submit"
                                onClick={closeModal}
                            >
                                {t('general.close')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
