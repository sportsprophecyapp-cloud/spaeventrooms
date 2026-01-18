'use client';

import { useState, useEffect } from 'react';
import styles from './OnboardingModal.module.css';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    {
        title: "Welcome to The Arena",
        description: "Join the ultimate second-screen experience. Compete in live markets, earn status, and prove your Arena IQ.",
        icon: "🎯"
    },
    {
        title: "Submit Your Call",
        description: "Swipe cards to predict match winners. Calls are <span class='highlight'>Risk-Free</span>. Accurate calls earn you XP and Tokens!",
        icon: "⚡"
    },
    {
        title: "The Ticket Economy",
        description: "Every <span class='highlight'>Correct Call</span> earns you 1 Ticket. Use tickets to enter high-stakes prize draws!",
        icon: "🎫"
    },
    {
        title: "Real-time Rewards",
        description: "Watch your status grow! You'll get <span class='highlight'>Instant Notifications</span> the moment your predictions resolve.",
        icon: "🎉"
    },
    {
        title: "Build Your Identity",
        description: "Spend tokens on exclusive <span class='highlight'>Avatars and Frames</span>. Show off your rank in the arena.",
        icon: "👑"
    },
    {
        title: "Win Grand Prizes",
        description: "Visit the <span class='highlight'>Draw Room</span> to use your tickets. The more accurate you are, the more chances you have to win!",
        icon: "🏆"
    }
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setMounted(false), 500);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted && !isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className={`${styles.overlay} animate-fade`}>
            <div className={`${styles.modal} animate-slide`}>
                <div className={styles.content}>
                    <div className={styles.stepImage}>{steps[currentStep].icon}</div>
                    <h2 className={styles.title}>{steps[currentStep].title}</h2>
                    <p
                        className={styles.description}
                        dangerouslySetInnerHTML={{
                            __html: steps[currentStep].description.replace(/<span class='highlight'>/g, `<span class="${styles.highlight}">`)
                        }}
                    />

                    <div className={styles.indicators}>
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`${styles.dot} ${idx === currentStep ? styles.activeDot : ''}`}
                            />
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <button onClick={onClose} className={styles.skipBtn}>
                            Skip Tutorial
                        </button>
                        <button
                            onClick={handleNext}
                            className={`${styles.nextBtn} ${currentStep === steps.length - 1 ? styles.finishBtn : ''}`}
                        >
                            {currentStep === steps.length - 1 ? "Let's Play!" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
