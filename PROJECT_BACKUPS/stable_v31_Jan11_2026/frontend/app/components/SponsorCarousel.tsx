'use client';

import React, { useEffect, useState } from 'react';
import styles from './SponsorCarousel.module.css';

interface Sponsor {
    id: number;
    name: string;
    logo_url: string;
    link_url: string;
}

interface SponsorCarouselProps {
    page: string;
}

const SponsorCarousel: React.FC<SponsorCarouselProps> = ({ page }) => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/sponsor-subscriptions/placements/${page}`);
                if (res.ok) {
                    const data = await res.json();
                    setSponsors(data);
                }
            } catch (err) {
                console.error('Error fetching sponsor carousel:', err);
            }
        };

        fetchSponsors();
    }, [page]);

    useEffect(() => {
        if (sponsors.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sponsors.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, [sponsors.length]);

    if (sponsors.length === 0) return null;

    const currentSponsor = sponsors[currentIndex];

    return (
        <div className={styles.carousel}>
            <span className={styles.label}>Powered by</span>
            <a
                href={currentSponsor.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.logoLink}
            >
                <img
                    src={currentSponsor.logo_url}
                    alt={currentSponsor.name}
                    className={styles.logo}
                    key={currentSponsor.id}
                />
            </a>
        </div>
    );
};

export default SponsorCarousel;
