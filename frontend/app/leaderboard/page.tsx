'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

interface LeaderboardEntry {
    rank: number;
    username: string;
    points: number;
    correct_predictions: number;
    accuracy: number;
    avatar_url?: string;
}

const LeaderboardPage = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('soccer');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/leaderboard?sport=${filter}`);
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data.leaderboard);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [filter]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Global Rankings</h1>
                <div className={styles.filters}>
                    {['soccer', 'all-time'].map(f => (
                        <button 
                            key={f}
                            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'soccer' ? '⚽ Soccer' : '🏆 Global'}
                        </button>
                    ))}
                </div>
            </header>

            <main className={styles.main}>
                <div className={`${styles.leaderboardCard} glass`}>
                    <div className={styles.tableHeader}>
                        <span>Rank</span>
                        <span>Prophet</span>
                        <span>Correct</span>
                        <span>PTS</span>
                    </div>
                    
                    <div className={styles.entries}>
                        {isLoading ? (
                            <div className={styles.loading}>Calculating Ranks...</div>
                        ) : entries.map((entry, index) => (
                            <div key={entry.username} className={styles.entry}>
                                <div className={styles.rank}>
                                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                                </div>
                                <div className={styles.user}>
                                    <div className={styles.miniAvatar}>
                                        {entry.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{entry.username}</span>
                                </div>
                                <div className={styles.correct}>{entry.correct_predictions}</div>
                                <div className={styles.points}>{entry.points}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LeaderboardPage;
