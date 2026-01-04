'use client';

import React, { useEffect, useState } from 'react';
import styles from './Leaderboard.module.css';

interface LeaderboardEntry {
    email: string;
    total_points: number;
    current_level: number;
}

const Leaderboard: React.FC = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/leaderboard`);
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className={styles.loading}>Loading rankings...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Leaderboard</h2>
            <div className={styles.list}>
                {entries.length === 0 ? (
                    <p className={styles.empty}>No rankings yet. Start predicting!</p>
                ) : (
                    entries.map((entry, index) => (
                        <div key={entry.email} className={styles.row}>
                            <div className={styles.rank}>{index + 1}</div>
                            <div className={styles.userInfo}>
                                <span className={styles.email}>{entry.email.split('@')[0]}</span>
                                <span className={styles.level}>Lvl {entry.current_level}</span>
                            </div>
                            <div className={styles.points}>{entry.total_points}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
