import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import '../styles/libs/swiper-bundle.min.css';
import '../styles/Tutorial.scss';
import tutorial_step_1_img from '../images/tutorial_step_1.png';
import tutorial_step_2_img from '../images/tutorial_step_2.png';
import tutorial_step_3_img from '../images/tutorial_step_3.png';
import tutorial_step_4_img from '../images/tutorial_step_4.png';
import {
    MdArrowForward,
    MdArrowBack,
    MdLocationOn,
    MdNotifications,
    MdSettings,
    MdOutlineVolunteerActivism
} from 'react-icons/md';

const Tutorial = ({ onFinish }) => {
    const [activeStep, setActiveStep] = useState(0); // Zustand für den aktiven Step
    const swiperRef = useRef();

    const tutorialSteps = [
        {
            icon: <MdOutlineVolunteerActivism className="icon tutorial-step__icon" />,
            headline: 'Willkommen zur Klima App Düsseldorf',
            description: 'Wir erklären dir kurz, wie diese App funktioniert.',
            image: (
                <div className="tutorial-step__image-wrapper">
                    <img className="tutorial-step__image" src={tutorial_step_1_img} alt="Logo" />
                </div>
            ),
        },
        {
            icon: <MdLocationOn className="icon tutorial-step__icon" />,
            headline: 'Klimaangepasste Routenführung',
            description: 'Unsere App berechnet nicht nur schnelle, sondern auch kühle Routen, damit der Weg zum Ziel, auch bei heißen Tagen besonders angenehm verläuft.',
            image: (
                <div className="tutorial-step__image-wrapper">
                    <img className="tutorial-step__image" src={tutorial_step_2_img} alt="Logo" />
                </div>
            ),
            imageDescription: (
                <div className="tutorial-step__image-description">
                    <div className="bioClimate-color"></div>
                    <div className="bioClimate-color__description">
                        <span className="text-sm">Ungünstige Bioklimatik</span>
                        <span className="text-sm">Günstige Bioklimatik</span>
                    </div>
                </div>
            )
        },
        {
            icon: <MdNotifications className="icon tutorial-step__icon" />,
            headline: 'Benachrichtigungen über kühle Orte',
            description: 'Erhalte Push-Benachrichtigungen, wenn du dich in der Nähe eines kühlen Ortes befindest. So verpasst du keine Abkühlungsgelegenheit mehr.',
            image: (
                <div className="tutorial-step__image-wrapper">
                    <img className="tutorial-step__image" src={tutorial_step_3_img} alt="Logo" />
                </div>
            ),
        },
        {
            icon: <MdSettings className="icon tutorial-step__icon" />,
            headline: 'Anpassbare Einstellungen',
            description: 'Passe verschiedene Einstellungen nach deinen Bedürfnissen an, wie die Distanz zu kühlen Orten oder deine Routenpräferenzen.',
            image: (
                <div className="tutorial-step__image-wrapper">
                    <img className="tutorial-step__image" src={tutorial_step_4_img} alt="Logo" />
                </div>
            ),
        }
    ];

    // Fortschrittsberechnung
    const progress = ((activeStep + 1) / tutorialSteps.length) * 100;

    return (
        <div className="tutorial-container">
            <Swiper
                spaceBetween={30}
                onSlideChange={(swiper) => setActiveStep(swiper.activeIndex)}
                pagination={{ clickable: true }}
                onSwiper={(swiper) => {
                    console.log(swiper)
                    swiperRef.current = swiper;
                }}
                className="tutorial-swiper"
            >
                {tutorialSteps.map((step, index) => (
                    <SwiperSlide key={index}>
                        <div className="tutorial-step">
                            <div className="tutorial-step__headline-wrapper">
                                {step.icon}
                                <h2 className="tutorial-step__headline">{step.headline}</h2>
                            </div>
                            <div className="tutorial-step__image-container">
                                {step.image}
                                {step.imageDescription}
                            </div>
                            <p className="tutorial-step__text">{step.description}</p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="tutorial-progressbar">
                <div className="tutorial-progress" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="tutorial-navigation">
                <button
                    className={`tutorial__button tutorial__button--prev button__secondary ${activeStep > 0 ? '' : 'hidden'}`}
                    onClick={() => swiperRef.current.slidePrev()}
                >
                    <MdArrowBack className='icon icon--small'/> Zurück
                </button>
                <button
                    className="tutorial__button tutorial__button--next button__secondary"
                    onClick={() => {
                        if (activeStep === tutorialSteps.length - 1) {
                            onFinish();
                        } else {
                            swiperRef.current.slideNext();
                        }
                    }}
                >
                    {activeStep === tutorialSteps.length - 1 ? 'Starten' : 'Weiter'} <MdArrowForward className='icon icon--small'/>
                </button>
            </div>
        </div>
    );
};

export default Tutorial;
