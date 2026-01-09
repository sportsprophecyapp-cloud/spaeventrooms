'use client';

import React from 'react';
import styles from './MatchCard.module.css';
import { useLanguage } from '@/app/context/LanguageContext';

interface Match {
    id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    league_logo: string;
}

// CORRECTED: The missing interface is now defined.
interface MatchCardProps {
    match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const { t } = useLanguage();
    const matchDate = new Date(match.start_time);
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };

    const formattedTime = matchDate.toLocaleTimeString('en-US', timeOptions);
    const formattedDate = matchDate.toLocaleDateString('en-US', dateOptions);

    return (
        <div className={`${styles.card} glass`}>
            <div className={styles.header}>
                <img src={match.league_logo} alt="League Logo" className={styles.leagueLogo} />
                <div className={styles.dateTime}>
                    <span>{formattedDate}</span>
                    <span>{formattedTime}</span>
                </div>
            </div>

            <div className={styles.teams}>
                <div className={styles.team}>
                    <div className={styles.teamLogoPlaceholder} />
                    <span className={styles.teamName}>{match.home_team}</span>
                </div>
                <span className={styles.vs}>VS</span>
                <div className={styles.team}>
                    <div className={styles.teamLogoPlaceholder} />
                    <span className={styles.teamName}>{match.away_team}</span>
                </div>
            </div>

            <div className={styles.footer}>
                <p>{t('predict_winner_prompt')}</p>
            </div>
        </div>
    );
};

export default MatchCard;
