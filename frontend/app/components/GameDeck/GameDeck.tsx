'use client';

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import styles from './GameDeck.module.css';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { useSponsor } from '@/app/context/SponsorContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ToastNotification from '../ToastNotification/ToastNotification';
import PredictionShareCard from '../PredictionShareCard/PredictionShareCard';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    home_logo?: string;
    away_logo?: string;
}

interface Card {
    id: string;
    match: Match;
    type: 'winner' | 'btts' | 'total';
    title: string;
    leftLabel: string;
    rightLabel: string;
}

interface GameDeckProps {
    leagueId: string;
    roomId?: string;
}

const GameDeck: React.FC<GameDeckProps> = ({ leagueId, roomId = 'soccer' }) => {
    const { t } = useLanguage();
    const { token, refreshUser, user } = useAuth();
    const { sponsors, trackSponsor } = useSponsor();
    const router = useRouter();
    const [gone, setGone] = useState<Set<number>>(() => new Set());

    const [cards, setCards] = useState<Card[]>([]);
    const [totalScheduled, setTotalScheduled] = useState<number>(0);
    const [showCompletion, setShowCompletion] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [predictionCount, setPredictionCount] = useState(0);
    const [dragX, setDragX] = useState(0);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [lastMatch, setLastMatch] = useState<Match | null>(null);
    const [lastPick, setLastPick] = useState<string | null>(null);
    const [showShareCard, setShowShareCard] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLastPrediction = async () => {
            if (showCompletion && !lastMatch && user?.id) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
                try {
                    const res = await fetch(`${apiUrl}/api/auth/profile/${user.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.user?.history && data.user.history.length > 0) {
                            const latest = data.user.history[0];
                            setLastMatch({
                                match_id: latest.id,
                                home_team: latest.home_team,
                                away_team: latest.away_team,
                                home_logo: latest.home_logo,
                                away_logo: latest.away_logo,
                                start_time: latest.start_time,
                                status: latest.status
                            });
                            setLastPick(latest.pick);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching last prediction:', err);
                }
            }
        };

        fetchLastPrediction();
    }, [showCompletion, lastMatch, user?.id, token]);

    const searchParams = useSearchParams();
    const targetMatchId = searchParams.get('matchId');

    useEffect(() => {
        const fetchMatches = async () => {
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/rooms/${roomId}/matches?league=${leagueId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    let fetchedMatches: Match[] = [];
                    let fetchedTotal = 0;
                    
                    const rawData = Array.isArray(data) ? data : (data.matches || []);
                    const totalFromApi = Array.isArray(data) ? data.length : (data.total_scheduled || 0);

                    // DEDUPLICATION LOGIC (Prevents 2X cards if API returns same match twice)
                    const uniqueMatches: Match[] = [];
                    const seenKeys = new Set();

                    rawData.forEach((m: any) => {
                        // AGGRESSIVE DEDUPLICATION
                        // Normalize names: remove common suffixes and noise
                        const normalize = (name: string) => name
                            .toLowerCase()
                            .replace(/fc|cf|united|real|city|town|wanderers|rovers|athletic|club|olympique|saint-germain|atlético|borussia|bayern/g, '')
                            .replace(/[^a-z]/g, '')
                            .substring(0, 4);

                        const homeKey = normalize(m.home_team || m.homeTeam || '');
                        const awayKey = normalize(m.away_team || m.awayTeam || '');
                        const timeKey = (m.start_time || m.commence_time || '').substring(0, 16); // Match down to the minute
                        const key = `${homeKey}-${awayKey}-${timeKey}`;

                        if (!seenKeys.has(key)) {
                            seenKeys.add(key);
                            uniqueMatches.push({
                                match_id: m.match_id || m.id,
                                home_team: m.home_team || m.homeTeam,
                                away_team: m.away_team || m.awayTeam,
                                start_time: m.start_time || m.commence_time,
                                status: m.status,
                                home_logo: m.home_logo || m.homeLogo,
                                away_logo: m.away_logo || m.awayLogo
                            });
                        }
                    });

                    fetchedMatches = uniqueMatches;
                    fetchedTotal = uniqueMatches.length;

                    // GENERATE MULTI-CARDS
                    const generatedCards: Card[] = [];
                    fetchedMatches.forEach(m => {
                        // 1. Winner Card
                        // MATCH WINNER CARD ONLY
                        generatedCards.push({
                            id: `${m.match_id}_winner`,
                            match: m,
                            type: 'winner',
                            title: roomId === 'nhl' ? '🏒 WHO WINS?' : '⚽ WHO WINS?',
                            leftLabel: m.home_team,
                            rightLabel: m.away_team
                        });
                    });

                    // REORDER IF MATCH ID PROVIDED
                    if (targetMatchId) {
                        const matchCards = generatedCards.filter(c => c.match.match_id === targetMatchId);
                        const otherCards = generatedCards.filter(c => c.match.match_id !== targetMatchId);
                        // Move target cards to the end of the array (top of the deck)
                        setCards([...otherCards, ...matchCards]);
                    } else {
                        setCards(generatedCards);
                    }

                    setTotalScheduled(fetchedTotal);
                    
                    if (generatedCards.length === 0 && fetchedTotal > 0) {
                        setShowCompletion(true);
                        setPredictionCount(fetchedTotal);
                    }
                }
            } catch (err) {
                console.error("Error fetching matches:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatches();
    }, [leagueId, token, targetMatchId]);

    useEffect(() => {
        if (showCompletion && countdown > 0) {
            // Trigger celebration confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        } else if (showCompletion && countdown === 0) {
            if (roomId === 'nhl') {
                router.push('/');
            } else {
                window.location.href = `/rooms/${roomId}`;
            }
        }
    }, [showCompletion, countdown, router, roomId]);

    const [props, api] = useSprings(cards.length, i => ({
        x: 0,
        y: 0,
        scale: 1,
        rot: 0,
        opacity: 1,
        config: { tension: 500, friction: 40 }
    }));

    const submitPrediction = async (card: Card, pickSide: string, attemptNum = 1) => {
        const MAX_RETRIES = 2;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            
            // Logic for pickName based on type
            let pickName = '';
            if (card.type === 'winner') {
                pickName = pickSide === 'home' ? card.match.home_team : card.match.away_team;
            } else {
                pickName = pickSide === 'home' ? card.leftLabel : card.rightLabel;
            }

            const response = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions/match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    matchId: card.match.match_id,
                    pick: pickName,
                    type: card.type
                })
            });

            if (response.ok) {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 30, 10]);
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
                return submitPrediction(card, pickSide, attemptNum + 1);
            } else {
                setMessage({ text: 'Failed to save prediction', type: 'error' });
                return false;
            }
        } catch (err) {
            if (attemptNum < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return submitPrediction(card, pickSide, attemptNum + 1);
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

            const card = cards[index];
            const pickSide = mx > 0 ? 'home' : 'away';

            // Mark as gone IMMEDIATELY
            goneRef.current.add(index);
            setGone(prev => new Set(prev).add(index)); 
            
            if (card.type === 'winner') {
                setLastMatch(card.match);
                setLastPick(pickSide === 'home' ? card.match.home_team : card.match.away_team);
            }

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
                    immediate: false, 
                    config: { tension: 200, friction: 25 }
                };
            });

            setPredictionCount(prev => prev + 1);

            submitPrediction(card, pickSide);

            if (goneRef.current.size === cards.length) {
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
        if (topIndex < cards.length && sponsors.length > 0) {
            const timer = setTimeout(() => {
                const currentMatch = cards[topIndex].match;
                const sponsor = sponsors[topIndex % sponsors.length];
                console.log('TRACKING IMPRESSION:', sponsor.id, 'match:', currentMatch.match_id);
                trackSponsor(sponsor.id, 'impression', 'match_card', currentMatch.match_id);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [gone.size, cards, sponsors, trackSponsor]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Loading Arena Matches...</p>
                    <p className={styles.sleepNotice}>
                        ⚡ Note: If this is the first visit in a while, the prediction engine may take ~20 seconds to wake up.
                    </p>
                </div>
            </div>
        );
    }

    if (cards.length === 0 && totalScheduled === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyContent}>
                    {roomId === 'nhl' ? (
                        <>
                            <img src="/assets/arenas/nhl-offseason.png" alt="Off-season Trophy" style={{ width: '200px', height: '200px', objectFit: 'contain', animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 10px 20px rgba(0,210,255,0.5))' }} />
                            <h3 className={styles.emptyText} style={{ color: '#00d2ff', marginTop: '1rem' }}>
                                {t('nhl_season_complete') || 'Season Complete. See you back for the 2026/2027 season soon!'}
                            </h3>
                        </>
                    ) : (
                        <>
                            <div className={styles.emptyIcon}>⚽</div>
                            <p className={styles.emptyText}>{t('no_matches_available') || "No active matches right now."}</p>
                        </>
                    )}
                    <button className={styles.refreshBtn} onClick={() => window.location.reload()}>
                        🔄 {t('scan_live_games') || 'Scan for Live Games'}
                    </button>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>
                        {t('next_update_1hr') || 'Next automatic update in 1 hour'}
                    </p>
                </div>
            </div>
        );
    }

    if (showCompletion) {
        const featuredSponsor = sponsors[0] || null;

        return (
            <>
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
                                        <h4>{featuredSponsor.sponsor_name} {t('giveaway') || 'Giveaway'}</h4>
                                        <p>{t('enter_draw_hint') || 'Enter the Draw Room now for a chance to win exclusive rewards!'}</p>
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
                                className={styles.completionShareBtn}
                                onClick={() => {
                                    if (lastMatch) {
                                        setShowShareCard(true);
                                    } else {
                                        setMessage({ text: 'Accessing records...', type: 'info' });
                                    }
                                }}
                            >
                                📤 SHARE YOUR PICKS
                            </button>
                            <button
                                onClick={() => {
                                    if (roomId === 'nhl') {
                                        router.push('/');
                                    } else {
                                        window.location.href = `/rooms/${roomId}`;
                                    }
                                }}
                                className={styles.completionButton}
                            >
                                {t('back_to_leagues')}
                            </button>
                        </div>
                        <p className={styles.completionCountdown}>{t('auto_returning') || 'Auto-returning in'} {countdown}s</p>
                    </div>
                </div>

                {showShareCard && lastMatch && user && (
                    <PredictionShareCard
                        homeTeam={lastMatch.home_team}
                        awayTeam={lastMatch.away_team}
                        homeLogo={lastMatch.home_logo || ''}
                        awayLogo={lastMatch.away_logo || ''}
                        pick={lastPick || ''}
                        username={user.username || 'Fan'}
                        referralCode={(user as any).referralCode || user.id?.toString() || ''}
                        matchId={lastMatch.match_id}
                        onClose={() => setShowShareCard(false)}
                    />
                )}
            </>
        );
    }

    const remainingCardsCount = cards.length - gone.size;

    return (
        <div className={styles.deckWrapper}>
            <div className={styles.deckHeader}>
                <div className={styles.headerTop}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p className={styles.cardsRemaining}>
                            {remainingCardsCount} {t('matches_left') || 'Matches Left'}
                        </p>
                        {user?.streak && user.streak > 0 && (
                            <div className={styles.streakBadge}>
                                <span className={styles.streakIcon}>🔥</span>
                                <span className={styles.streakText}>{user.streak} DAY STREAK</span>
                            </div>
                        )}
                    </div>
                    <p className={styles.swipeHint}>
                        {t('swipe_hint') || 'Swipe to Predict'}
                    </p>
                </div>
                {/* PROGRESS BAR */}
                <div className={styles.progressTrack}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${(gone.size / cards.length) * 100}%` }}
                    />
                </div>
            </div>
            <div className={styles.deckContainer} onMouseLeave={() => setDragX(0)}>
                {props.map((springProps, i) => {
                    const isGone = gone.has(i);
                    const card = cards[i];
                    const match = card.match;
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
                            key={card.id}
                            style={{
                                x: springProps.x,
                                y: springProps.y,
                                opacity: springProps.opacity,
                                zIndex: cards.length - i,
                                pointerEvents: isGone ? 'none' : 'auto',
                                visibility: isGone ? 'hidden' : 'visible', // Instant hide
                                transform: interpolate([springProps.rot, springProps.scale], (r, s) =>
                                    `rotateZ(${r}deg) scale(${s})`
                                ),
                                // ensure touch action is none to prevent scrolling while swiping
                                touchAction: 'none'
                            }}
                        >
                            <div className={`${styles.hybridCard} ${roomId === 'nhl' ? styles.nhlBackground : ''}`}>
                                {/* HEADER */}
                                <div className={styles.cardHeader}>
                                    {match.status === 'live' ? (
                                        <span className={styles.liveBadge}>● LIVE NOW</span>
                                    ) : (
                                        <>
                                            <p className={styles.predictionType}>{card.title}</p>
                                            <p className={styles.matchTime}>{timeDisplay}</p>
                                        </>
                                    )}
                                </div>

                                {/* Teams Container with Tap Regions */}
                                <div className={styles.teamsContainer}>

                                    {/* HOME TEAM REGION */}
                                    <div
                                        className={`${styles.teamRegion} ${styles.homeRegion}`}
                                        style={{
                                            background: dragX > 20 
                                                ? `linear-gradient(90deg, transparent 0%, rgba(46, 213, 115, ${Math.min(0.3, dragX / 500)}) 100%)`
                                                : undefined,
                                            boxShadow: dragX > 50
                                                ? `inset -20px 0 40px rgba(46, 213, 115, ${Math.min(0.2, (dragX - 50) / 1000)})`
                                                : undefined
                                        }}
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
                                                style={{ display: match?.home_logo ? 'none' : 'flex' }}
                                            >
                                                {match?.home_team?.charAt(0) || '?'}
                                            </div>
                                        </div>
                                        <p className={styles.teamName}>{match?.home_team}</p>
                                    </div>

                                    {/* VS */}
                                    <div className={styles.vsContainer}>
                                        <span className={styles.vs}>VS</span>
                                    </div>

                                    {/* AWAY TEAM REGION */}
                                    <div
                                        className={`${styles.teamRegion} ${styles.awayRegion}`}
                                        style={{
                                            background: dragX < -20 
                                                ? `linear-gradient(90deg, rgba(255, 71, 87, ${Math.min(0.3, -dragX / 500)}) 0%, transparent 100%)`
                                                : undefined,
                                            boxShadow: dragX < -50
                                                ? `inset 20px 0 40px rgba(255, 71, 87, ${Math.min(0.2, (-dragX - 50) / 1000)})`
                                                : undefined
                                        }}
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
                                    </div>
                                </div>

                                {/* SPONSOR FOOTER */}
                                {sponsor ? (
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
                                ) : (
                                    <div className={styles.cardFooter}>
                                        <span className={styles.houseSponsor}>Events Arena Premium</span>
                                    </div>
                                )}

                                {/* Swipe Indicator - shows during drag */}
                                <div style={{ opacity: Math.max(0, (dragX - 50) / 100) }} className={styles.swipeIndicatorLeft}>
                                    ✓ {card.leftLabel}
                                </div>
                                <div style={{ opacity: Math.max(0, (-dragX - 50) / 100) }} className={styles.swipeIndicatorRight}>
                                    {card.rightLabel} ✓
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