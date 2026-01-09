'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './page.module.css';
import { APP_VERSION } from './version';
import OnboardingModal from '@/app/components/OnboardingModal'; // RESTORED
import SponsorMarquee from '@/app/components/SponsorMarquee';

const HomePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // ... (rest of the component is correct)

  return (
    <div className={styles.container}>
        <header className={styles.header}>
            <div className={styles.languageSwitcher}>
                <button onClick={() => setLanguage('en')} className={language === 'en' ? styles.activeLang : ''}>EN</button>
                <button onClick={() => setLanguage('id')} className={language === 'id' ? styles.activeLang : ''}>ID</button>
                <button onClick={() => setLanguage('th')} className={language === 'th' ? styles.activeLang : ''}>TH</button>
            </div>
            <p className={styles.welcomeBridge}>{t('welcome_bridge')}</p>
            <div className={styles.logo}>
              <h1>EVENTS <span style={{color: 'var(--accent)'}}>ARENA</span></h1>
            </div>
            <p className={styles.tagline}>{t('tagline')}</p>
            <div className={styles.quickNav}>
              <Link href="/leaderboard" className={styles.navLink}>🏆 {t('standings')}</Link>
              {isAuthenticated ? (
                <Link href={`/profile/${user?.id}`} className={styles.navLink}>👤 Profile</Link>
              ) : (
                <Link href="/auth/register" className={styles.navLink}>⚡ {t('join_free')}</Link>
              )}
            </div>
        </header>
        <main className={styles.main}>
        {/* ... */}
        </main>
        <footer className={styles.footer}>
            <SponsorMarquee />
            <div className={styles.footerInfo}>
                <div className={styles.footerLinks}>
                  <Link href="/corporate">Corporate</Link>
                  <Link href="/privacy">Privacy Policy</Link>
                  <Link href="/delete-account">Delete Account</Link>
                </div>
                <p>&copy; 2026 Events Arena | Powered by Sports Prophecy</p>
                <p className={styles.disclaimer}>
                    Events Arena is a social platform for entertainment purposes only. 
                    No real money can be won or wagered on this site.
                </p>
                <span className={styles.version}>v{APP_VERSION}</span>
            </div>
        </footer>
        <OnboardingModal isOpen={showOnboarding} onClose={() => {setShowOnboarding(false); localStorage.setItem('hasSeenOnboarding', 'true');}} />
    </div>
  );
};

export default HomePage;
