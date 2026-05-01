'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../legal.module.css';

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>← Back</button>
                <h1>Privacy Policy</h1>
                <p className={styles.date}>Effective Date: May 2026</p>
            </header>

            <main className={styles.main}>
                <section className={styles.section}>
                    <h2>1. Data We Collect</h2>
                    <ul>
                        <li><strong>Registration:</strong> Name and email address.</li>
                        <li><strong>Activity:</strong> Your prediction history, win streaks, and leaderboard activity.</li>
                        <li><strong>Referrals:</strong> We track unique referral links to credit your account for reward drawings.</li>
                        <li><strong>Device Data:</strong> Device identifiers and app usage data for analytics purposes.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>2. How We Use Your Data</h2>
                    <ul>
                        <li><strong>Experience:</strong> To manage your account, display leaderboards, and award tickets and prizes.</li>
                        <li><strong>Referrals:</strong> To manage the weighted drawing system and verify successful referrals.</li>
                        <li><strong>Security:</strong> To maintain the safety and integrity of the community through moderation.</li>
                        <li><strong>Analytics:</strong> To analyze usage patterns and improve platform performance.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>3. Data Sharing & Support</h2>
                    <p><strong>B2B Insights:</strong> We provide anonymized and aggregated behavioral trends to sponsors (e.g., "60% of fans predicted an NHL Home win"). This data contains <strong>no personally identifiable information</strong>.</p>
                    <p><strong>WhatsApp Support:</strong> When using our live WhatsApp support ("Events Arena Live Support"), your phone number and message history are processed by WhatsApp to help us resolve your inquiries.</p>
                    <p><strong>Social Sharing:</strong> Generating a "Golden Ticket" share card creates a graphic that you may choose to share on third-party social platforms. We do not control how these platforms use shared content.</p>
                    <p>We do <strong>not</strong> sell your personal data to any third party.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. Data Security</h2>
                    <p>All data transmitted between your device and our servers is encrypted in transit. Data is not shared with third parties except for the purposes stated above.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. Data Deletion & Retention</h2>
                    <p>You may request deletion of your account and personal data at any time by contacting us. We retain data only as necessary to provide services or comply with legal obligations.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. Children's Privacy</h2>
                    <p>Events Arena is intended for users 18 years and older. We do not knowingly collect personal data from minors. If we learn that a minor has provided information, we will promptly delete the account and all associated data.</p>
                </section>

                <section className={styles.section}>
                    <h2>7. Your Rights</h2>
                    <p>You may request to view, modify, or delete your data at any time. To opt-out of marketing or delete your account, contact us at the email below.</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Contact Us</h2>
                    <p>For privacy concerns, email <a href="mailto:contact@sportsprophecyapp.com" className={styles.emailLink}>contact@sportsprophecyapp.com</a>.</p>
                </section>

                <div className={styles.acknowledgment}>
                    🔒 Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.
                </div>
            </main>
        </div>
    );
}
