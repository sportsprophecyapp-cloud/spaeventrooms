'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import MatchCard from '../MatchCard/MatchCard';
import styles from './GameDeck.module.css';

const to = (i: number) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 });
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const trans = (r: number, s: number) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

interface GameDeckProps {
    leagueId: string;
}

const GameDeck: React.FC<GameDeckProps> = ({ leagueId }) => {
    const [gone] = useState(() => new Set());
    const [matches, setMatches] = useState<any[]>([]);
    const [props, api] = useSprings(matches.length, i => ({ ...to(i), from: from(i) }));

    useEffect(() => {
        // Fetch logic here
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
