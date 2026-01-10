'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import styles from './GameDeck.module.css';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
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
    const { token } = useAuth();
    const router = useRouter();
    const [gone, setGone] = useState<Set<number>>(() => new Set());
    const [matches, setMatches] = useState<Match[]>([]);
    const [showCompletion, setShowCompletion] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [predictionCount, setPredictionCount] = useState(0);
    const [hoveredRegion, setHoveredRegion] = useState<'home' | 'away' | null>(null);
    const [dragX, setDragX] = useState(0);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

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
            } catch (err) {
                console.error("Error fetching matches:", err);
            }
        };
        fetchMatches();
    }, [leagueId, token]);

    useEffect(() => {
        if (showCompletion && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (showCompletion && countdown === 0) {
            router.push('/rooms/soccer');
        }
    }, [showCompletion, countdown, router]);

    const [props, api] = useSprings(matches.length, i => ({
        x: 0,
        y: 0,
        scale: 1,
        rot: 0,
        opacity: 1,
        config: { tension: 500, friction: 40 }
    }));

    const bind = useDrag(({ args: [index], active, movement: [mx], velocity: [vx], direction: [xDir] }) => {
        const isGone = gone.has(index);
        if (isGone) return;

        // Track drag amount for visual feedback
        if (active) {
            setDragX(mx);
        }

        const trigger = !active && (Math.abs(vx) > 0.1 || Math.abs(mx) > 100);
        const dir = mx > 0 ? 1 : -1;

        if (trigger) {
            const match = matches[index];
            const pickSide = mx > 0 ? 'home' : 'away';

            // OPTIMISTIC UPDATE: Remove card immediately
            setGone(prev => new Set(prev).add(index));
            setPredictionCount(prev => prev + 1);
            setDragX(0);

            // Animate card flying off
            api.start(i => {
                if (index !== i) return;
                const x = (window.innerWidth + 200) * dir;
                return {
                    x,
                    y: 100 * dir,
                    rot: dir * 45,
                    scale: 0.9,
                    opacity: 0,
                    config: { tension: 200, friction: 25 }
                };
            });

            // FIRE-AND-FORGET API CALL (Don't await to block UI)
            const submitPrediction = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    const pickName = pickSide === 'home' ? match.home_team : match.away_team;

                    // We intentionally do NOT await the fetch response to block the UI
                    fetch(`${apiUrl}/api/rooms/soccer/predictions/match`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            matchId: match.match_id,
                            pick: pickName
                        })
                    }).then(res => {
                        if (!res.ok && res.status !== 402) {
                            console.error('Prediction save warning:', res.status);
                            setMessage({ text: 'Error saving prediction', type: 'error' });
                        }
                    }).catch(err => {
                        console.error("Prediction network error:", err);
                        setMessage({ text: 'Network error saving prediction', type: 'error' });
                    });

                } catch (err) {
                    console.error("Prediction failed to save:", err);
                    setMessage({ text: 'Failed to save prediction', type: 'error' });
                }
            };
            submitPrediction();

            // Check completion
            if (gone.size + 1 === matches.length) {
                setTimeout(() => setShowCompletion(true), 500);
            }
        } else {
            // While dragging or idle
            const rot = mx / 25;
            const scale = active ? 1.02 : 1;
            const opacity = 1 - Math.abs(mx) / 500;

            api.start(i => {
                if (index !== i) return;
                return {
                    x: active ? mx : 0,
                    rot: active ? rot : 0,
                    scale,
                    opacity: Math.max(0.5, opacity),
                    config: { tension: active ? 800 : 500, friction: 40 }
                };
            });
        }
    });

    if (matches.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyContent}>
                    <div className={styles.emptyIcon}>⚽</div>
                    <p className={styles.emptyText}>{t('no_matches_available')}</p>
                </div>
            </div>
        );
    }

    if (showCompletion) {
        return (
            <div className={styles.completionScreen}>
                <div className={styles.completionCard}>
                    <div className={styles.completionIcon}>🎉</div>
                    <h2 className={styles.completionTitle}>{t('completion_title') || 'All Predictions Complete!'}</h2>
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
                    <p className={styles.completionCountdown}>{`Auto-returning in ${countdown}s`}</p>
                </div>
            </div>
        );
    }

    const remainingCards = matches.length - gone.size;

    return (
        <div className={styles.deckWrapper}>
            {message && (
                <ToastNotification
                    message={message.text}
                    type={message.type}
                    onClose={() => setMessage(null)}
                />
            )}
            <div className={styles.deckHeader}>
                <p className={styles.cardsRemaining}>{remainingCards} {remainingCards === 1 ? 'Match' : 'Matches'} Left</p>
                <p className={styles.swipeHint}>Tap or Swipe to Predict</p>
            </div>

            <div className={styles.deckContainer} onMouseLeave={() => setDragX(0)}>
                {props.map((springProps, i) => {
                    const isGone = gone.has(i);
                    const match = matches[i];

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
                                        className={`${styles.teamRegion} ${styles.homeRegion} ${hoveredRegion === 'home' ? styles.hoveredRegion : ''}`}
                                        onMouseEnter={() => setHoveredRegion('home')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                        onClick={() => {
                                            if (!isGone) {
                                                setGone(prev => new Set(prev).add(i));
                                                setPredictionCount(prev => prev + 1);
                                                api.start(idx => {
                                                    if (i !== idx) return;
                                                    return {
                                                        x: window.innerWidth + 200,
                                                        y: 100,
                                                        rot: 45,
                                                        scale: 0.9,
                                                        opacity: 0,
                                                        config: { tension: 200, friction: 25 }
                                                    };
                                                });
                                                // Save prediction
                                                const submitPrediction = async () => {
                                                    try {
                                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                                        const pickName = match.home_team;

                                                        fetch(`${apiUrl}/api/rooms/soccer/predictions/match`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({
                                                                matchId: match.match_id,
                                                                pick: pickName
                                                            })
                                                        }).then(res => {
                                                            if (!res.ok && res.status !== 402) {
                                                                console.error('Prediction save warning:', res.status);
                                                                setMessage({ text: 'Error saving prediction', type: 'error' });
                                                            }
                                                        }).catch(err => {
                                                            console.error("Prediction network error:", err);
                                                            setMessage({ text: 'Network error saving prediction', type: 'error' });
                                                        });
                                                    } catch (err) {
                                                        console.error("Prediction failed to save:", err);
                                                        setMessage({ text: 'Failed to save prediction', type: 'error' });
                                                    }
                                                };
                                                submitPrediction();
                                                if (gone.size + 1 === matches.length) {
                                                    setTimeout(() => setShowCompletion(true), 500);
                                                }
                                            }
                                        }}
                                    >
                                        <div className={styles.logoWrapper}>
                                            {match?.home_logo && !match.home_logo.includes('.toLowerCase()') ? (
                                                <img
                                                    src={match.home_logo}
                                                    alt={match.home_team}
                                                    className={styles.teamLogo}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex;');
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={styles.placeholderLogo}
                                                style={{ display: !match?.home_logo || match.home_logo.includes('.toLowerCase()') ? 'flex' : 'none' }}
                                            >
                                                {match?.home_team?.charAt(0) || '?'}
                                            </div>
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
                                        className={`${styles.teamRegion} ${styles.awayRegion} ${hoveredRegion === 'away' ? styles.hoveredRegion : ''}`}
                                        onMouseEnter={() => setHoveredRegion('away')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                        onClick={() => {
                                            if (!isGone) {
                                                setGone(prev => new Set(prev).add(i));
                                                setPredictionCount(prev => prev + 1);
                                                api.start(idx => {
                                                    if (i !== idx) return;
                                                    return {
                                                        x: -(window.innerWidth + 200),
                                                        y: -100,
                                                        rot: -45,
                                                        scale: 0.9,
                                                        opacity: 0,
                                                        config: { tension: 200, friction: 25 }
                                                    };
                                                });
                                                // Save prediction
                                                const submitPrediction = async () => {
                                                    try {
                                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                                        const pickName = match.away_team;

                                                        fetch(`${apiUrl}/api/rooms/soccer/predictions/match`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({
                                                                matchId: match.match_id,
                                                                pick: pickName
                                                            })
                                                        }).then(res => {
                                                            if (!res.ok && res.status !== 402) {
                                                                console.error('Prediction save warning:', res.status);
                                                                setMessage({ text: 'Error saving prediction', type: 'error' });
                                                            }
                                                        }).catch(err => {
                                                            console.error("Prediction network error:", err);
                                                            setMessage({ text: 'Network error saving prediction', type: 'error' });
                                                        });
                                                    } catch (err) {
                                                        console.error("Prediction failed to save:", err);
                                                        setMessage({ text: 'Failed to save prediction', type: 'error' });
                                                    }
                                                };
                                                submitPrediction();
                                                if (gone.size + 1 === matches.length) {
                                                    setTimeout(() => setShowCompletion(true), 500);
                                                }
                                            }
                                        }}
                                    >
                                        <div className={styles.logoWrapper}>
                                            {match?.away_logo && !match.away_logo.includes('.toLowerCase()') ? (
                                                <img
                                                    src={match.away_logo}
                                                    alt={match.away_team}
                                                    className={styles.teamLogo}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex;');
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={styles.placeholderLogo}
                                                style={{ display: !match?.away_logo || match.away_logo.includes('.toLowerCase()') ? 'flex' : 'none' }}
                                            >
                                                {match?.away_team?.charAt(0) || '?'}
                                            </div>
                                        </div>
                                        <p className={styles.teamName}>{match?.away_team}</p>
                                        <p className={styles.pickLabel}>PICK</p>
                                    </div>
                                </div>

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
