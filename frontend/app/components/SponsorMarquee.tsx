'use client';

import React, { useEffect, useState } from 'react';
import styles from './SponsorMarquee.module.css';

interface Sponsor {
    id: number;
    name: string;
    logo_url: string;
    link_url: string;
}

const SponsorMarquee = () => {
    // Mock data for immediate visual verification (replace with API later if needed)
    const [partners, setPartners] = useState<Sponsor[]>([
        { id: 1, name: 'CloudBet', logo_url: 'https://placehold.co/100x40/222/999?text=CloudBet', link_url: '#' },
        { id: 2, name: 'SportData', logo_url: 'https://placehold.co/100x40/222/999?text=SportData', link_url: '#' },
        { id: 3, name: 'ArenaX', logo_url: 'https://placehold.co/100x40/222/999?text=ArenaX', link_url: '#' },
        { id: 4, name: 'GigaStream', logo_url: 'https://placehold.co/100x40/222/999?text=GigaStream', link_url: '#' },
        { id: 5, name: 'BetSync', logo_url: 'https://placehold.co/100x40/222/999?text=BetSync', link_url: '#' },
    ]);

    // Duplicate list for seamless loop
    const displayPartners = [...partners, ...partners, ...partners];

    return (
        <div className={styles.container}>
            <div className={styles.track}>
                {displayPartners.map((partner, index) => (
                    <a
                        key={`${partner.id}-${index}`}
                        href={partner.link_url}
                        className={styles.item}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src={partner.logo_url} alt={partner.name} className={styles.logo} />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SponsorMarquee;
