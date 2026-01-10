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

const to = (i: number) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 });
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const trans = (r: number, s: number) => `rotateZ(${r}deg) scale(${s})`;

const GameDeck: React.FC<GameDeckProps> = ({ leagueId }) => {
    const { t } = useLanguage();
    const { token } = useAuth();
    const router = useRouter();
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

    const [props, api] = useSprings(matches.length, i => ({ ...to(i), from: from(i) }));

    const bind = useDrag(({ args: [index], active, movement: [mx], velocity: [vx], direction: [xDir] }) => {
        // Trigger swipe when velocity is high OR distance is far enough
        const trigger = !active && (Math.abs(vx) > 0.2 || Math.abs(mx) > 100);

        if (trigger) {
            const match = matches[index];
            const pickSide = mx > 0 ? 'home' : 'away';

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

            setPredictionCount(prev => prev + 1);

            // FLY CARD OFF SCREEN
            api.start(i => {
                if (index !== i) return;
                return {
                    x: (200 + window.innerWidth) * xDir,
                    rot: xDir * 20,
                    scale: 1,
                    config: { tension: 200, friction: 20 }
                };
            });

            // REMOVE CARD FROM ARRAY after animation
            setTimeout(() => {
                setMatches(prev => prev.filter((_, i) => i !== index));
                if (matches.length === 1) {
                    setShowCompletion(true);
                }
            }, 300);
        } else {
            // DURING DRAG - follow finger
            api.start(i => {
                if (index !== i) return;
                const rot = mx / 15;
                const scale = active ? 1.05 : 1;
                return {
                    x: active ? mx : 0,
                    rot: active ? rot : 0,
                    scale,
                    config: { tension: 800, friction: 50 }
                };
            });
        }
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
            {props.map((springProps, i) => (
                <animated.div className={styles.deck} key={i} style={{ x: springProps.x, y: springProps.y }}>
                    <animated.div {...bind(i)} style={{ transform: interpolate([springProps.rot, springProps.scale], trans) }}>
                        <MatchCard match={matches[i]} />
                    </animated.div>
                </animated.div>
            ))}
        </div>
    );
};

export default GameDeck;
