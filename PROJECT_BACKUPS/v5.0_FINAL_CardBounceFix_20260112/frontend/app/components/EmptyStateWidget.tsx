'use client';

import React from 'react';
import styles from './EmptyStateWidget.module.css';

interface EmptyStateWidgetProps {
    onScrollToMatches?: () => void;
    onViewLeaderboard?: () => void;
}

const EmptyStateWidget: React.FC<EmptyStateWidgetProps> = ({ onScrollToMatches, onViewLeaderboard }) => {
    return (
        <div className={`${styles.container} animate-fade`}>
            <div className={styles.icon}>⏳</div>
            <h2 className={styles.title}>The Arena is Quiet</h2>
            <p className={styles.description}>
                There are no live prediction markets active right now.
                Check upcoming matches or see who is leading the ranks.
            </p>

            <div className={styles.actions}>
                <button onClick={onScrollToMatches} className={styles.primaryBtn}>
                    See Upcoming Matches
                </button>
                {onViewLeaderboard && (
                    <button onClick={onViewLeaderboard} className={styles.secondaryBtn}>
                        Check Leaderboard
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyStateWidget;
