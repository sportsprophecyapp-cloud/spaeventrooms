'use client';

import React, { useEffect, useState } from 'react';
import styles from './SponsorBanner.module.css';

interface Sponsor {
    id: number;
    name: string;
    logo_url: string;
    link_url: string;
    tier: string;
}

interface SponsorBannerProps {
    page: string;
}

const SponsorBanner: React.FC<SponsorBannerProps> = ({ page }) => {
    const [sponsor, setSponsor] = useState<Sponsor | null>(null);

    useEffect(() => {
        const fetchSponsor = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/sponsor-subscriptions/placements/${page}`);
                if (res.ok) {
                    const data = await res.json();
                    // Get the first premium/exclusive sponsor for hero placement
                    const heroSponsor = data.find((s: Sponsor) => s.tier === 'premium' || s.tier === 'exclusive');
                    setSponsor(heroSponsor || null);
                }
            } catch (err) {
                console.error('Error fetching sponsor banner:', err);
            }
        };

        fetchSponsor();
    }, [page]);

    if (!sponsor) return null;

    return (
        <a
            href={sponsor.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.banner}
        >
            <div className={styles.content}>
                <span className={styles.label}>Sponsored by</span>
                <img src={sponsor.logo_url} alt={sponsor.name} className={styles.logo} />
            </div>
        </a>
    );
};

export default SponsorBanner;
