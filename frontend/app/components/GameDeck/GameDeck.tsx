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
    id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    league_logo: string;
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
    const [gone] = useState(() => new Set());
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

    const bind = useDrag(({ args: [index], active, movement: [mx, my], direction: [xDir, yDir], velocity: [vx, vy], distance }) => {
        // VELOCITY SENSITIVITY: 0.1 is quite low, but 0.2 is industry standard.
        // DISTANCE SENSITIVITY: 80px on mobile is better than 100px.
        const trigger = Math.abs(vx) > 0.05 || Math.abs(mx) > 80;

        if (!active && trigger) {
            gone.add(index);
            setPredictionCount(prev => prev + 1);
        }
        api.start(i => {
            if (index !== i) return;
            const isGone = gone.has(index);

            // PHYSICS: If NOT gone, keep it tethered. If GONE, send it flying.
            const x = isGone ? (250 + window.innerWidth) * xDir : active ? mx : 0;
            const rot = mx / 20 + (isGone ? xDir * 15 * vx : 0); // Normalized rotation
            const scale = active ? 1.05 : 1;

            return {
                x,
                rot,
                scale,
                delay: undefined,
                config: {
                    friction: 40,
                    tension: active ? 800 : isGone ? 150 : 400
                }
            };
        });

        // Check if all cards are swiped
        if (!active && gone.size === matches.length) {
            setTimeout(() => setShowCompletion(true), 600);
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
