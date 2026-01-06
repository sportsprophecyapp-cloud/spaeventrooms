'use client';

import React from 'react';
import styles from './SponsorMarquee.module.css';

const SponsorMarquee = () => {
    // UPDATED: Removed any mention of "Bet" to ensure app store compliance
    const sponsors = [
        { id: 1, name: 'ArenaX', logo_url: 'https://placehold.co/100x40/222/999?text=ArenaX' },
        { id: 2, name: 'ProphetGear', logo_url: 'https://placehold.co/100x40/222/999?text=ProphetGear' },
        { id: 3, name: 'FanCentral', logo_url: 'https://placehold.co/100x40/222/999?text=FanCentral' },
        { id: 4, name: 'SportsHub', logo_url: 'https://placehold.co/100x40/222/999?text=SportsHub' },
        { id: 5, name: 'Velocity', logo_url: 'https://placehold.co/100x40/222/999?text=Velocity' }
    ];

    return (
        <div className={styles.marqueeContainer}>
            <div className={styles.marquee}>
                {[...sponsors, ...sponsors].map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className={styles.sponsorItem}>
                        <img src={s.logo_url} alt={s.name} className={styles.logo} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SponsorMarquee;
