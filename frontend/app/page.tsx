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
import RecentWinners from '@/app/components/RecentWinners';
import DailyLoginButton from '@/app/components/DailyLoginButton';
import LootShowcase from '@/app/components/LootShowcase/LootShowcase';

const HomePage = () => {
    const { t, language, setLanguage } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    const rooms = [
        { id: 'soccer', name: 'Soccer Arena', description: 'Forecast match winners and events from the world\'s top leagues.', icon: '/assets/arenas/soccer-arena.jpg', color: 'var(--accent)', active: true },
        { id: 'nfl', name: 'NFL Hub', description: 'Pro predictions and game scripts. Coming for the playoffs!', icon: '/assets/arenas/nfl-hub.jpg', color: '#ff4b4b', active: false },
        { id: 'f1', name: 'F1 Paddock', description: 'Podium picks and fastest lap prophecies. Season starts soon.', icon: '/assets/arenas/f1-paddock.png', color: '#ffd700', active: false }
    ];

    React.useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) setShowOnboarding(true);
    }, []);

    const handleOnboardingClose = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
    };

    const handleEnterRoom = (roomId: string) => {
        if (isAuthenticated) router.push(`/rooms/${roomId}`);
        else router.push(`/auth/login?redirect=/rooms/${roomId}`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <p className={styles.welcomeBridge}>{t('welcome_bridge')}</p>
                <div className={styles.logo}>
                    <h1>EVENTS <span style={{ color: 'var(--accent)' }}>ARENA</span></h1>
                </div>
                <SponsorMarquee />
                <Link href="/draw" className={styles.taglineLink}>
                    <p className={styles.tagline}>{t('tagline')}</p>
                </Link>
            </header>

            {isAuthenticated && (
                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    <DailyLoginButton />
                    <LootShowcase />
                </div>
            )}

            <main className={styles.main}>
                <div className={styles.roomGrid}>
                    {rooms.map(room => (
                        <div key={room.id} className={`${styles.roomCard} glass ${!room.active ? styles.inactive : ''}`} style={{ borderColor: room.active ? room.color : undefined }}>
                            <div className={styles.roomIcon} style={{ borderColor: room.color }}>
                                <img src={room.icon} alt={room.name} className={styles.arenaImg} />
                            </div>
                            <h3>{room.name}</h3>
                            <p>{room.description}</p>
                            {room.active ? (
                                <button onClick={() => handleEnterRoom(room.id)} className={styles.enterBtn}>{t('enter_arena')}</button>
                            ) : (
                                <span className={styles.comingSoon}>COMING SOON</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Recent Winners Showcase */}
                <RecentWinners />

                {/* How It Works Section */}
                <section style={{ marginTop: '4rem', textAlign: 'center', width: '100%', maxWidth: '1000px' }}>
                    <div className={styles.sectionTitle}>{t('how_it_works_title')}</div>
                    <div className={styles.economyPreview} style={{ marginTop: '2.5rem' }}>
                        <div className={`${styles.ecoCard} glass`}>
                            <div className={styles.ecoIconBg} style={{ background: 'rgba(0, 112, 243, 0.1)' }}>🎯</div>
                            <h4>{t('how_step_1')}</h4>
                            <p>{t('how_step_1_desc')}</p>
                        </div>
                        <div className={`${styles.ecoCard} glass`}>
                            <div className={styles.ecoIconBg} style={{ background: 'rgba(255, 75, 75, 0.1)' }}>⚡</div>
                            <h4>{t('how_step_2')}</h4>
                            <p>{t('how_step_2_desc')}</p>
                        </div>
                        <div className={`${styles.ecoCard} glass`}>
                            <div className={styles.ecoIconBg} style={{ background: 'rgba(255, 215, 0, 0.1)' }}>🎁</div>
                            <h4>{t('how_step_3')}</h4>
                            <p>{t('how_step_3_desc')}</p>
                        </div>
                    </div>
                </section>

                <section className={styles.economyPreview}>
                    <div className={`${styles.ecoCard} glass`}>
                        <span className={styles.ecoIcon}>🎫</span>
                        <h4>{t('tickets_earned')}</h4>
                        <p>{t('draw_room_desc')}</p>
                        <Link href="/draw" className={styles.actionLink} style={{ marginTop: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                            {t('go_to_draw_room')} →
                        </Link>
                    </div>
                </section>

                {/* Founder's Letter / Origin Story Section */}
                <section className={styles.letterContainer}>
                    <div className={styles.letterBody}>
                        <div className={styles.letterHeader}>
                            <span className={styles.companyName}>JUST ME MEDIA</span>
                            <span className={styles.letterDate}>EST. 2025</span>
                        </div>
                        <div className={styles.letterText}>
                            "I built <strong>Events Arena</strong> to give fans and sponsors a platform where both can equally benefit.
                            <br /><br />
                            I wanted to create more than just a game—I'm building a large-scale ecosystem of entertainment that rewards sports knowledge without financial risk.
                            <br /><br />
                            As a solo developer, your feedback during this beta is everything to me. This is a journey to build a community where everyone wins."
                        </div>
                        <div className={styles.letterFooter}>
                            <p className={styles.letterSignature}>William</p>
                            <p className={styles.letterTitle}>Founder, Just Me Media</p>
                            <Link href="/corporate" className={styles.actionLink} style={{ marginTop: '1rem', color: 'var(--accent)', fontSize: '0.8rem' }}>
                                Learn more about our vision →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerInfo}>
                    <div className={styles.footerLinks}>
                        <Link href="/corporate">Corporate</Link>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/delete-account">Account Deletion</Link>
                    </div>
                    <p>&copy; 2026 Events Arena | Just Me Media</p>
                    <p className={styles.disclaimer}>Events Arena is a social platform for entertainment purposes only. No real money can be won or wagered on this site.</p>
                    <span className={styles.version}>v{APP_VERSION}</span>
                </div>
            </footer>

            <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
        </div>
    );
};

export default HomePage;
