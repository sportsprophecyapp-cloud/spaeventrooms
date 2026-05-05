'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveTicker.module.css';

interface TickerMatch {
    home_team: string;
    away_team: string;
    score_home: number | null;
    score_away: number | null;
    status: string;
    sport: string;
    start_time?: string;
}

const LiveTicker = () => {
    const [matches, setMatches] = useState<TickerMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
                const res = await fetch(`${apiUrl}/api/pulse/ticker`);
                if (res.ok) {
                    const data = await res.json();
                    setMatches(data);
                }
            } catch (err) {
                console.error('Error fetching ticker:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (loading || matches.length === 0) return null;

    const hasLive = matches.some(m => m.status === 'live');

    // Double matches for seamless loop
    const displayMatches = [...matches, ...matches];

    return (
        <div className={styles.tickerWrapper}>
            <div className={styles.liveLabel} style={!hasLive ? { background: '#2c2c2c' } : {}}>
                <span className={styles.dot} style={!hasLive ? { background: '#ffa502' } : {}}></span>
                {hasLive ? 'LIVE SCORES' : 'UPCOMING'}
            </div>
            <div className={styles.marqueeContainer}>
                <div className={styles.marqueeTrack}>
                    {displayMatches.map((m, idx) => (
                        <div key={`${m.home_team}-${idx}`} className={styles.matchItem}>
                            <span className={styles.sportTag}>{m.sport.toUpperCase()}</span>
                            <span className={styles.teams}>
                                {m.home_team} 
                                {m.status !== 'scheduled' && (
                                    <> <span className={styles.score}>{m.score_home ?? 0}</span> - <span className={styles.score}>{m.score_away ?? 0}</span> </>
                                )}
                                {m.status === 'scheduled' && <span className={styles.score}> vs </span>}
                                {m.away_team}
                            </span>
                            <span className={m.status === 'live' ? styles.liveStatus : m.status === 'scheduled' ? styles.upcomingStatus : styles.finishedStatus}>
                                {m.status === 'live' ? 'LIVE' : m.status === 'scheduled' && m.start_time ? `${new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'FT'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveTicker;
