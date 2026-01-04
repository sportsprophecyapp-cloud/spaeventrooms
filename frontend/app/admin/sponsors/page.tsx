'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { useAuth } from '../../context/AuthContext';
import SponsorBanner from '../../components/SponsorBanner';
import SponsorCarousel from '../../components/SponsorCarousel';

interface SponsorSubscription {
    id: number;
    sponsor_name: string;
    tier: string;
    status: string;
    expires_at: string;
}

export default function SponsorAdminPage() {
    const { isAuthenticated } = useAuth();
    const [subscriptions, setSubscriptions] = useState<SponsorSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock functionality for demo since we don't have a full listing endpoint yet
    // In a real scenario, this would fetch from /api/sponsor-subscriptions
    useEffect(() => {
        // Simulating data fetch
        setTimeout(() => {
            setSubscriptions([
                { id: 1, sponsor_name: 'TechKick', tier: 'premium', status: 'active', expires_at: '2026-02-01' },
                { id: 2, sponsor_name: 'EnergyDrink Co', tier: 'growth', status: 'active', expires_at: '2026-02-15' },
                { id: 3, sponsor_name: 'BetSafe', tier: 'starter', status: 'active', expires_at: '2026-03-01' }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!isAuthenticated) {
        return <div className={styles.container}>Please login to view this page.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Sponsor Management</h1>
                <p className={styles.subtitle}>Track active campaigns and view ad previews.</p>
            </header>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Active Subscriptions</h2>
                    {loading ? (
                        <p>Loading subscriptions...</p>
                    ) : (
                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Sponsor</th>
                                        <th>Tier</th>
                                        <th>Status</th>
                                        <th>Expires</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map(sub => (
                                        <tr key={sub.id}>
                                            <td className={styles.sponsorName}>{sub.sponsor_name}</td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[sub.tier]}`}>{sub.tier}</span>
                                            </td>
                                            <td>
                                                <span className={styles.status}>● {sub.status}</span>
                                            </td>
                                            <td>{new Date(sub.expires_at).toLocaleDateString()}</td>
                                            <td>
                                                <button className={styles.manageBtn}>Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Live Ad Previews</h2>

                    <div className={styles.previewCard}>
                        <h3 className={styles.previewLabel}>Hero Banner (Premium)</h3>
                        <div className={styles.previewBox}>
                            {/* We pass 'home' as the page to preview homepage ads */}
                            <SponsorBanner page="home" />
                        </div>
                    </div>

                    <div className={styles.previewCard}>
                        <h3 className={styles.previewLabel}>Rotating Carousel (Starter+)</h3>
                        <div className={styles.previewBox}>
                            <SponsorCarousel page="home" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
