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
        description: "Join the ultimate second-screen experience. Compete in live prediction markets, earn status, and prove your sports IQ.",
        icon: "🏟️"
    },
    {
        title: "Predict Live",
        description: "Watch the match and answer live questions like 'Goal in next 5 mins?'. Predictions are <span class='highlight'>Risk-Free</span> (0 tokens).",
        icon: "⚡"
    },
    {
        title: "Earn Tokens",
        description: "Login daily for <span class='highlight'>+5 tokens</span>. Keep your streak alive to earn massive bonuses (up to +500!).",
        icon: "💎"
    },
    {
        title: "Build Your Status",
        description: "Spend tokens on exclusive <span class='highlight'>Avatars, Frames, and Badges</span>. Show the community who's boss.",
        icon: "👑"
    },
    {
        title: "Climb the Ranks",
        description: "Correct predictions boost your ranking. Top players earn respect and entry into exclusive <span class='highlight'>Prize Draws</span>.",
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
            const timer = setTimeout(() => setMounted(false), 500); // Wait for animation
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
