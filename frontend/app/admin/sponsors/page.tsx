'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';

interface Subscription {
    id: number;
    tier: string;
    status: string;
    subscriptionStatus: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    startedAt: string;
    expiresAt: string;
    timeRemaining: string;
}

interface Sponsor {
    id: number;
    name: string;
    logoUrl: string | null;
    linkUrl: string | null;
    roomId: string | null;
    isActive: boolean;
    subscription: Subscription | null;
}

export default function AdminSponsorsPage() {
    const { isAuthenticated, token } = useAuth();
    const [sponsors, setSponsor] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
    const [error, setError] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchSponsors = async () => {
            if (!isAuthenticated || !token) return;

            try {
                setLoading(true);
                const endpoint =
                    filter === 'all'
                        ? `/api/sponsor-subscriptions/admin/sponsors`
                        : `/api/sponsor-subscriptions/admin/sponsors/filter?status=${filter}`;

                const response = await fetch(`${apiUrl}${endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch sponsors');
                }

                const data = await response.json();
                setSponsor(data.data || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                console.error('Error fetching sponsors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsors();
    }, [filter, apiUrl, isAuthenticated, token]);

    const handleToggleActive = async (sponsorId: number, currentStatus: boolean) => {
        if (!token) return;
        try {
            const response = await fetch(`${apiUrl}/api/sponsor-subscriptions/admin/sponsors/${sponsorId}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update sponsor');
            }

            // Refetch sponsors
            const updatedResponse = await fetch(`${apiUrl}/api/sponsor-subscriptions/admin/sponsors`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await updatedResponse.json();
            setSponsor(data.data || []);
        } catch (err) {
            console.error('Error toggling sponsor:', err);
            alert('Failed to update sponsor');
        }
    };

    const getTierClass = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'premium': return styles.premiumBadge;
            case 'growth': return styles.growthBadge;
            default: return styles.starterBadge;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return styles.activeStatus;
            case 'Pending': return styles.pendingStatus;
            case 'Expired': return styles.expiredStatus;
            default: return styles.pendingStatus;
        }
    };

    if (!isAuthenticated) {
        return <div className={styles.container}>Please login to view this page.</div>;
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Sponsors Dashboard</h1>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Sponsors Dashboard</h1>
                <p className={styles.subtitle}>Manage active sponsors and subscriptions</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className={styles.errorAlert}>
                    <p>{error}</p>
                </div>
            )}

            {/* Filter Buttons */}
            <div className={styles.filters}>
                {(['all', 'active', 'pending', 'expired'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`${styles.filterBtn} ${filter === f ? styles.activeFilterBtn : ''}`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Sponsors Table */}
            {sponsors.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No sponsors found</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Sponsor</th>
                                <th>Tier</th>
                                <th>Status</th>
                                <th>Expires</th>
                                <th>Room</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sponsors.map((sponsor) => (
                                <tr key={sponsor.id}>
                                    <td>
                                        <div className={styles.sponsorCell}>
                                            {sponsor.logoUrl && (
                                                <img
                                                    src={sponsor.logoUrl}
                                                    alt={sponsor.name}
                                                    className={styles.sponsorLogo}
                                                />
                                            )}
                                            <div>
                                                <p className={styles.sponsorName}>{sponsor.name}</p>
                                                {sponsor.linkUrl && (
                                                    <a
                                                        href={sponsor.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.sponsorLink}
                                                    >
                                                        Visit →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {sponsor.subscription ? (
                                            <span className={`${styles.badge} ${getTierClass(sponsor.subscription.tier)}`}>
                                                {sponsor.subscription.tier}
                                            </span>
                                        ) : (
                                            <span className={styles.subtitle}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {sponsor.subscription ? (
                                            <span className={getStatusClass(sponsor.subscription.subscriptionStatus)}>
                                                {sponsor.subscription.subscriptionStatus}
                                            </span>
                                        ) : (
                                            <span className={styles.subtitle}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {sponsor.subscription?.expiresAt ? (
                                            <div>
                                                <p className={styles.dateText}>{format(new Date(sponsor.subscription.expiresAt), 'MMM dd, yyyy')}</p>
                                                <p className={styles.dateSubtext}>
                                                    {formatDistanceToNow(new Date(sponsor.subscription.expiresAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className={styles.subtitle}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={styles.dateText}>{sponsor.roomId || 'Platform-Wide'}</span>
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={sponsor.isActive}
                                            onChange={() => handleToggleActive(sponsor.id, sponsor.isActive)}
                                            className={styles.checkbox}
                                        />
                                    </td>
                                    <td>
                                        <button className={styles.viewBtn}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary Stats */}
            {sponsors.length > 0 && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Total Sponsors</p>
                        <p className={styles.statValue}>{sponsors.length}</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Active Subscriptions</p>
                        <p className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {sponsors.filter(s => s.subscription?.subscriptionStatus === 'Active').length}
                        </p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Revenue (Monthly)</p>
                        <p className={`${styles.statValue} ${styles.statValuePurple}`}>
                            ${sponsors
                                .filter(s => s.subscription?.subscriptionStatus === 'Active')
                                .reduce((sum, s) => {
                                    const tier = s.subscription?.tier?.toLowerCase();
                                    if (tier === 'premium') return sum + 599;
                                    if (tier === 'growth') return sum + 299;
                                    if (tier === 'starter') return sum + 99;
                                    return sum;
                                }, 0)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
