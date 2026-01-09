'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import MatchCard from '../MatchCard/MatchCard';
import styles from './GameDeck.module.css';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext'; // NEW

interface Match {
    id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    league_logo: string;
}

interface GameDeckProps {
    leagueId: string;
}

const to = (i: number) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 });
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const trans = (r: number, s: number) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const GameDeck: React.FC<GameDeckProps> = ({ leagueId }) => {
    const { t } = useLanguage();
    const { token } = useAuth(); // NEW
    const [gone] = useState(() => new Set());
    const [matches, setMatches] = useState<Match[]>([]);
    const [props, api] = useSprings(matches.length, i => ({ ...to(i), from: from(i) }));

    useEffect(() => {
        if (!token) return; // Don't fetch if not authenticated

        const fetchMatches = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/rooms/soccer/matches?league=${leagueId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // CORRECTED: Added Auth Header
                    }
                });
                if (res.ok) {
                    setMatches(await res.json());
                } else {
                    console.error("API Error fetching matches:", res.status);
                }
            } catch (err) {
                console.error("Network Error fetching matches:", err);
            }
        };
        fetchMatches();
    }, [leagueId, token]);

    const bind = useDrag(/* ... */); // Gesture logic remains the same

    if (matches.length === 0) {
        return <div className={styles.empty}>{t('no_matches_available')}</div>;
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
