'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const SponsorTermsPage = () => {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <button onClick={() => router.back()} className={styles.backBtn}>← RETURN TO APPLICATION</button>
            
            <main className={`${styles.card} glass`}>
                <h1 className={styles.title}>SPONSORSHIP TERMS & CONDITIONS</h1>
                <p className={styles.lastUpdated}>Version 1.1 | January 2026</p>

                <section className={styles.section}>
                    <h2>1. THE DIGITAL-FIRST PROTOCOL</h2>
                    <p>To ensure global scalability and eliminate shipping liability, all prizes provided by Sponsors must be delivered exclusively as <strong>Digital Redemption Codes</strong> or <strong>Vouchers</strong>. Sponsors agree to handle all physical fulfillment via their own official infrastructure.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. PRIZE ESCROW & VERIFICATION</h2>
                    <p>The Sponsor agrees to deliver the unique digital redemption codes to Events Arena Administration for verification at least <strong>48 hours</strong> prior to the scheduled draw announcement. Draws will not be triggered until codes are verified in escrow.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. THE 10K USER MILESTONE</h2>
                    <p>All Founding Partner and "Early Adopter" rates (including $0 fee tiers) are valid until the platform reaches <strong>10,000 active Supporters</strong>. Upon reaching this milestone, Events Arena reserves the right to re-index sponsorship rates to standard market value.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. BRAND REPRESENTATION</h2>
                    <p>The Sponsor certifies they are authorized to represent the brand and accepts full responsibility for the validity of provided codes and the subsequent fulfillment of goods/services to the winner.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. TERMINATION</h2>
                    <p>Failure to comply with the 48-hour escrow protocol or the provision of invalid codes will result in immediate termination of the sponsorship and a permanent ban from the platform.</p>
                </section>
            </main>
        </div>
    );
};

export default SponsorTermsPage;
