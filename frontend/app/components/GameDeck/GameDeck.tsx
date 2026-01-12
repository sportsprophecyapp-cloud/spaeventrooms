'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import styles from './GameDeck.module.css';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { useSponsor } from '@/app/context/SponsorContext';
import { useRouter } from 'next/navigation';
import ToastNotification from '../ToastNotification/ToastNotification';

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

const GameDeck: React.FC<GameDeckProps> = ({ leagueId }) => {
    const { t } = useLanguage();
    const { token, refreshUser } = useAuth();
    const { sponsors } = useSponsor();
    const router = useRouter();
    const [gone, setGone] = useState<Set<number>>(() => new Set());

    // ... (rest of component) ...

    return (
        <div className={styles.deckWrapper}>
            {/* ... */}
            <div className={styles.deckContainer} onMouseLeave={() => setDragX(0)}>
                {props.map((springProps, i) => {
                    const isGone = gone.has(i);
                    const match = matches[i];
                    const sponsor = sponsors.length > 0 ? sponsors[i % sponsors.length] : null;

                    // Safely extract date parts if available
                    let timeDisplay = match?.start_time;
                    try {
                        const dateObj = new Date(match.start_time);
                        if (!isNaN(dateObj.getTime())) {
                            timeDisplay = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    } catch (e) {
                        // fallback
                    }

                    return (
                        <animated.div
                            {...bind(i)}
                            className={`${styles.cardWrapper} ${isGone ? styles.cardGone : ''}`}
                            key={match?.match_id || i}
                            style={{
                                x: springProps.x,
                                y: springProps.y,
                                opacity: springProps.opacity,
                                zIndex: matches.length - i,
                                pointerEvents: isGone ? 'none' : 'auto',
                                transform: interpolate([springProps.rot, springProps.scale], (r, s) =>
                                    `rotateZ(${r}deg) scale(${s})`
                                )
                            }}
                        >
                            <div className={styles.hybridCard}>
                                {/* Header */}
                                <div className={styles.cardHeader}>
                                    <p className={styles.predictionType}>MATCH WINNER</p>
                                    <p className={styles.matchTime}>{timeDisplay}</p>
                                </div>

                                {/* Teams Container with Tap Regions */}
                                <div className={styles.teamsContainer}>

                                    {/* HOME TEAM REGION */}
                                    <div
                                        className={`${styles.teamRegion} ${styles.homeRegion}`}
                                    >
                                        <div className={styles.logoWrapper}>
                                            {match?.home_logo ? (
                                                <img
                                                    src={match.home_logo}
                                                    alt={match.home_team}
                                                    className={styles.teamLogo}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex;');
                                                    }}
                                                />
                                            ) : (
                                                <div className={styles.placeholderLogo}>
                                                    {match?.home_team?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <p className={styles.teamName}>{match?.home_team}</p>
                                        <p className={styles.pickLabel}>PICK</p>
                                    </div>

                                    {/* VS */}
                                    <div className={styles.vsContainer}>
                                        <span className={styles.vs}>VS</span>
                                    </div>

                                    {/* AWAY TEAM REGION */}
                                    <div
                                        className={`${styles.teamRegion} ${styles.awayRegion}`}
                                    >
                                        <div className={styles.logoWrapper}>
                                            {match?.away_logo ? (
                                                <img
                                                    src={match.away_logo}
                                                    alt={match.away_team}
                                                    className={styles.teamLogo}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex;');
                                                    }}
                                                />
                                            ) : (
                                                <div className={styles.placeholderLogo}>
                                                    {match?.away_team?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <p className={styles.teamName}>{match?.away_team}</p>
                                        <p className={styles.pickLabel}>PICK</p>
                                    </div>
                                </div>

                                {/* SPONSOR FOOTER */}
                                {sponsor && (
                                    <div className={styles.cardFooter}>
                                        <span className={styles.poweredBy}>POWERED BY</span>
                                        <img src={sponsor.logo_url} alt={sponsor.sponsor_name} className={styles.sponsorLogo} />
                                    </div>
                                )}

                                {/* Swipe Indicator - shows during drag */}
                                <div style={{ opacity: Math.max(0, (dragX - 50) / 100) }} className={styles.swipeIndicatorLeft}>
                                    ✓ PICK HOME
                                </div>
                                <div style={{ opacity: Math.max(0, (-dragX - 50) / 100) }} className={styles.swipeIndicatorRight}>
                                    PICK AWAY ✓
                                </div>
                            </div>
                        </animated.div>
                    );
                })}
            </div>
        </div>
    );
};

export default GameDeck;
