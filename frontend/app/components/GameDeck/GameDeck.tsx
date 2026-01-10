'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import MatchCard from '../MatchCard/MatchCard';
import styles from './GameDeck.module.css';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    home_logo?: string;
    away_logo?: string;
}

interface GameDeckProps {
    leagueId: string;
}

const to = (i: number) => ({
    x: 0,
    y: 0, // Keep them all centered y, or slight tilt
    scale: 1,
    rot: -10 + Math.random() * 20,
    opacity: 1,
    delay: i * 100
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000, opacity: 0 });
const trans = (r: number, s: number) => `rotateZ(${r}deg) scale(${s})`;

const GameDeck: React.FC<GameDeckProps> = ({ leagueId }) => {
    const { t } = useLanguage();
    const { token } = useAuth();
    const router = useRouter();
    const [gone] = useState(() => new Set<number>());
    const [matches, setMatches] = useState<Match[]>([]);
    const [showCompletion, setShowCompletion] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [predictionCount, setPredictionCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        const fetchMatches = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/rooms/soccer/matches?league=${leagueId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setMatches(await res.json());
                }
            } catch (err) { console.error("Error fetching matches:", err); }
        };
        fetchMatches();
    }, [leagueId, token]);

    // Countdown timer for auto-return
    useEffect(() => {
        if (showCompletion && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (showCompletion && countdown === 0) {
            router.push('/rooms/soccer');
        }
    }, [showCompletion, countdown, router]);

    const [props, api] = useSprings(matches.length, i => ({
        ...to(i),
        from: from(i),
        immediate: key => gone.has(i) // If gone, be immediate for all properties to stay off-screen
    }));

    const bind = useDrag(({ args: [index], active, movement: [mx], velocity: [vx], direction: [xDir] }) => {
        // Trigger when user releases with enough velocity or distance
        const trigger = !active && (Math.abs(vx) > 0.2 || Math.abs(mx) > 100);

        if (trigger && !gone.has(index)) {
            const match = matches[index];
            const pickSide = mx > 0 ? 'home' : 'away';

            gone.add(index);
            setPredictionCount(prev => prev + 1);

            // SAVE TO BACKEND
            const submitPrediction = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    const pickName = pickSide === 'home' ? match.home_team : match.away_team;

                    await fetch(`${apiUrl}/api/rooms/soccer/predictions/match`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            matchId: match.match_id,
                            pick: pickName
                        })
                    });
                } catch (err) {
                    console.error("Prediction failed to save:", err);
                }
            };
            submitPrediction();

            // Check if all cards are swiped
            if (gone.size === matches.length) {
                setTimeout(() => setShowCompletion(true), 600);
            }
        }

        // Update animation for this card
        api.start(i => {
            if (index !== i) return;
            const isGone = gone.has(index);

            if (isGone) {
                const finalXDir = mx > 0 ? 1 : -1;
                return {
                    x: (500 + window.innerWidth) * finalXDir, // Fly further out
                    rot: finalXDir * 60, // Stronger rotation
                    scale: 0.5, // Shrink more
                    opacity: 0,
                    immediate: false,
                    config: { tension: 200, friction: 30 }
                };
            } else {
                const rot = mx / 15;
                const scale = active ? 1.05 : 1;
                return {
                    x: active ? mx : 0,
                    rot: active ? rot : 0,
                    scale,
                    opacity: 1,
                    immediate: false,
                    config: { tension: active ? 800 : 500, friction: 50 }
                };
            }
        });
    });

    if (matches.length === 0) {
        return <div className={styles.empty}>{t('no_matches_available')}</div>;
    }

    if (showCompletion) {
        return (
            <div className={styles.completionScreen}>
                <div className={styles.completionCard}>
                    <div className={styles.completionIcon}>🎉</div>
                    <h2>{t('completion_title') || 'All Predictions Complete!'}</h2>
                    <p className={styles.completionStats}>{`You made ${predictionCount} predictions`}</p>
                    <div className={styles.completionActions}>
                        <button
                            onClick={() => router.push('/draw')}
                            className={styles.drawButton}
                        >
                            🎟️ {t('go_to_draw_room')}
                        </button>
                        <button
                            onClick={() => router.push('/rooms/soccer')}
                            className={styles.completionButton}
                        >
                            {t('back_to_leagues')}
                        </button>
                    </div>
                    <p className={styles.completionCountdown}>{`Auto-returning in ${countdown}...`}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.deckContainer}>
            {props.map((springProps, i) => {
                const isGone = gone.has(i);
                return (
                    <animated.div
                        className={styles.deck}
                        key={matches[i]?.match_id || i}
                        style={{
                            x: springProps.x,
                            y: springProps.y,
                            opacity: springProps.opacity,
                            zIndex: matches.length - i, // Index 0 is on TOP
                            visibility: springProps.opacity.to(o => o === 0 && isGone ? 'hidden' : 'visible'),
                            pointerEvents: isGone ? 'none' : 'auto'
                        }}
                    >
                        <animated.div {...bind(i)} style={{ transform: interpolate([springProps.rot, springProps.scale], trans) }}>
                            <MatchCard match={matches[i]} />
                        </animated.div>
                    </animated.div>
                );
            })}
        </div>
    );
};

export default GameDeck;
