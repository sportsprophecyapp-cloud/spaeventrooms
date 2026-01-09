'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import MatchCard from '../MatchCard/MatchCard';
import styles from './GameDeck.module.css';
import { useLanguage } from '@/app/context/LanguageContext';

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
    const [gone] = useState(() => new Set());
    const [matches, setMatches] = useState<Match[]>([]);
    const [props, api] = useSprings(matches.length, i => ({ ...to(i), from: from(i) }));

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/rooms/soccer/matches?league=${leagueId}`);
                if (res.ok) {
                    setMatches(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch matches:", err);
            }
        };
        fetchMatches();
    }, [leagueId]);

    const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
        const trigger = vx > 0.2;
        if (!active && trigger) gone.add(index);

        api.start(i => {
            if (index !== i) return;
            const isGone = gone.has(index);
            const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0;
            const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0);
            const scale = active ? 1.1 : 1;
            return {
                x, rot, scale, delay: undefined,
                config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
            };
        });

        if (!active && gone.size === matches.length) {
            setTimeout(() => {
                gone.clear();
                api.start(i => to(i));
            }, 600);
        }
    });

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
