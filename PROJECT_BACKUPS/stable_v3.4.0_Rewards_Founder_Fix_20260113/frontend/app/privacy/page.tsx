'use client';

import React from 'react';
import styles from './privacy.module.css';

const PrivacyPolicy = () => {
    return (
        <div className={styles.container}>
            <main className={`${styles.card} glass`}>
                <h1 className={styles.title}>PRIVACY POLICY</h1>
                <p className={styles.lastUpdated}>Effective Date: January 2026</p>

                <section className={styles.section}>
                    <h2>1. INTRODUCTION</h2>
                    <p>Events Arena ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. INFORMATION WE COLLECT</h2>
                    <p>We collect basic information required to provide our service, including: Email address, Username, and performance data (XP, Levels, and Prize Tickets).</p>
                </section>

                <section className={styles.section}>
                    <h2>3. NON-GAMBLING POLICY</h2>
                    <p>Events Arena is a social engagement platform for entertainment purposes only. No real money can be wagered or won on this platform. All prizes are provided as digital vouchers by third-party sponsors.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. DATA SAFETY & DELETION</h2>
                    <p>You have the right to access, correct, or delete your personal information. To delete your account and all associated data, please visit our <a href="/delete-account" style={{ color: 'var(--accent)' }}>Account Deletion Page</a>.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. CONTACT US</h2>
                    <p>If you have any questions about this policy, please contact us at <a href="mailto:contact@sportsprophecyapp.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@sportsprophecyapp.com</a>.</p>
                </section>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
