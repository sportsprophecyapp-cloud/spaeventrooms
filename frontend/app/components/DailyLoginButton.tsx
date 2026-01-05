'use client';

import React, { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import styles from './DailyLoginButton.module.css';

export default function DailyLoginButton() {
    const { streak, claimDailyLogin, loading } = useGamification();
    const [message, setMessage] = useState<string | null>(null);
    const [claiming, setClaiming] = useState(false);

    const handleClaim = async () => {
        setClaiming(true);
        setMessage(null);

        const result = await claimDailyLogin();

        if (result) {
            setMessage(result.reward.message);
            setTimeout(() => setMessage(null), 5000);
        }

        setClaiming(false);
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.claimBtn}
                onClick={handleClaim}
                disabled={claiming || loading}
            >
                <span className={styles.fireIcon}>🔥</span>
                <div className={styles.textContainer}>
                    <span className={styles.streakCount}>{streak.current} Day Streak</span>
                    <span className={styles.claimText}>
                        {claiming ? 'Claiming...' : 'Claim Daily Reward'}
                    </span>
                </div>
            </button>

            {message && (
                <div className={styles.message}>
                    {message}
                </div>
            )}
        </div>
    );
}
