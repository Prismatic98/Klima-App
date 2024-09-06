import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './languages/en.json';
import de from './languages/de.json';

const resources = {
    en: { translation: en },
    de: { translation: de }
};

const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
const savedLanguage = savedSettings?.language || 'de';

// Initialisierung von i18next
i18n
    .use(LanguageDetector) // Ermittelt die Sprache automatisch
    .use(initReactI18next) // Bindung an React
    .init({
        resources, // Sprachressourcen
        lng: savedLanguage, // Verwende die gespeicherte Sprache oder die Fallback-Sprache
        fallbackLng: 'de', // Fallback-Sprache, falls keine Sprache erkannt wird
    });

export default i18n;
