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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/sponsor-subscriptions/placements/${roomId}`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
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

    // ROTATION LOGIC: 10 Seconds
    useEffect(() => {
        if (sponsors.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sponsors.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [sponsors]);

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

    const currentSponsor = sponsors[currentIndex];

    return (
        <div className={`${styles.container} glass`}>
            <p className={styles.label}>OFFICIAL ROOM SPONSOR</p>
            <div className={styles.carouselFrame}>
                <a
                    key={currentSponsor.id}
                    href={currentSponsor.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.sponsorLink} animate-fade-in`}
                    title={currentSponsor.name}
                >
                    {currentSponsor.logo_url ? (
                        <img src={currentSponsor.logo_url} alt={currentSponsor.name} className={styles.logo} />
                    ) : (
                        <span className={styles.nameOnly}>{currentSponsor.name}</span>
                    )}
                </a>
            </div>
            
            {/* INDICATOR DOTS */}
            {sponsors.length > 1 && (
                <div className={styles.dots}>
                    {sponsors.map((_, idx) => (
                        <div key={idx} className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SponsorWidget;
