'use client';

import React from 'react';
import styles from './terms.module.css';

const TermsOfService = () => {
    return (
        <div className={styles.container}>
            <main className={`${styles.card} glass`}>
                <h1 className={styles.title}>TERMS OF SERVICE</h1>
                <p className={styles.lastUpdated}>Effective Date: January 2026</p>

                <section className={styles.section}>
                    <h2>1. ACCEPTANCE OF TERMS</h2>
                    <p>By accessing or using Events Arena ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. ELIGIBILITY</h2>
                    <p>You must be at least 18 years of age to use this Platform. By using Events Arena, you represent and warrant that you meet this requirement.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. NON-GAMBLING POLICY</h2>
                    <p>Events Arena is a social engagement platform for entertainment purposes only. No real money can be wagered or won. All prizes are digital vouchers provided by third-party sponsors and have no cash value.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. USER CONDUCT</h2>
                    <p>Users agree not to use the Platform for any unlawful purpose. We reserve the right to terminate accounts that engage in fraudulent activity, abuse of the platform, or harassment of other users.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. INTELLECTUAL PROPERTY</h2>
                    <p>All content, branding, and software are the property of Just Me Media. Users are granted a limited, non-exclusive license to use the Platform for personal, non-commercial use.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. CONTACT US</h2>
                    <p>If you have any questions, please contact us at <a href="mailto:contact@sportsprophecyapp.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@sportsprophecyapp.com</a>.</p>
                </section>
            </main>
        </div>
    );
};

export default TermsOfService;
