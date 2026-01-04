'use client';

import React, { useEffect, useState } from 'react';
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/rooms/${roomId}/sponsors`);
                const data = await res.json();
                setSponsors(data);
            } catch (err) {
                console.error('Error fetching sponsors:', err);
            }
        };

        fetchSponsors();
    }, [roomId, apiUrl]);

    if (sponsors.length === 0) return null;

    return (
        <div className={styles.container}>
            <p className={styles.label}>POWERED BY</p>
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
