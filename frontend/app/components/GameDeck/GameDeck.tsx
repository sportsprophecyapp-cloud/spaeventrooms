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
    const { sponsors, trackSponsor } = useSponsor();
    const router = useRouter();
    const [gone, setGone] = useState<Set<number>>(() => new Set());

    const [matches, setMatches] = useState<Match[]>([]);
    const [showCompletion, setShowCompletion] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [predictionCount, setPredictionCount] = useState(0);
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

    const submitPrediction = async (match: Match, pickSide: string, attemptNum = 1) => {
        const MAX_RETRIES = 2;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const pickName = pickSide === 'home' ? match.home_team : match.away_team;

            const response = await fetch(`${apiUrl}/api/rooms/soccer/predictions/match`, {
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

            if (response.ok) {
                setMessage({ text: `Prediction saved: ${pickName}`, type: 'success' });
                return true;
            } else if (response.status === 402) {
                // Out of tokens - don't retry
                setMessage({ text: 'Not enough tokens', type: 'error' });
                return false;
            } else if (attemptNum < MAX_RETRIES) {
                // Retry on server error
                console.warn(`Prediction failed, retrying (attempt ${attemptNum + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return submitPrediction(match, pickSide, attemptNum + 1);
            } else {
                setMessage({ text: 'Failed to save prediction', type: 'error' });
                return false;
            }
        } catch (err) {
            if (attemptNum < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return submitPrediction(match, pickSide, attemptNum + 1);
            }
            setMessage({ text: 'Network error', type: 'error' });
            return false;
        }
    };

    // Use a ref for immediate feedback to avoid race conditions during drag end
    const goneRef = React.useRef<Set<number>>(new Set());
    const exitPositions = React.useRef<Map<number, { x: number, y: number, rot: number }>>(new Map());

    // Sync ref with state on mount/updates
    useEffect(() => {
        gone.forEach(i => goneRef.current.add(i));
    }, [gone]);

    const bind = useDrag(({ args: [index], active, movement: [mx], velocity: [vx], swipe: [swipeX], direction: [xDir], down }) => {
        // CRITICAL: Check if gone BEFORE any logic
        if (goneRef.current.has(index)) {
            return; // Don't process ANY events for gone cards
        }

        // Track drag amount for visual feedback
        if (active) {
            setDragX(mx);
        } else {
            setDragX(0);
        }

        const trigger = swipeX !== 0 || (!active && Math.abs(mx) > 100);
        const dir = swipeX !== 0 ? swipeX : (mx > 0 ? 1 : -1);

        if (trigger) {
            console.log('SWIPING CARD:', index, 'Direction:', dir, 'Gone size:', goneRef.current.size + 1);

            const match = matches[index];
            const pickSide = mx > 0 ? 'home' : 'away';

            // Mark as gone IMMEDIATELY
            goneRef.current.add(index);
            setGone(prev => new Set(prev).add(index)); // Moved up

            // Calculate exit position
            const exitX = (window.innerWidth + 200) * dir;
            const exitY = 100 * dir;
            const exitRot = dir * 45;

            // Save exit position so safety net knows where to keep it
            exitPositions.current.set(index, { x: exitX, y: exitY, rot: exitRot });

            // Fire animation IMMEDIATELY with no delay
            api.start(i => {
                if (index !== i) return;
                return {
                    x: exitX,
                    y: 100 * dir,
                    rot: dir * 45,
                    scale: 0.9,
                    opacity: 0,
                    immediate: false, // Let it animate smoothly
                    config: { tension: 200, friction: 25 }
                };
            });

            setPredictionCount(prev => prev + 1);

            submitPrediction(match, pickSide);

            if (goneRef.current.size === matches.length) {
                setTimeout(() => {
                    refreshUser();
                    setShowCompletion(true);
                }, 500);
            }

            return; // CRITICAL: Exit immediately
        }

        // Only animate if NOT gone (double safety check)
        if (!goneRef.current.has(index)) {
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

    // Safety net removed in favor of CSS visibility toggle

    // Tracking for sponsor impressions on cards
    useEffect(() => {
        const topIndex = gone.size;
        if (topIndex < matches.length && sponsors.length > 0) {
            // Delay tracking until after animation completes to prevent re-renders mid-swipe
            const timer = setTimeout(() => {
                const currentSponsor = sponsors[topIndex % sponsors.length];
                const currentMatch = matches[topIndex];
                if (currentSponsor && currentMatch) {
                    trackSponsor(currentSponsor.id, 'impression', 'match_card', currentMatch.match_id);
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [gone.size, matches, sponsors, trackSponsor]);

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
        const featuredSponsor = sponsors[0] || null;

        return (
            <div className={styles.completionScreen}>
                <div className={styles.completionCard}>
                    <div className={styles.completionIcon}>🎉</div>
                    <h2 className={styles.completionTitle}>{t('completion_title') || 'Arena Cleared!'}</h2>
                    <p className={styles.completionStats}>{`You've mastered all ${predictionCount} matches in this league.`}</p>

                    {featuredSponsor && (
                        <div className={styles.completionPrize}>
                            <p className={styles.prizeLabel}>FEATURED PRIZE AVAILABLE</p>
                            <div className={styles.prizeBox}>
                                <img src={featuredSponsor.logo_url} alt={featuredSponsor.sponsor_name} className={styles.prizeSponsorLogo} />
                                <div className={styles.prizeDetails}>
                                    <h4>{featuredSponsor.sponsor_name} Giveaway</h4>
                                    <p>Enter the Draw Room now for a chance to win exclusive rewards!</p>
                                </div>
                            </div>
                        </div>
                    )}

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
            <div className={styles.deckHeader}>
                <div className={styles.headerTop}>
                    <p className={styles.cardsRemaining}>
                        {remainingCards} {t('matches_left') || 'Matches Left'}
                    </p>
                    <p className={styles.swipeHint}>
                        {t('swipe_hint') || 'Swipe to Predict'}
                    </p>
                </div>
                {/* PROGRESS BAR */}
                <div className={styles.progressTrack}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${(gone.size / matches.length) * 100}%` }}
                    />
                </div>
            </div>
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
                                visibility: isGone ? 'hidden' : 'visible', // Instant hide
                                transform: interpolate([springProps.rot, springProps.scale], (r, s) =>
                                    `rotateZ(${r}deg) scale(${s})`
                                ),
                                // ensure touch action is none to prevent scrolling while swiping
                                touchAction: 'none'
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
                                            {match?.home_logo && !match.home_logo.includes('.toLowerCase()') ? (
                                                <img
                                                    src={match.home_logo}
                                                    alt={match.home_team}
                                                    className={styles.teamLogo}
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        // Show fallback
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const fallback = parent.querySelector(`.${styles.placeholderLogo}`);
                                                            if (fallback) fallback.setAttribute('style', 'display: flex;');
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            {/* Always render fallback hidden, show on error */}
                                            <div
                                                className={styles.placeholderLogo}
                                                style={{ display: match?.home_logo ? 'none' : 'flex' }}
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
                                        className={`${styles.teamRegion} ${styles.awayRegion}`}
                                    >
                                        <div className={styles.logoWrapper}>
                                            {match?.away_logo && !match.away_logo.includes('.toLowerCase()') ? (
                                                <img
                                                    src={match.away_logo}
                                                    alt={match.away_team}
                                                    className={styles.teamLogo}
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        // Show fallback
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const fallback = parent.querySelector(`.${styles.placeholderLogo}`);
                                                            if (fallback) fallback.setAttribute('style', 'display: flex;');
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={styles.placeholderLogo}
                                                style={{ display: match?.away_logo ? 'none' : 'flex' }}
                                            >
                                                {match?.away_team?.charAt(0) || '?'}
                                            </div>
                                        </div>
                                        <p className={styles.teamName}>{match?.away_team}</p>
                                        <p className={styles.pickLabel}>PICK</p>
                                    </div>
                                </div>

                                {/* SPONSOR FOOTER */}
                                {sponsor && (
                                    <div
                                        className={styles.cardFooter}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            trackSponsor(sponsor.id, 'click', 'match_card', match.match_id);
                                            if (sponsor.website_url) {
                                                window.open(sponsor.website_url, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                    >
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