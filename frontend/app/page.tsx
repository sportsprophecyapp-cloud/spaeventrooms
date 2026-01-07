'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';
import { APP_VERSION } from './version';
import OnboardingModal from '@/app/components/OnboardingModal';
import SponsorMarquee from '@/app/components/SponsorMarquee';
import UserTray from '@/app/components/UserTray';

const HomePage = () => {
  const rooms = [
    {
      id: 'soccer',
      name: 'Soccer Arena',
      description: 'Forecast match winners and events from the world\'s top leagues.',
      icon: '⚽',
      color: 'var(--accent)',
      active: true
    },
    {
      id: 'nfl',
      name: 'NFL Hub',
      description: 'Pro predictions and game scripts. Coming for the playoffs!',
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

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
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

  const handleEnterRoom = (roomId: string) => {
    if (isAuthenticated) {
      router.push(`/rooms/${roomId}`);
    } else {
      router.push(`/auth/login?redirect=/rooms/${roomId}`);
    }
  };

  return (
    <div className={styles.container}>
      {isAuthenticated && <UserTray />}
      
      <header className={styles.header}>
        {/* BRAND BRIDGE MESSAGE */}
        <p className={styles.welcomeBridge}>Sports Prophecy welcomes you to the</p>
        
        <div className={styles.logo}>
          <span className={styles.icon}>🎯</span>
          <h1>EVENTS <span style={{color: 'var(--accent)'}}>ARENA</span></h1>
        </div>
        <p className={styles.tagline}>The Ultimate Prediction Experience</p>
        
        <div className={styles.quickNav}>
          <Link href="/leaderboard" className={styles.navLink}>🏆 Standings</Link>
          {isAuthenticated ? (
            <Link href={`/profile/${user?.id}`} className={styles.navLink}>👤 Profile</Link>
          ) : (
            <Link href="/auth/register" className={styles.navLink}>⚡ Join Free</Link>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Select Your Room</h2>
        <div className={styles.roomGrid}>
          {rooms.map(room => (
            <div key={room.id} className={`${styles.roomCard} glass ${!room.active ? styles.inactive : ''}`}>
              <div className={styles.roomIcon} style={{ borderColor: room.color }}>
                {room.icon}
              </div>
              <h3>{room.name}</h3>
              <p>{room.description}</p>
              {room.active ? (
                <button
                  onClick={() => handleEnterRoom(room.id)}
                  className={styles.enterBtn}
                >
                  ENTER ARENA
                </button>
              ) : (
                <span className={styles.comingSoon}>COMING SOON</span>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <SponsorMarquee />
        <div className={styles.footerInfo}>
          <p>&copy; 2026 Events Arena | Powered by Sports Prophecy</p>
          <p className={styles.disclaimer}>
            Events Arena is a social platform for entertainment purposes only. 
            No real money can be won or wagered on this site.
          </p>
          <span className={styles.version}>v{APP_VERSION}</span>
        </div>
      </footer>

      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  );
};

export default HomePage;
