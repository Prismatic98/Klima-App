import React from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';
import {useTranslation} from "react-i18next";

const DebugModal = ({ modalIsOpen, closeModal, mode, headline, debugContent }) => {
    const {t} = useTranslation();
    if (!modalIsOpen) return null;

    // Definiere das Icon basierend auf dem Modus
    let icon;
    switch (mode) {
        case 'success':
            icon = <MdCheckCircle className="icon icon--success" />;
            break;
        case 'danger':
            icon = <MdError className="icon icon--danger" />;
            break;
        case 'information':
            icon = <MdInfo className="icon icon--information" />;
            break;
        case 'fail':
            icon = <MdWarning className="icon icon--fail" />;
            break;
        default:
            icon = <MdInfo className="icon text-gray-600" />;
            break;
    }

    return (
        <div className="modal modal--debug" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className={`modal__header modal__header--${mode}`}>
                    {icon}
                    <h2 className="modal__headline">{headline}</h2>
                </div>
                <div className="modal__content">
                    <div className="modal__text">
                        {debugContent && Array.isArray(debugContent) && debugContent.length > 0 && (
                            debugContent.map((content, index) => (
                                <p key={index}>{content}</p>
                            ))
                        )}
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

export default DebugModal;
