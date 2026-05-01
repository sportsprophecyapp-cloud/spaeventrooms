import React, { useState, useEffect } from 'react';
import styles from './LiveTicker.module.css';

interface TickerMatch {
    home_team: string;
    away_team: string;
    score_home: number;
    score_away: number;
    status: string;
    sport: string;
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

    // Double matches for seamless loop
    const displayMatches = [...matches, ...matches];

    return (
        <div className={styles.tickerWrapper}>
            <div className={styles.liveLabel}>
                <span className={styles.dot}></span>
                LIVE SCORES
            </div>
            <div className={styles.marqueeContainer}>
                <div className={styles.marqueeTrack}>
                    {displayMatches.map((m, idx) => (
                        <div key={`${m.home_team}-${idx}`} className={styles.matchItem}>
                            <span className={styles.sportTag}>{m.sport.toUpperCase()}</span>
                            <span className={styles.teams}>
                                {m.home_team} <span className={styles.score}>{m.score_home}</span> - <span className={styles.score}>{m.score_away}</span> {m.away_team}
                            </span>
                            <span className={m.status === 'live' ? styles.liveStatus : styles.finishedStatus}>
                                {m.status === 'live' ? 'LIVE' : 'FT'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveTicker;
