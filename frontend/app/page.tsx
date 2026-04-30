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
import FeaturedDraw from '@/app/components/FeaturedDraw';
import PulseCTA from '@/app/components/PulseCTA/PulseCTA';

const HomePage = () => {
    const { t, language, setLanguage } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    const rooms = [
        { id: 'soccer', name: 'Soccer Arena', description: 'Forecast match winners and events from the world\'s top leagues.', icon: '/assets/arenas/soccer-arena.jpg', color: 'var(--accent)', active: true },
        { id: 'nhl', name: 'NHL Arena', description: 'Ice-cold predictions. Puck drops now!', icon: '/assets/arenas/nhl-hub.png', color: '#00d2ff', active: true },
        { id: 'nfl', name: 'NFL Arena', description: 'Launching for the Playoffs. Get notified the moment doors open.', icon: '/assets/arenas/nfl-hub.jpg', color: '#ff4b4b', active: false }
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

                {!isAuthenticated && (
                    <div className={styles.heroCtaWrapper}>
                        <Link href="/auth/register" className={styles.heroCtaBtn}>
                            JOIN FOR FREE & START WINNING
                        </Link>
                    </div>
                )}
            </header>

            {isAuthenticated && (
                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    <DailyLoginButton />
                    <LootShowcase />
                </div>
            )}

            <main className={styles.main}>
                <PulseCTA />
                
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
                                <a href="mailto:contact@sportsprophecyapp.com?subject=NFL Arena Early Access" className={styles.notifyBtn}>🔔 GET NOTIFIED AT LAUNCH</a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Featured Prize Draw */}
                <FeaturedDraw />

                {/* Recent Winners Showcase */}
                <RecentWinners />

                {/* How It Works Section */}
                <section style={{ marginTop: '4rem', textAlign: 'center', width: '100%', maxWidth: '1000px' }}>
                    <div className={styles.sectionTitle}>{t('how_it_works_title')}</div>
                    <div className={styles.economyPreview} style={{ marginTop: '2.5rem' }}>
                        <div className={`${styles.ecoCard} glass`}>
                            <div className={styles.ecoIconBg} style={{ background: 'rgba(0, 112, 243, 0.1)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0070f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <h4>{t('how_step_1')}</h4>
                            <p>{t('how_step_1_desc')}</p>
                        </div>
                        <div className={`${styles.ecoCard} glass`}>
                            <div className={styles.ecoIconBg} style={{ background: 'rgba(255, 75, 75, 0.1)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            </div>
                            <h4>{t('how_step_2')}</h4>
                            <p>{t('how_step_2_desc')}</p>
                        </div>
                        <div className={`${styles.ecoCard} glass`}>
                            <div className={styles.ecoIconBg} style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                            </div>
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
