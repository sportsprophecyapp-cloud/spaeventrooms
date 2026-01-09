'use client';

import React from 'react';
import styles from './MatchCard.module.css';
import { useLanguage } from '@/app/context/LanguageContext'; // NEW

// ... (interfaces)

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const { t } = useLanguage(); // NEW
    // ... (date/time formatting)

    return (
        <div className={`${styles.card} glass`}>
            {/* ... (header) */}

            <div className={styles.teams}>
                {/* ... (team logos and names) */}
            </div>

            <div className={styles.footer}>
                <p>{t('predict_winner_prompt')}</p> {/* TRANSLATED */}
            </div>
        </div>
    );
};

export default MatchCard;
