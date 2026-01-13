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
        description: "Swipe cards left or right to predict match winners. Calls are <span class='highlight'>Risk-Free</span> (0 tokens).",
        icon: "⚡"
    },
    {
        title: "Earn Status",
        description: "Login daily for <span class='highlight'>+5 tokens</span>. Build your streak to earn massive XP bonuses.",
        icon: "💎"
    },
    {
        title: "Build Your Identity",
        description: "Spend tokens on exclusive <span class='highlight'>Avatars and Frames</span>. Stand out in the arena chat.",
        icon: "👑"
    },
    {
        title: "Climb the Standings",
        description: "Accurate calls boost your ranking. Top Supporters earn respect and entry into exclusive <span class='highlight'>Prize Draws</span>.",
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
