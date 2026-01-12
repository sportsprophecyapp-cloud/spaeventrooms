'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './SponsorDashboard.module.css';

interface SponsorStats {
    totalActiveSponsors: number;
    totalActiveSponsorships: number;
    overallPredictionCount: number;
}

const SponsorDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<SponsorStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/admin/sponsors/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setStats(await res.json());
            } catch (e) { console.error('Fetch sponsor stats failed'); }
        };

        if (token) fetchStats();
    }, [token]);

    return (
        <div className={`${styles.dashboard} glass`}>
            <div className={styles.statItem}>
                <span className={styles.statValue}>{stats?.totalActiveSponsors ?? '--'}</span>
                <span className={styles.statLabel}>Active Sponsors</span>
            </div>
            <div className={styles.statItem}>
                <span className={styles.statValue}>{stats?.totalActiveSponsorships ?? '--'}</span>
                <span className={styles.statLabel}>Active Sponsorships</span>
            </div>
            <div className={styles.statItem}>
                <span className={styles.statValue}>{stats?.overallPredictionCount ?? '--'}</span>
                <span className={styles.statLabel}>Total Predictions (All Time)</span>
            </div>
        </div>
    );
};

export default SponsorDashboard;
