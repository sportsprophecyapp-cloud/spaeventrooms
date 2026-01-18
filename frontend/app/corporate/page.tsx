'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const CorporatePage = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>← BACK TO ARENA</Link>
                <h1 className={styles.title}>JUST ME MEDIA</h1>
                <p className={styles.subtitle}>The Power of Human Vision & Artificial Intelligence</p>
            </header>

            <main className={styles.main}>
                <section className={`${styles.card} glass`}>
                    <h2>ABOUT THE ORGANIZATION</h2>
                    <p>Just Me Media is more than a digital agency—it's a vision for the future of interactive entertainment. We believe sports are more than just games; they are shared moments of triumph and strategy.</p>
                    <p>At Just Me Media, we architect <strong>Events Arena</strong> to be the definitive "second-screen" companion, where your knowledge becomes your status, and your accuracy unlocks genuine rewards.</p>
                </section>

                <section className={`${styles.card} glass`}>
                    <h2>THE ORIGIN STORY</h2>
                    <p>The "Arena" wasn't programmed by a traditional team. It was orchestrated by a single human mind conducting a symphony of Artificial Intelligence. In a landmark development experiment in late 2025, our founder leveraged the specialized strengths of <strong>Claude, ChatGPT, and Gemini</strong> to build this ecosystem from the ground up.</p>
                    <p>This project proves that the future belongs to those who can harmonize human creativity with machine intelligence. Every line of code, every pixel, and every game logic carries the DNA of this AI-conducted journey.</p>
                </section>

                <section className={`${styles.card} glass`}>
                    <h2>CORPORATE INFO</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <strong>Organization:</strong>
                            <span>Just Me Media</span>
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Primary Product:</strong>
                            <span>Events Arena</span>
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Contact:</strong>
                            <a href="mailto:contact@sportsprophecyapp.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@sportsprophecyapp.com</a>
                        </div>
                        <div className={styles.infoItem}>
                            <strong>HQ:</strong>
                            <span>Global / Remote Architecture</span>
                        </div>
                    </div>
                </section>

                <section className={`${styles.card} glass`}>
                    <h2>LEGAL & COMPLIANCE</h2>
                    <p>Events Arena is a social platform for entertainment purposes only and does not facilitate or endorse real-money gambling of any kind.</p>
                    <div className={styles.legalLinks}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/delete-account">Account Deletion</Link>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2026 Just Me Media. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default CorporatePage;
