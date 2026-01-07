'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './UserTray.module.css';
import { useAuth } from '../context/AuthContext';

interface UserStats {
    total_points: number;
    current_level: number;
    progress_xp: number;
    next_level_xp: number;
}

const UserTray: React.FC = () => {
    const { isAuthenticated, token, user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/gamification/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
    }, [isAuthenticated, token]);

    if (!isAuthenticated || !stats) return null;

    // Use backend-provided progress math
    const levelProgress = (stats.progress_xp / stats.next_level_xp) * 100;

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
                    <span className={styles.pointsLabel}>XP</span>
                </div>
                <span className={styles.arrow}>{isExpanded ? '▴' : '▾'}</span>
            </div>

            {isExpanded && (
                <div className={`${styles.drawer} glass`}>
                    <h4 className={styles.drawerTitle}>COMMAND CENTER</h4>
                    <div className={styles.menuLinks}>
                        <Link href={`/profile/${user?.id}`} className={styles.menuLink}>
                            👤 VIEW PROFILE
                        </Link>
                        
                        {isAdmin && (
                            <Link href="/admin/users" className={`${styles.menuLink} ${styles.adminLink}`}>
                                🛡️ ADMIN PANEL
                            </Link>
                        )}
                        
                        <Link href="/sponsors/pricing" className={styles.menuLink}>
                            💎 BECOME A SPONSOR
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTray;
