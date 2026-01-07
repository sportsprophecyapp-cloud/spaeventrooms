'use client';

import React from 'react';
import styles from './MatchCard.module.css';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    score_home?: number;
    score_away?: number;
    league?: string;
    isPulsing?: boolean;
}

interface MatchCardProps {
    match: Match;
    onPredict: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPredict }) => {
    // Prediction is allowed if the match is not finished
    const canPredict = match.status === 'scheduled' || match.status === 'live';

    return (
        <div className={`${styles.card} ${match.isPulsing ? styles.pulsar : ''}`}>
            <div className={styles.teamsSection}>
                <div className={styles.teams}>
                    <span className={styles.team}>{match.home_team}</span>
                    <span className={styles.vs}>VS</span>
                    <span className={styles.team}>{match.away_team}</span>
                </div>
                <div className={styles.info}>
                    <span className={`${styles.status} ${match.status === 'live' ? styles.live : ''}`}>
                        {match.status.toUpperCase()}
                    </span>
                    <span className={styles.time}>
                        {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className={styles.actions}>
                {canPredict ? (
                    <div className={styles.predictWrapper}>
                        <button
                            onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                                onPredict(match);
                            }}
                            className={styles.predictBtn}
                        >
                            Predict
                        </button>
                        <span className={styles.btnHint}>Make your call</span>
                    </div>
                ) : (
                    <div className={styles.scoreDisplay}>
                        <span className={styles.scoreNum}>{match.score_home}</span>
                        <span className={styles.scoreDivider}>-</span>
                        <span className={styles.scoreNum}>{match.score_away}</span>
                    </div>
                )}
            </div>

            {/* SPONSOR INTEGRATION LABEL */}
            <div className={styles.cardFooter}>
                <span className={styles.prizeTag}>🎫 EARN 1 TICKET</span>
            </div>
        </div>
    );
};


export default MatchCard;
