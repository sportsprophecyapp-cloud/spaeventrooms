'use client';

import React, { useEffect, useState } from 'react';
import styles from './SponsorMarquee.module.css';

interface Sponsor {
    id: number;
    sponsor_name: string;
    logo_url: string;
}

const SponsorMarquee = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/sponsor-applications/active`);
                if (res.ok) {
                    const data = await res.json();
                    setSponsors(data.sponsors || []);
                }
            } catch (err) {
                console.error('Error fetching marquee sponsors:', err);
            }
        };
        fetchSponsors();
    }, []);

    if (sponsors.length === 0) return null;

    // Duplicate for seamless loop
    const doubleSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

    return (
        <div className={styles.container}>
            <div className={styles.track}>
                {doubleSponsors.map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className={styles.item}>
                        {s.logo_url ? (
                            <img src={s.logo_url} alt={s.sponsor_name} className={styles.marqueeLogo} />
                        ) : (
                            <span className={styles.nameOnly}>{s.sponsor_name}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SponsorMarquee;
