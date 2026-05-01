'use client';

import React, { useState, useEffect } from 'react';
import styles from './PulseCTA.module.css';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

interface PulseMatch {
    match_id: string;
    home_team: string;
    away_team: string;
    home_logo: string;
    away_logo: string;
    room_id: string;
    total_votes: string;
    percentages: { home: number, away: number };
}

const PulseCTA = () => {
    const { token, user, refreshUser } = useAuth();
    const [match, setMatch] = useState<PulseMatch | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<string | null>(null);

    useEffect(() => {
        const fetchPulse = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            try {
                const res = await fetch(`${apiUrl}/api/pulse/picks`);
                if (res.ok) {
                    const data = await res.json();
                    const activeMatch = data.publicLock || data.coinToss || null;
                    setMatch(activeMatch);

                    // If logged in, check if user has already voted for THIS specific match
                    if (activeMatch && token) {
                        const checkRes = await fetch(`${apiUrl}/api/rooms/${activeMatch.room_id}/predictions/match?matchId=${activeMatch.match_id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (checkRes.ok) {
                            const pred = await checkRes.json();
                            if (pred) setSubmitted(pred.prediction_data?.pick || 'LOCKED');
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching pulse pick:', err);
            }
        };
        fetchPulse();
    }, [token]);

    const handleQuickPick = async (side: 'home' | 'away') => {
        /* if (!token) {
            window.location.href = '/auth/login';
            return;
        } */
        if (!match) return;

        setIsSubmitting(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
        
        // IMPORTANT: Send the actual TEAM NAME as the pick
        const pickName = side === 'home' ? match.home_team : match.away_team;

        try {
            const res = await fetch(`${apiUrl}/api/rooms/${match.room_id}/predictions/match`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matchId: match.match_id,
                    pick: pickName
                })
            });

            if (res.ok) {
                setSubmitted(pickName);
                await refreshUser();
            }
        } catch (err) {
            console.error('Error submitting quick pick:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!match) return null;

    return (
        <div className={styles.pulseContainer}>
            <div className={styles.pulseHeader}>
                <div className={styles.liveIndicator}>
                    <span className={styles.dot}></span>
                    ARENA PULSE
                </div>
                <span className={styles.totalVotes}>{parseInt(match.total_votes).toLocaleString()} FANS ALREADY VOTED</span>
            </div>

            <Link href={`/arena/${match.room_id}?matchId=${match.match_id}`} className={styles.matchLink}>
                <div className={styles.matchDisplay}>
                    <div className={styles.team}>
                        <img src={match.home_logo} alt={match.home_team} />
                        <span className={styles.teamName}>{match.home_team}</span>
                        <span className={styles.pct}>{match.percentages.home}%</span>
                    </div>
                    <div className={styles.vs}>VS</div>
                    <div className={styles.team}>
                        <img src={match.away_logo} alt={match.away_team} />
                        <span className={styles.teamName}>{match.away_team}</span>
                        <span className={styles.pct}>{match.percentages.away}%</span>
                    </div>
                </div>

                <div className={styles.sentimentBar}>
                    <div className={styles.homeFill} style={{ width: `${match.percentages.home}%` }}></div>
                    <div className={styles.awayFill} style={{ width: `${match.percentages.away}%` }}></div>
                </div>
            </Link>

            <div className={styles.actions}>
                {submitted ? (
                    <div className={styles.successMsg}>
                        ✅ {submitted.toUpperCase()} — PICK LOCKED! <Link href={`/arena/${match.room_id}?matchId=${match.match_id}`}>ENTER ARENA →</Link>
                    </div>
                ) : (
                    <>
                        <button 
                            className={styles.pickBtn} 
                            onClick={() => handleQuickPick('home')}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : `${match.home_team} WIN`}
                        </button>
                        <button 
                            className={styles.pickBtn} 
                            onClick={() => handleQuickPick('away')}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : `${match.away_team} WIN`}
                        </button>
                    </>
                )}
            </div>
            
            {!user && (
                <p className={styles.loginHint}>* Login to earn tokens for your pick</p>
            )}
        </div>
    );
};

export default PulseCTA;
