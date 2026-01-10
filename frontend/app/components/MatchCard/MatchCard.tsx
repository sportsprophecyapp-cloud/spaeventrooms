'use client';

import React from 'react';
import styles from './MatchCard.module.css';
import { useLanguage } from '@/app/context/LanguageContext';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    score_home?: number;
    score_away?: number;
    league?: string;
    home_logo?: string;
    away_logo?: string;
    isPulsing?: boolean;
}

interface MatchCardProps {
    match: Match;
    onPredict?: (match: Match) => void;
    hasPredicted?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPredict, hasPredicted }) => {
    const { t } = useLanguage();
    // FAIR PLAY LOGIC: Only allow prediction if game is 'scheduled' AND hasn't started yet.
    const isPastKickoff = new Date(match.start_time) <= new Date();
    const canPredict = match.status === 'scheduled' && !isPastKickoff && !hasPredicted;

    return (
        <div className={`${styles.card} ${match.isPulsing ? styles.pulsar : ''}`}>
            <div className={styles.teamsSection}>
                <div className={styles.teams}>
                    <div className={styles.teamCol}>
                        {match.home_logo && <img src={match.home_logo} className={styles.teamLogo} alt="" />}
                        <span className={styles.team}>{match.home_team}</span>
                    </div>
                    <span className={styles.vs}>VS</span>
                    <div className={styles.teamCol}>
                        {match.away_logo && <img src={match.away_logo} className={styles.teamLogo} alt="" />}
                        <span className={styles.team}>{match.away_team}</span>
                    </div>
                </div>
                <div className={styles.info}>
                    <span className={`${styles.status} ${match.status === 'live' ? styles.live : ''}`}>
                        {(match.status || 'Scheduled').toUpperCase()}
                    </span>
                    <span className={styles.time}>
                        {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className={styles.actions}>
                {hasPredicted ? (
                    <div className={styles.lockedState}>
                        <span className={styles.lockIcon}>✅</span>
                        <span className={styles.lockText}>CALL SUBMITTED</span>
                    </div>
                ) : canPredict ? (
                    <div className={styles.predictWrapper}>
                        {onPredict ? (
                            <button
                                onClick={() => {
                                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                                    onPredict(match);
                                }}
                                className={styles.predictBtn}
                            >
                                Predict
                            </button>
                        ) : (
                            <div className={styles.swipeLabels}>
                                <span>← Away</span>
                                <span>Home →</span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* LOCK STATE: Game started or finished */
                    <div className={styles.scoreDisplay}>
                        <span className={styles.scoreNum}>{match.score_home}</span>
                        <span className={styles.scoreDivider}>-</span>
                        <span className={styles.scoreNum}>{match.score_away}</span>
                    </div>
                )}
            </div>

            <div className={styles.cardFooter}>
                <span className={styles.prizeTag}>🎫 EARN 1 TICKET</span>
            </div>
        </div>
    );
};

export default MatchCard;
