'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { APP_VERSION } from './version';
import OnboardingModal from '@/app/components/OnboardingModal';
import SponsorMarquee from '@/app/components/SponsorMarquee';

const HomePage = () => {
  const rooms = [
    {
      id: 'soccer',
      name: 'Pro Soccer',
      description: 'Predict match winners, scores, and player performances across top leagues.',
      icon: '⚽',
      color: '#4bb8ff',
      active: true
    },
    {
      id: 'nfl',
      name: 'NFL Hub',
      description: 'Touchdown predictions and game scripts. Coming for the playoffs!',
      icon: '🏈',
      color: '#ff4b4b',
      active: false
    },
    {
      id: 'f1',
      name: 'F1 Paddock',
      description: 'Podium picks and fastest lap prophecies. Season starts soon.',
      icon: '🏎️',
      color: '#ffd700',
      active: false
    }
  ];

  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.icon}>🌌</span>
          <h1>Sports Prophecy</h1>
        </div>
        <p className={styles.tagline}>The Ultimate Prediction Arena</p>
      </header>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Select Your Room</h2>
        <div className={styles.roomGrid}>
          {rooms.map(room => (
            <div key={room.id} className={`${styles.roomCard} ${!room.active ? styles.inactive : ''}`}>
              <div className={styles.roomIcon} style={{ borderColor: room.color }}>
                {room.icon}
              </div>
              <h3>{room.name}</h3>
              <p>{room.description}</p>
              {room.active ? (
                <Link href={`/rooms/${room.id}`} className={styles.enterBtn}>
                  Enter Room
                </Link>
              ) : (
                <span className={styles.comingSoon}>Coming Soon</span>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <SponsorMarquee />
        <p style={{ marginTop: '1rem' }}>&copy; 2026 Sports Prophecy Platform. All rights reserved. <span style={{ opacity: 0.5, fontSize: '0.8em', marginLeft: '10px' }}>v{APP_VERSION}</span></p>
      </footer>

      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  );
};

export default HomePage;
