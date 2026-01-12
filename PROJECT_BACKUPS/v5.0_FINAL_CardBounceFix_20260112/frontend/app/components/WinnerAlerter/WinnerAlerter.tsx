'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './WinnerAlerter.module.css';
import confetti from 'canvas-confetti';

const WinnerAlerter = () => {
    const { user, token } = useAuth();
    const [win, setWin] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!user || !token) return;

        const checkWins = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/wins`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.success && data.wins.length > 0) {
                    const latestWin = data.wins[0];
                    // Logic: Check if we've already shown this win in this session
                    const seenWinId = sessionStorage.getItem('seen_win_id');
                    if (seenWinId !== String(latestWin.id)) {
                        setWin(latestWin);
                        setIsVisible(true);
                        triggerConfetti();
                        sessionStorage.setItem('seen_win_id', String(latestWin.id));
                    }
                }
            } catch (e) {
                console.error('Win check failed:', e);
            }
        };

        checkWins();
    }, [user, token]);

    const triggerConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    if (!isVisible || !win) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.top}>🏆 THE RESULTS ARE IN!</div>
                <div className={styles.content}>
                    <h2>CONGRATULATIONS!</h2>
                    <p>You are a lucky winner of:</p>
                    <div className={styles.prizeCard}>
                        <h3>{win.prize}</h3>
                        <p>{win.title}</p>
                    </div>
                    <p className={styles.checkEmail}>Check your email for redemption instructions!</p>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsVisible(false)}>🎉 AWESOME!</button>
            </div>
        </div>
    );
};

export default WinnerAlerter;
