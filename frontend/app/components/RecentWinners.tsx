'use client';

import React, { useState, useEffect } from 'react';
import styles from './RecentWinners.module.css';

interface Winner {
    username: string;
    draw_title: string;
    prize: string;
    draw_date: string;
    sponsor_name?: string;
}

const RecentWinners = () => {
    const [winners, setWinners] = useState<Winner[]>([]);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/recent-winners`);
                if (res.ok) {
                    const data = await res.json();
                    setWinners(data.winners || []);
                }
            } catch (err) {
                console.error('Error fetching winners:', err);
            }
        };
        fetchWinners();
    }, []);

    if (winners.length === 0) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>🏆 Recent Winners</h3>
            <div className={styles.winnerList}>
                {winners.map((winner, idx) => (
                    <div key={idx} className={`${styles.winnerCard} glass`}>
                        <div className={styles.winnerInfo}>
                            <span className={styles.username}>@{winner.username}</span>
                            <span className={styles.prize}>{winner.prize}</span>
                        </div>
                        {winner.sponsor_name && (
                            <span className={styles.sponsor}>via {winner.sponsor_name}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentWinners;
