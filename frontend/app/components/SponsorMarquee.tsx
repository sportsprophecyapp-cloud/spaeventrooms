'use client';

import React from 'react';
import styles from './SponsorMarquee.module.css';

const sponsors = [
    { id: 1, name: 'ArenaX', logo_url: '' },
    { id: 2, name: 'ProphetGear', logo_url: '' },
    { id: 3, name: 'FanCentral', logo_url: '' },
    { id: 4, name: 'SportsHub', logo_url: '' },
    { id: 5, name: 'Velocity', logo_url: '' }
];

const SponsorMarquee = () => {
    // Duplicate for seamless loop
    const doubleSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

    return (
        <div className={styles.container}>
            <div className={styles.track}>
                {doubleSponsors.map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className={styles.item}>
                        <span className={styles.nameOnly}>{s.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SponsorMarquee;
