import React from 'react';

const Modal = ({ isOpen, onClose, mode, headline, textContent }) => {
    if (!isOpen) return null;

    // Definiere das Icon und die Farben basierend auf dem Modus
    let icon, bgClass;
    switch (mode) {
        case 'success':
            icon = (
                <svg className="modal__icon modal__icon--success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            );
            bgClass = 'modal__bg--success';
            break;
        case 'danger':
            icon = (
                <svg className="modal__icon modal__icon--danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
            bgClass = 'modal__bg--danger';
            break;
        case 'information':
            icon = (
                <svg className="modal__icon modal__icon--information" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 8v.01" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            );
            bgClass = 'modal__bg--information';
            break;
        case 'fail':
            icon = (
                <svg className="modal__icon modal__icon--fail" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            );
            bgClass = 'modal__bg--fail';
            break;
        default:
            icon = (
                <svg className="modal__icon text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 8v.01" />
                </svg>
            );
            bgClass = 'bg-gray-100';
            break;
    }

    return (
        <div className="modal__container">
            <div className="modal__backdrop" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="modal__wrapper">
                <div className="modal__header">
                    <div className={`modal__icon-container ${bgClass}`}>
                        {icon}
                    </div>
                    <div className="modal__content">
                        <h3 className="modal__headline">{headline}</h3>
                        <div className="modal__text">
                            <p>{textContent}</p>
                        </div>
                    </div>
                </div>
                <div className="modal__footer">
                    <button
                        type="button"
                        className="modal__button"
                        onClick={onClose}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
