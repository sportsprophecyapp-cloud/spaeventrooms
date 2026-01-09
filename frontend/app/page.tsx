'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './page.module.css';
// ... other imports

const HomePage = () => {
  const { t, language, setLanguage } = useLanguage(); // NEW: Get language state and setter
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  // ... other state

  // ... rooms array and other logic

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.languageSwitcher}> {/* NEW */}
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
        {/* ... */}
      </footer>

      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  );
};

export default HomePage;
