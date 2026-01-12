'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const pricingTiers = [
    {
        id: 'founding',
        name: 'Founding Partner',
        price: '0',
        features: ['Priority Ticker Placement', 'Exclusive "Founding Brand" Badge', 'Custom Campaign Sandbox', 'Monthly Prize Escrow Deal'],
        cta: 'APPLY NOW',
        color: '#ffd700', // Gold
        special: 'EARLY ACCESS - FIRST 5 ONLY'
    },
    {
        id: 'starter',
        name: 'The Ticker',
        price: '99',
        features: ['Logo in Global Marquee', 'Rotates on All Pages', 'Live Match Integration', 'Supporter Insights'],
        cta: 'SECURE SPOT',
        color: 'var(--neutral)'
    },
    {
        id: 'growth',
        name: 'Prize Host',
        price: '299',
        features: ['Dedicated Prize Draw Card', 'Users CLICK to Enter', 'Logo in Global Marquee', 'Priority Admin Support'],
        cta: 'HOST A DRAW',
        color: 'var(--accent)'
    },
    {
        id: 'premium',
        name: 'Arena Headliner',
        price: '599',
        features: ['Official Room Sponsor', 'Header Takeover Branding', '#1 Spot in Prize Grid', 'Custom "Powered By" Badge'],
        cta: 'GO HEADLINE',
        color: '#764ba2'
    }
];

const SponsorsPricingPage = () => {
    const router = useRouter();

    const handleAction = (tierId: string) => {
        // Route all tiers to application form with pre-selection
        router.push(`/sponsors/apply?tier=${tierId}`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>PARTNER WITH THE ARENA</h1>
                <p className={styles.subtitle}>Connect your brand with the most engaged sports fans in the world.</p>
            </header>

            <div className={styles.grid}>
                {pricingTiers.map((tier) => (
                    <div key={tier.id} className={`${styles.card} glass ${tier.id === 'founding' ? styles.founderCard : ''}`}>
                        {tier.special && <div className={styles.specialBadge}>{tier.special}</div>}
                        <h2 className={styles.tierName}>{tier.name}</h2>
                        <div className={styles.priceRow}>
                            <span className={styles.currency}>$</span>
                            <span className={styles.amount}>{tier.price}</span>
                            <span className={styles.period}>/mo</span>
                        </div>
                        <ul className={styles.features}>
                            {tier.features.map(f => <li key={f}>✅ {f}</li>)}
                        </ul>
                        <button
                            className={styles.ctaBtn}
                            style={{ background: tier.color, color: tier.id === 'founding' ? 'black' : 'white' }}
                            onClick={() => handleAction(tier.id)}
                        >
                            {tier.cta}
                        </button>
                    </div>
                ))}
            </div>

            <footer className={styles.footer}>
                <p>
                    Need a custom partnership?
                    <Link href="mailto:partnerships@sportsprophecyapp.com" className={styles.contactLink}> Contact our Sales Team</Link>
                </p>
            </footer>
        </div>
    );
};

export default SponsorsPricingPage;
