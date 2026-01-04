
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '../../context/AuthContext';

export default function SponsorshipPricingPage() {
    const { isAuthenticated, token } = useAuth();
    const router = useRouter();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleSubscribe = async (tier: string) => {
        if (!isAuthenticated) {
            // Encode the return URL so after login they come back here
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

            // Redirect to Stripe Checkout
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
            <header className={styles.header}>
                <h1 className={styles.title}>Become a Platform Sponsor</h1>
                <p className={styles.subtitle}>
                    Reach thousands of sports fans daily. Choose a placement that fits your brand.
                </p>
            </header>

            <div className={styles.grid}>
                {/* Starter Tier */}
                <div className={styles.card}>
                    <h2 className={styles.tierName}>Starter Display</h2>
                    <div className={styles.price}>C$99<span>/month</span></div>
                    <ul className={styles.features}>
                        <li><span className={styles.check}>✓</span> Homepage Logo (Rotating)</li>
                        <li><span className={styles.check}>✓</span> Announcements Page Ad</li>
                        <li><span className={styles.check}>✓</span> Footer Placement</li>
                        <li><span className={styles.check}>✓</span> Basic Analytics</li>
                    </ul>
                    <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => handleSubscribe('starter')}
                        disabled={!!loadingTier}
                    >
                        {loadingTier === 'starter' ? 'Processing...' : 'Select Starter'}
                    </button>
                </div>

                {/* Growth Tier */}
                <div className={`${styles.card} ${styles.featured}`}>
                    <div className={styles.popularBadge}>Most Popular</div>
                    <h2 className={styles.tierName}>Growth Display</h2>
                    <div className={styles.price}>C$299<span>/month</span></div>
                    <ul className={styles.features}>
                        <li><span className={styles.check}>✓</span> <strong>All Starter Features</strong></li>
                        <li><span className={styles.check}>✓</span> Login Page Logo Strategy</li>
                        <li><span className={styles.check}>✓</span> Room Selection Page Ad</li>
                        <li><span className={styles.check}>✓</span> 2 Monthly Custom Announcements</li>
                    </ul>
                    <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => handleSubscribe('growth')}
                        disabled={!!loadingTier}
                    >
                        {loadingTier === 'growth' ? 'Processing...' : 'Select Growth'}
                    </button>
                </div>

                {/* Premium Tier */}
                <div className={styles.card}>
                    <h2 className={styles.tierName}>Premium Display</h2>
                    <div className={styles.price}>C$599<span>/month</span></div>
                    <ul className={styles.features}>
                        <li><span className={styles.check}>✓</span> <strong>All Growth Features</strong></li>
                        <li><span className={styles.check}>✓</span> Hero Banner (Top of Homepage)</li>
                        <li><span className={styles.check}>✓</span> Dedicated Sponsor Page</li>
                        <li><span className={styles.check}>✓</span> Unlimited Announcements</li>
                    </ul>
                    <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => handleSubscribe('premium')}
                        disabled={!!loadingTier}
                    >
                        {loadingTier === 'premium' ? 'Processing...' : 'Select Premium'}
                    </button>
                </div>
            </div>
        </div>
    );
}
