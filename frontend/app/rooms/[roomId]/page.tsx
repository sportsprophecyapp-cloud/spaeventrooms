'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import LeagueGrid from '../../components/LeagueGrid/LeagueGrid';
import GameDeck from '../../components/GameDeck/GameDeck';
import { useLanguage } from '../../context/LanguageContext'; // NEW
// ... other imports

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const isSoccerRoom = roomId === 'soccer';
    const { t } = useLanguage(); // NEW
    
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    // ... other state

    const handleLeagueSelect = (leagueId: string) => {
        setSelectedLeague(leagueId);
    };

    const handleReturnToGrid = () => {
        setSelectedLeague(null);
    };

    return (
        <div className={styles.container}>
            {/* ... */}
            <main className={styles.dualLayout}>
                <div className={styles.mainContent}>
                    {/* ... */}
                    <div className={styles.matchesWrapper}>
                        {isSoccerRoom ? (
                            <>
                                {selectedLeague ? (
                                    <>
                                        <button onClick={handleReturnToGrid} className={styles.backToGridBtn}>{t('back_to_leagues')}</button>
                                        <GameDeck leagueId={selectedLeague} />
                                    </>
                                ) : (
                                    <>
                                        <h3 className={styles.sectionHeading}>{t('select_arena')}</h3>
                                        <LeagueGrid onLeagueSelect={handleLeagueSelect} />
                                    </>
                                )}
                            </>
                        ) : (
                            <div className={styles.creatorWelcome}>{/* ... */}</div>
                        )}
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarTabs}>
                        <button className={`${styles.sideTab} ${activeSidebar === 'chat' ? styles.activeSideTab : ''}`} onClick={() => setActiveSidebar('chat')}>{t('fan_arena')}</button>
                        <button className={`${styles.sideTab} ${activeSidebar === 'standings' ? styles.activeSideTab : ''}`} onClick={() => setActiveSidebar('standings')}>{t('standings')}</button>
                    </div>
                    {/* ... */}
                </aside>
            </main>
            {/* ... */}
        </div>
    );
}

// ... (RoomPage wrapper)
