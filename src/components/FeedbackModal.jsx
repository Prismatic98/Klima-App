import React, { useState } from 'react';
import { getSystemInfo } from '../scripts/main';
import { db } from '../Firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import {MdOutgoingMail} from "react-icons/md";
import {useTranslation} from "react-i18next";

const FeedbackModal = ({ modalIsOpen, closeModal }) => {
    const {t} = useTranslation();
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState(null);

    if (!modalIsOpen) return null;

    const sendFeedback = async () => {
        const systemInfo = getSystemInfo();
        if (feedback) {
            try {
                await addDoc(collection(db, 'feedback'), {
                    feedback: feedback,
                    ...systemInfo,
                    timestamp: new Date(),
                });
                setStatus('Feedback erfolgreich gesendet!');
                setFeedback('');
            } catch (error) {
                setStatus('Fehler beim Senden des Feedbacks.');
                console.error('Error sending feedback: ', error);
            }
        } else {
            setStatus('Bitte geben Sie ein Feedback an!');
        }
    };

    return (
        <div className="modal modal--feedback" onClick={closeModal}>
            <div className="modal__wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <MdOutgoingMail className="icon icon--information"/>
                    <h2 className="modal__headline">{t('feedbackModal.headline')}</h2>
                </div>
                <div className="modal__content">
                    <div className="settings-item">
                        <label className="settings__label">{t('feedbackModal.text')}</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="settings__input"
                            placeholder={t('feedbackModal.textareaPlaceholder')}
                            required
                        />
                    </div>
                    <div className="modal__footer">
                        <div className="button-container">
                            <button
                                type="button"
                                className="button__primary button__primary--cancel"
                                onClick={closeModal}
                            >
                                {t('general.abort')}
                            </button>
                            <button
                                type="button"
                                className="button__primary button__primary--submit"
                                onClick={sendFeedback}
                            >
                                {t('general.submit')}
                            </button>
                        </div>
                    </div>
                    {status && (
                        <div className="p-2 mt-4 text-center text-sm text-gray-500">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
