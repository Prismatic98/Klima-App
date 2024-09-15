import React from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md'; // Material Design Icons

const DebugModal = ({ modalIsOpen, closeModal, mode, headline, debugContent }) => {
    if (!modalIsOpen) return null;

    // Definiere das Icon basierend auf dem Modus
    let icon;
    switch (mode) {
        case 'success':
            icon = <MdCheckCircle className="modal__icon modal__icon--success" />;
            break;
        case 'danger':
            icon = <MdError className="modal__icon modal__icon--danger" />;
            break;
        case 'information':
            icon = <MdInfo className="modal__icon modal__icon--information" />;
            break;
        case 'fail':
            icon = <MdWarning className="modal__icon modal__icon--fail" />;
            break;
        default:
            icon = <MdInfo className="modal__icon text-gray-600" />;
            break;
    }

    return (
        <div className="modal modal--debug" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className={`modal__header modal__header--${mode}`}>
                    <div className="modal__icon-container">
                        {icon}
                    </div>
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
                        <div className="modal__button-container">
                            <button
                                type="button"
                                className="modal__button modal__button--submit"
                                onClick={closeModal}
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugModal;
