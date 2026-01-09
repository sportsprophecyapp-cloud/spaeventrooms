'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './page.module.css';
import { APP_VERSION } from './version';
import OnboardingModal from '@/app/components/OnboardingModal';
import SponsorMarquee from '@/app/components/SponsorMarquee';

const HomePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // ... (rooms array and logic)

  return (
    <div className={styles.container}>
        <header className={styles.header}>
            {/* ... (language switcher and logo) ... */}
        </header>

        <main className={styles.main}>
            <h2 className={styles.sectionTitle}>{t('select_arena')}</h2>
            {/* ... (roomGrid) ... */}

            <section className={styles.economyPreview}>
                <div className={`${styles.ecoCard} glass`}>
                    <span className={styles.ecoIcon}>🎫</span>
                    <h2>WIN PRIZES</h2>
                    <p>Every correct call awards a <strong>Prize Draw Ticket</strong>.</p>
                </div>
                <div className={`${styles.ecoCard} glass`}>
                    <span className={styles.ecoIcon}>📈</span>
                    <h2>LEVEL UP</h2>
                    <p>Climb the standings and earn elite status in the community.</p>
                </div>
                <div className={`${styles.ecoCard} glass`}>
                    <span className={styles.ecoIcon}>🤝</span>
                    <h2>RECRUIT</h2>
                    <p>Invite friends and both get <strong>+50 Bonus Tokens</strong>.</p>
                </div>
            </section>
        </main>

        <footer className={styles.footer}>
            {/* ... */}
        </footer>

        <OnboardingModal isOpen={showOnboarding} onClose={() => {setShowOnboarding(false); localStorage.setItem('hasSeenOnboarding', 'true');}} />
    </div>
  );
};

export default HomePage;
