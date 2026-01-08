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
                    <p>Just Me Media is a cutting-edge digital infrastructure and media organization dedicated to redefining fan engagement. We are the architects and developers behind <strong>Events Arena</strong> (formerly Sports Prophecy).</p>
                    <p>Our mission is to create frictionless, high-energy platforms that bridge the gap between live events, streaming creators, and global sports communities.</p>
                </section>

                <section className={`${styles.card} glass`}>
                    <h2>THE ORIGIN STORY</h2>
                    <p>Events Arena was born from a radical experiment in AI orchestration. Built in the quiet hours of November 2025, our founder pioneered a "Triple-AI" methodology—conducting the intelligence of <strong>Claude (Anthropic)</strong>, <strong>ChatGPT (OpenAI)</strong>, and <strong>Gemini (Google)</strong> as a unified development team.</p>
                    <p>What started as an exploration into AI memory and context handoffs evolved into a world-class sports tech platform. We didn't just build an app; we built a system that amplifies human creativity through orchestrated machine intelligence.</p>
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
                            <span>Events Arena - Sports Prophecy</span>
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Contact:</strong>
                            <span>partnerships@sportsprophecyapp.com</span>
                        </div>
                        <div className={styles.infoItem}>
                            <strong>HQ:</strong>
                            <span>Global / Remote Architecture</span>
                        </div>
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
