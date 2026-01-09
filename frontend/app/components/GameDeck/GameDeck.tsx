'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import MatchCard from '../MatchCard/MatchCard';
import styles from './GameDeck.module.css';
import { useLanguage } from '@/app/context/LanguageContext'; // NEW

// ... (interfaces)

const GameDeck: React.FC<GameDeckProps> = ({ leagueId }) => {
    const { t } = useLanguage(); // NEW
    const [gone] = useState(() => new Set());
    const [matches, setMatches] = useState<any[]>([]);
    const [props, api] = useSprings(matches.length, i => ({ /* ... */ }));

    // ... (useEffect and useDrag)

    if (matches.length === 0) {
        return <div className={styles.empty}>{t('no_matches_available')}</div>; // TRANSLATED
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
