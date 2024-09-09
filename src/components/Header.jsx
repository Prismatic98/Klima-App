import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {MdBugReport, MdOutlineArrowBack, MdRecordVoiceOver, MdStopCircle} from 'react-icons/md'; // Importiere das Abbrechen-Icon
import { useSpeechSynthesis } from 'react-speech-kit';
import { getPageText } from "../scripts/main";

const Header = ({ title }) => {
    const location = useLocation(); // React Router Hook zum Abrufen des aktuellen Pfads
    const navigate = useNavigate(); // React Router Hook für Navigation
    let { speak, cancel, speaking, voices } = useSpeechSynthesis();
    const [isSpeaking, setIsSpeaking] = useState(false); // Zustand des Vorlesens
    const [loadedVoices, setLoadedVoices] = useState([]); // Gespeicherte Stimmen

    // Funktion, um zur vorherigen Seite zurückzukehren
    const goBack = () => {
        navigate(-1); // Zurück zur vorherigen Seite
    };

    // Funktion, um das Vorlesen zu starten
    const handleSpeak = () => {
        const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
        const voice = loadedVoices[savedSettings?.selectedVoice ?? 0]; // Wähle die Stimme basierend auf gespeicherten Einstellungen
        if (!speaking) {
            console.log(voices)
            speak({
                text: getPageText(),
                voice: voice,
            });
            setIsSpeaking(true); // Vorlesen gestartet, Icon ändern
        }
    };

    // Funktion, um das Vorlesen zu stoppen
    const handleCancel = () => {
        cancel(); // Vorlesen abbrechen
        setIsSpeaking(false); // Icon zurücksetzen
    };


    // Lade die Stimmen, wenn die Komponente geladen wird
    useEffect(() => {
        if (voices.length > 0) {
            setLoadedVoices(voices); // Stimmen speichern, wenn sie verfügbar sind
        }
    }, [voices]);

    // Überwache den Zustand von `speaking`
    useEffect(() => {
        if (!speaking && isSpeaking) {
            // Wenn das Vorlesen beendet wurde, setze den Zustand zurück
            setIsSpeaking(false);
        }
    }, [speaking]);

    return (
        <header className="bg-blue-600 text-white py-4 flex items-center justify-center">
            {/* Zeige den Zurück-Pfeil an, wenn wir nicht auf dem Home-Screen sind */}
            {location.pathname !== '/' && (
                <button onClick={goBack} className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <MdOutlineArrowBack className="text-white text-xl" />
                </button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
            {/* Wechsle zwischen dem Vorlesen-Icon und dem Abbrechen-Icon */}
            <button
                onClick={isSpeaking ? handleCancel : handleSpeak}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                aria-label={isSpeaking ? "Abbrechen" : "Vorlesen"}
            >
                {isSpeaking ? (
                    <MdStopCircle  className="text-white text-xl" /> // Zeige das Abbrechen-Icon an
                ) : (
                    <MdRecordVoiceOver className="text-white text-xl" /> // Zeige das Vorlesen-Icon an
                )}
            </button>
        </header>
    );
};

export default Header;
