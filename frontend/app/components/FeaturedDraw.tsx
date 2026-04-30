'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './FeaturedDraw.module.css';

interface Draw {
    id: number;
    title: string;
    prize: string;
    description: string;
    draw_date: string;
    status: string;
}

const FeaturedDraw = () => {
    const [draw, setDraw] = useState<Draw | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const fetchDraw = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/draws`);
                if (res.ok) {
                    const data = await res.json();
                    const activeDraws = data.draws || [];
                    if (activeDraws.length > 0) {
                        // Find the one closest to June 1st or the first active one
                        setDraw(activeDraws[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching featured draw:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDraw();
    }, []);

    useEffect(() => {
        if (!draw?.draw_date) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(draw.draw_date).getTime();
            const distance = target - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [draw]);

    if (loading) return <div className={styles.loading}>Loading upcoming draws...</div>;
    if (!draw) return null;

    return (
        <section className={styles.container}>
            <h3 className={styles.title}>🔥 FEATURED PRIZE DRAW</h3>
            <div className={`${styles.drawCard} glass`}>
                <span className={styles.badge}>Next Draw</span>
                <div className={styles.prizeIcon}>🎁</div>
                <h2 className={styles.prizeTitle}>{draw.title}</h2>
                <div className={styles.prizeValue}>{draw.prize}</div>
                <p className={styles.description}>{draw.description}</p>
                
                <div className={styles.countdownContainer}>
                    <div className={styles.countdownItem}>
                        <span className={styles.count}>{timeLeft.days}</span>
                        <span className={styles.label}>Days</span>
                    </div>
                    <div className={styles.countdownItem}>
                        <span className={styles.count}>{timeLeft.hours}</span>
                        <span className={styles.label}>Hrs</span>
                    </div>
                    <div className={styles.countdownItem}>
                        <span className={styles.count}>{timeLeft.minutes}</span>
                        <span className={styles.label}>Min</span>
                    </div>
                    <div className={styles.countdownItem}>
                        <span className={styles.count}>{timeLeft.seconds}</span>
                        <span className={styles.label}>Sec</span>
                    </div>
                </div>

                <Link href="/draw" className={styles.actionBtn}>
                    GET TICKETS NOW
                </Link>
            </div>
        </section>
    );
};

export default FeaturedDraw;
