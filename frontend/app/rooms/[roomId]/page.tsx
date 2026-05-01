'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import LeagueGrid from '../../components/LeagueGrid/LeagueGrid';
import GameDeck from '../../components/GameDeck/GameDeck';
import SponsorWidget from '../../components/SponsorWidget';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LoginModal from '@/app/components/LoginModal';
import { SocketProvider } from '../../context/SocketContext';
import Leaderboard from '../../components/Leaderboard';
import RoomChat from '../../components/RoomChat';
import LiveTicker from '@/app/components/LiveTicker/LiveTicker';

const RoomPage = () => {
    const params = useParams();
    const roomId = params.roomId as string;

    return (
        <SocketProvider roomId={roomId}>
            <RoomContent />
        </SocketProvider>
    );
};

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const isSoccerRoom = roomId === 'soccer';
    const { t } = useLanguage();

    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState<'chat' | 'standings'>('chat');

    const handleLeagueSelect = (leagueId: string) => {
        setSelectedLeague(leagueId);
    };

    const handleReturnToGrid = () => {
        setSelectedLeague(null);
    };

    return (
        <div className={styles.container}>
            <LiveTicker />
            <header className={styles.minimalHeader}>
                <h1 className={styles.arenaTitle}>{(roomId || 'ARENA').toUpperCase()} ARENA</h1>
                <Link href="/draw" className={styles.prizesPill}>
                    <span className={styles.pillIcon}>🎁</span>
                    <span className={styles.pillText}>{t('active_draws')}</span>
                </Link>
                {/* ... other header elements */}
            </header>

            {/* Tournament Hub Banners */}
            {roomId === 'nhl' && (
                <Link href="/arena/nhl/playoffs" className={styles.tournamentBanner} style={{ background: 'linear-gradient(135deg, rgba(0,100,200,0.3), rgba(0,50,100,0.5))', borderColor: 'rgba(0,210,255,0.3)' }}>
                    <span>🏒</span>
                    <span className={styles.tournamentBannerText}>STANLEY CUP PLAYOFFS LIVE — View Full Bracket & Series Scores</span>
                    <span className={styles.tournamentArrow}>→</span>
                </Link>
            )}
            {roomId === 'soccer' && (
                <Link href="/arena/soccer/world-cup" className={styles.tournamentBanner} style={{ background: 'linear-gradient(135deg, rgba(0,100,0,0.3), rgba(0,80,40,0.5))', borderColor: 'rgba(0,230,118,0.3)' }}>
                    <span>⚽</span>
                    <span className={styles.tournamentBannerText}>FIFA WORLD CUP 2026 — View Fixtures, Groups & Schedule</span>
                    <span className={styles.tournamentArrow}>→</span>
                </Link>
            )}

            <main className={styles.dualLayout}>
                <div className={styles.mainContent}>
                    <SponsorWidget roomId={roomId} />

                    <div className={styles.matchesWrapper}>
                        {isSoccerRoom ? (
                            <>
                                {selectedLeague ? (
                                    <>
                                        <button onClick={handleReturnToGrid} className={styles.backToGridBtn}>{t('back_to_leagues')}</button>
                                        <GameDeck leagueId={selectedLeague} roomId={roomId} />
                                    </>
                                ) : (
                                    <>
                                        <h3 className={styles.sectionHeading}>{t('select_arena')}</h3>
                                        <LeagueGrid onLeagueSelect={handleLeagueSelect} />
                                    </>
                                )}
                            </>
                        ) : roomId === 'nhl' ? (
                            <>
                                <button onClick={() => window.location.href = '/'} className={styles.backToGridBtn}>Back to Lobby</button>
                                <GameDeck leagueId="nhl" roomId={roomId} />
                            </>
                        ) : (
                            <div className={styles.creatorWelcome}>
                                <h3 className={styles.sectionHeading}>Creator Event Hub</h3>
                                <p className={styles.welcomeText}>Watch the stream and participate in live polls below!</p>
                            </div>
                        )}
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarTabs}>
                        <button className={`${styles.sideTab} ${activeSidebar === 'chat' ? styles.activeSideTab : ''}`} onClick={() => setActiveSidebar('chat')}>{t('fan_arena')}</button>
                        <button className={`${styles.sideTab} ${activeSidebar === 'standings' ? styles.activeSideTab : ''}`} onClick={() => setActiveSidebar('standings')}>{t('standings')}</button>
                    </div>
                    <div className={styles.sidebarContent}>
                        {activeSidebar === 'chat' ? <RoomChat roomId={roomId} /> : <Leaderboard />}
                    </div>
                </aside>
            </main>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
}

export default RoomPage;
