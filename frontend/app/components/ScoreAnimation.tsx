'use client';

import React, { useEffect, useState } from 'react';
import styles from './ScoreAnimation.module.css';

interface ScoreAnimationProps {
    value: string;
    trigger: boolean;
    onComplete: () => void;
}

const ScoreAnimation: React.FC<ScoreAnimationProps> = ({ value, trigger, onComplete }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (trigger) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                onComplete();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    if (!visible) return null;

    return (
        <div className={styles.container}>
            <span className={styles.text}>{value}</span>
        </div>
    );
};

export default ScoreAnimation;
