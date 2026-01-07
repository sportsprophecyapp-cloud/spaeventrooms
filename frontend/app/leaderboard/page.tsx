'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface Standing {
    rank: number;
    username: string;
    points: number;
    level: number;
}

const LeaderboardContent = () => {
    const [standings, setStandings] = useState<Standing[]>([]);
    const [filter, setFilter] = useState<'global' | 'soccer'>('global');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStandings = async () => {
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/leaderboard`);
                if (res.ok) {
                    const data = await res.json();
                    setStandings(data.leaderboard || []);
                }
            } catch (err) {
                console.error('Failed to fetch standings');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStandings();
    }, [filter]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>← RETURN</button>
                <h1 className={styles.title}>ARENA STANDINGS</h1>
                <p className={styles.subtitle}>The elite analysts of the Events Arena.</p>
            </header>

            <div className={styles.filterBar}>
                {(['global', 'soccer'] as const).map(f => (
                    <button 
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'soccer' ? '🎯 Soccer' : '🏆 Global'}
                    </button>
                ))}
            </div>

            <main className={`${styles.board} glass`}>
                <div className={styles.tableHeader}>
                    <span>Rank</span>
                    <span>Supporter</span>
                    <span>XP</span>
                    <span>Level</span>
                </div>

                <div className={styles.rows}>
                    {isLoading ? (
                        <p className={styles.loading}>Accessing Arena Records...</p>
                    ) : standings.length === 0 ? (
                        <p className={styles.empty}>No standings recorded yet.</p>
                    ) : (
                        standings.map(s => (
                            <div key={s.username} className={styles.row}>
                                <span className={styles.rank}>
                                    {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank-1] : `#${s.rank}`}
                                </span>
                                <span className={styles.username}>@{s.username}</span>
                                <span className={styles.points}>{s.points}</span>
                                <span className={styles.levelBadge}>Lvl {s.level}</span>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default function LeaderboardPage() {
    return (
        <Suspense fallback={<div>Loading Arena Records...</div>}>
            <LeaderboardContent />
        </Suspense>
    );
}
