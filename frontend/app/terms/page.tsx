'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../legal.module.css';

export default function TermsOfServicePage() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>← Back</button>
                <h1>Terms of Service</h1>
                <p className={styles.date}>Effective Date: May 2026</p>
            </header>

            <main className={styles.main}>
                <section className={styles.section}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using Events Arena (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. Eligibility</h2>
                    <p>You must be at least 18 years of age to use this Platform. By using Events Arena, you represent and warrant that you meet this requirement.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. Non-Gambling & Entertainment Policy</h2>
                    <ul>
                        <li><strong>Social Engagement:</strong> Events Arena is a social engagement platform for entertainment and skill-based forecasting only.</li>
                        <li><strong>No Wagering:</strong> No real money can be wagered, and the Platform does not accept deposits or bets.</li>
                        <li><strong>Prizes:</strong> All prizes (digital vouchers, gift cards, etc.) are provided by third-party sponsors. These have no cash value and cannot be exchanged for currency.</li>
                        <li><strong>No Purchase Necessary:</strong> Participation in prize draws requires no purchase. Free entries are available upon request.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Referral Program & Rewards</h2>
                    <p><strong>Weighted Drawings:</strong> Entries for prize draws are granted for valid, unique new user sign-ups via the referral system.</p>
                    <p><strong>Fraud Prevention:</strong> Creating multiple accounts to self-refer or using bots to generate referrals is strictly prohibited. Just Me Media reserves the right to void entries and terminate accounts suspected of fraud.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. Intellectual Property</h2>
                    <p>All content, branding, the prediction interface, visual mechanics, and software are the exclusive property of Just Me Media. You may not copy, modify, distribute, or create derivative works without express written permission.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. User Conduct</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Platform for any illegal purpose</li>
                        <li>Harass, threaten, or abuse other users</li>
                        <li>Use bots, scripts, or automated tools</li>
                        <li>Create multiple accounts for unfair advantages</li>
                        <li>Impersonate staff or other users</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>7. Virtual Currency (Tickets)</h2>
                    <p>Tickets are virtual rewards used within the Platform to enter prize draws. They have no real-world monetary value and cannot be exchanged for cash.</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Live Support</h2>
                    <p>Events Arena provides live support via WhatsApp under the name <strong>"Events Arena Live Support"</strong>. By initiating a chat, you agree to WhatsApp's terms of service. Just Me Media will never ask for your password or financial information via chat.</p>
                </section>

                <section className={styles.section}>
                    <h2>9. Disclaimer of Warranties</h2>
                    <p>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED OR ERROR-FREE.</p>
                </section>

                <section className={styles.section}>
                    <h2>10. Limitation of Liability</h2>
                    <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, JUST ME MEDIA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF THE PLATFORM.</p>
                </section>

                <section className={styles.section}>
                    <h2>11. Changes to Terms</h2>
                    <p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
                </section>

                <section className={styles.section}>
                    <h2>12. Contact Us</h2>
                    <p>If you have any questions, please contact us at <a href="mailto:contact@sportsprophecyapp.com" className={styles.emailLink}>contact@sportsprophecyapp.com</a>.</p>
                </section>

                <div className={styles.acknowledgment}>
                    🛡️ By using Events Arena, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </div>
            </main>
        </div>
    );
}
