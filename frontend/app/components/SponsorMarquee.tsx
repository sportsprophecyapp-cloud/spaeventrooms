'use client';

import React from 'react';
import styles from './SponsorMarquee.module.css';
import { useSponsor } from '@/app/context/SponsorContext';

interface Sponsor {
    id: number;
    sponsor_name: string;
    logo_url: string;
}

const SponsorMarquee = () => {
    const { sponsors, loading, trackSponsor } = useSponsor();

    React.useEffect(() => {
        if (!loading && sponsors.length > 0) {
            sponsors.forEach(s => {
                trackSponsor(s.id, 'impression', 'global_marquee');
            });
        }
    }, [loading, sponsors, trackSponsor]);

    if (loading || sponsors.length === 0) return null;

    // Duplicate for seamless loop (just 2x is usually enough if CSS handles it well, but keeping logic effectively similar but cleaner)
    const doubleSponsors = [...sponsors, ...sponsors];

    return (
        <div className={styles.container}>
            <div className={styles.track}>
                {doubleSponsors.map((s, idx) => (
                    <div
                        key={`${s.id}-${idx}`}
                        className={styles.item}
                        onClick={() => trackSponsor(s.id, 'click', 'global_marquee')}
                    >
                        {s.logo_url ? (
                            <img
                                src={s.logo_url}
                                alt={s.sponsor_name}
                                className={styles.marqueeLogo}
                                loading="lazy"
                            />
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
