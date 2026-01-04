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
}

interface MatchCardProps {
    match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    return (
        <div className={styles.card}>
            <div className={styles.teams}>
                <span className={styles.team}>{match.home_team}</span>
                <span className={styles.vs}>VS</span>
                <span className={styles.team}>{match.away_team}</span>
            </div>
            <div className={styles.info}>
                <span className={styles.status}>{match.status}</span>
                {match.status !== 'scheduled' && (
                    <span className={styles.score}>
                        {match.score_home} - {match.score_away}
                    </span>
                )}
                <span className={styles.time}>
                    {new Date(match.start_time).toLocaleString()}
                </span>
            </div>
        </div>
    );
};

export default MatchCard;
