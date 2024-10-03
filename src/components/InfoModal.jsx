import React from 'react';
import {MdError, MdInfo, MdLightbulbOutline, MdOutlineWarningAmber} from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const InfoModal = ({ modalIsOpen, closeModal, headline, content, hint }) => {
    const { t } = useTranslation();
    if (!modalIsOpen) return null;

    return (
        <div className="modal modal--info" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className={`modal__header modal__header--information`}>
                    <MdInfo className="icon icon--information" />
                    <h2 className="modal__headline">{headline}</h2>
                </div>
                <div className="modal__content">
                    <div className="modal__text">
                        {content}
                    </div>

                    {hint && (
                        <div className="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 my-3 shadow-md" role="alert">
                            <div className="flex">
                                <MdError className="flex-shrink-0 fill-current h-6 w-6 text-blue-500 mr-4" />
                                <div>
                                    <p className="font-bold">Hinweis</p>
                                    <p className="text-sm">{hint}</p>
                                </div>
                            </div>
                        </div>
                    )}

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

export default InfoModal;
