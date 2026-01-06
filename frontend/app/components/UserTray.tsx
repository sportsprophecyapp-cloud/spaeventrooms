'use client';

import React, { useEffect, useState } from 'react';
import styles from './UserTray.module.css';
import { useAuth } from '../context/AuthContext';

interface UserStats {
    total_points: number;
    current_level: number;
    points_to_next_level: number;
}

interface Badge {
    id: number;
    name: string;
    icon: string;
    description: string;
    earned_at: string;
}

const UserTray: React.FC = () => {
    const { isAuthenticated, token } = useAuth(); // Use token from context
    const [stats, setStats] = useState<UserStats | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Context token is already correct
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setBadges(data.badges);
                }
            } catch (err) {
                console.error('Error fetching gamification stats:', err);
            }
        };

        fetchStats();
    }, [isAuthenticated, token]);

    if (!isAuthenticated || !stats) return null;

    const levelProgress = stats.points_to_next_level > 0
        ? (stats.total_points % 500) / 5 
        : 100;

    return (
        <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
            <div className={styles.minimal} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.levelBadge}>
                    <span className={styles.levelNum}>Lvl {stats.current_level}</span>
                </div>
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${levelProgress}%` }}></div>
                </div>
                <div className={styles.points}>
                    <span className={styles.pointsNum}>{stats.total_points}</span>
                    <span className={styles.pointsLabel}>PTS</span>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.drawer}>
                    <h4 className={styles.drawerTitle}>Achievements</h4>
                    <div className={styles.badgeGrid}>
                        {badges.length === 0 ? (
                            <p className={styles.emptyMsg}>Predict to earn badges!</p>
                        ) : (
                            badges.map(badge => (
                                <div key={badge.id} className={styles.badgeItem} title={badge.description}>
                                    <span className={styles.badgeIcon}>{badge.icon}</span>
                                    <span className={styles.badgeName}>{badge.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTray;
