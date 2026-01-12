'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './AnalyticsDashboard.module.css';

interface SiteStats {
    totalUsers: number;
    totalPredictions: number;
}

const AnalyticsDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<SiteStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setStats(await res.json());
            } catch (e) { console.error('Fetch stats failed'); }
        };

        if (token) fetchStats();
    }, [token]);

    return (
        <div className={`${styles.dashboard} glass`}>
            <div className={styles.statItem}>
                <span className={styles.statValue}>{stats?.totalUsers ?? '--'}</span>
                <span className={styles.statLabel}>Total Supporters</span>
            </div>
            <div className={styles.statItem}>
                <span className={styles.statValue}>{stats?.totalPredictions ?? '--'}</span>
                <span className={styles.statLabel}>Total Predictions</span>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
