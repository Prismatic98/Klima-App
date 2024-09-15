import React, { useState } from 'react';
import { getSystemInfo } from '../scripts/main'; // Funktion zum Sammeln von Systeminformationen
import { db } from '../Firebase.js'; // Firebase Firestore-Instanz importieren
import { collection, addDoc } from 'firebase/firestore';
import {MdOutgoingMail} from "react-icons/md";
import {useTranslation} from "react-i18next"; // Firestore-Funktionen

const FeedbackModal = ({ modalIsOpen, closeModal }) => {
    const {t} = useTranslation();
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState(null); // Statusnachricht (z.B. Erfolg oder Fehler)

    if (!modalIsOpen) return null; // Rückgabe, wenn das Modal nicht offen ist

    const sendFeedback = async () => {
        const systemInfo = getSystemInfo(); // Systeminformationen sammeln
        if (feedback) {
            try {
                // Feedback und Systeminformationen in Firestore speichern
                await addDoc(collection(db, 'feedback'), {
                    feedback: feedback,
                    ...systemInfo,
                    timestamp: new Date(),
                });
                setStatus('Feedback erfolgreich gesendet!');
                setFeedback(''); // Formular zurücksetzen
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
                    <div className={`modal__icon-container modal__bg--information`}>
                        <MdOutgoingMail className="modal__icon modal__icon--information"/>
                    </div>
                    <h2 className="modal__headline">Feedback geben</h2>
                </div>
                <div className="modal__content">
                    <div className="settings-item">
                        <label className="settings__label">Teile uns mit, wie wir die App verbessern können!</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="settings__input"
                            placeholder="Dein Feedback..."
                            required
                        />
                    </div>
                    <div className="modal__footer">
                        <div className="modal__button-container">
                            <button
                                type="button"
                                className="modal__button modal__button--cancel"
                                onClick={closeModal}
                            >
                                {t('footer.abort')}
                            </button>
                            <button
                                type="button"
                                className="modal__button modal__button--submit"
                                onClick={sendFeedback}
                            >
                                Senden
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
