'use client';

import React, { useEffect, useState } from 'react';
import styles from './Leaderboard.module.css';

interface LeaderboardEntry {
    username: string;
    points: number;
    level: number;
    rank: number;
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
                    // FIX: Extract the array from the new { success, leaderboard } structure
                    if (data && Array.isArray(data.leaderboard)) {
                        setEntries(data.leaderboard);
                    } else if (Array.isArray(data)) {
                        setEntries(data);
                    }
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className={styles.loading}>Accessing Prophet Records...</div>;

    return (
        <div className={`${styles.container} glass`}>
            <h2 className={styles.title}>ARENA RANKINGS</h2>
            <div className={styles.list}>
                {entries.length === 0 ? (
                    <p className={styles.empty}>No prophecies recorded yet.</p>
                ) : (
                    entries.map((entry, index) => (
                        <div key={`${entry.username}-${index}`} className={styles.row}>
                            <div className={styles.rank}>
                                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                            </div>
                            <div className={styles.userInfo}>
                                <span className={styles.username}>@{entry.username}</span>
                                <span className={styles.levelBadge}>Lvl {entry.level || 1}</span>
                            </div>
                            <div className={styles.points}>{entry.points}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
