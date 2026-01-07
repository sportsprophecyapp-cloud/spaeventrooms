'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './SponsorWidget.module.css';

interface Sponsor {
    id: number;
    name: string;
    logo_url: string;
    link_url: string;
}

interface SponsorWidgetProps {
    roomId: string;
}

const SponsorWidget = ({ roomId }: SponsorWidgetProps) => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/sponsor-subscriptions/placements/${roomId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSponsors(data);
                }
            } catch (err) {
                console.error('Error fetching sponsors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsors();
    }, [roomId, apiUrl]);

    if (loading) return <div className={styles.loading}>Accessing Sponsor...</div>;

    if (sponsors.length === 0) {
        return (
            <Link href={`/sponsors/pricing?ref=${roomId}`} className={`${styles.placeholderContainer} glass`}>
                <div className={styles.placeholderLabel}>SPONSOR THIS ARENA</div>
                <p className={styles.placeholderText}>Reach 5,000+ active sports fans daily.</p>
                <div className={styles.placeholderBtn}>SECURE SPOT</div>
            </Link>
        );
    }

    return (
        <div className={`${styles.container} glass`}>
            <p className={styles.label}>OFFICIAL ROOM SPONSOR</p>
            <div className={styles.logoGrid}>
                {sponsors.map(sponsor => (
                    <a
                        key={sponsor.id}
                        href={sponsor.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sponsorLink}
                        title={sponsor.name}
                    >
                        {sponsor.logo_url ? (
                            <img src={sponsor.logo_url} alt={sponsor.name} className={styles.logo} />
                        ) : (
                            <span className={styles.nameOnly}>{sponsor.name}</span>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SponsorWidget;
