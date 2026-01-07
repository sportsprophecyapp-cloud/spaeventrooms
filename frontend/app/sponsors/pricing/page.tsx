'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useAuth } from '../../context/AuthContext';

export default function SponsorshipPricingPage() {
    const { isAuthenticated, token } = useAuth();
    const router = useRouter();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleSubscribe = async (tier: string) => {
        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=${encodeURIComponent('/sponsors/pricing')}`);
            return;
        }

        try {
            setLoadingTier(tier);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sponsor-subscriptions/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tier })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to start checkout');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error: No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong starting the checkout. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.navBar}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← RETURN TO ARENA
                </button>
            </div>

            <header className={styles.header}>
                <h1 className={styles.title}>Secure Your Placement</h1>
                <p className={styles.subtitle}>
                    Promote your brand to thousands of active sports fans. 
                    Choose your impact level below.
                </p>
            </header>

            <div className={styles.grid}>
                <div className={`${styles.card} glass`}>
                    <h2 className={styles.tierName}>Starter Display</h2>
                    <div className={styles.price}>$99<span>/mo</span></div>
                    <ul className={styles.features}>
                        <li><span className={styles.check}>✓</span> Homepage Logo</li>
                        <li><span className={styles.check}>✓</span> Footer Placement</li>
                        <li><span className={styles.check}>✓</span> Basic Analytics</li>
                    </ul>
                    <button
                        className={styles.buttonSecondary}
                        onClick={() => handleSubscribe('starter')}
                        disabled={!!loadingTier}
                    >
                        {loadingTier === 'starter' ? '...' : 'SELECT STARTER'}
                    </button>
                </div>

                <div className={`${styles.card} ${styles.featured} glass`}>
                    <div className={styles.popularBadge}>BEST VALUE</div>
                    <h2 className={styles.tierName}>Growth Display</h2>
                    <div className={styles.price}>$299<span>/mo</span></div>
                    <ul className={styles.features}>
                        <li><span className={styles.check}>✓</span> Everything in Starter</li>
                        <li><span className={styles.check}>✓</span> Room Selection Ad</li>
                        <li><span className={styles.check}>✓</span> 2 Custom Announcements</li>
                    </ul>
                    <button
                        className={styles.buttonPrimary}
                        onClick={() => handleSubscribe('growth')}
                        disabled={!!loadingTier}
                    >
                        {loadingTier === 'growth' ? '...' : 'SELECT GROWTH'}
                    </button>
                </div>

                <div className={`${styles.card} glass`}>
                    <h2 className={styles.tierName}>Premium Display</h2>
                    <div className={styles.price}>$599<span>/mo</span></div>
                    <ul className={styles.features}>
                        <li><span className={styles.check}>✓</span> Everything in Growth</li>
                        <li><span className={styles.check}>✓</span> Homepage Hero Banner</li>
                        <li><span className={styles.check}>✓</span> Unlimited Announcements</li>
                    </ul>
                    <button
                        className={styles.buttonSecondary}
                        onClick={() => handleSubscribe('premium')}
                        disabled={!!loadingTier}
                    >
                        {loadingTier === 'premium' ? '...' : 'SELECT PREMIUM'}
                    </button>
                </div>
            </div>
            
            <p className={styles.footerContact}>
                Need a custom partnership? <Link href="mailto:sportsprophecyapp@gmail.com">Contact our team</Link>
            </p>
        </div>
    );
}
