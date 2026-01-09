'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import LeagueGrid from '../../components/LeagueGrid/LeagueGrid';
import GameDeck from '../../components/GameDeck/GameDeck'; // NEW
import SponsorWidget from '../../components/SponsorWidget';
// ... other imports

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const isSoccerRoom = roomId === 'soccer';
    
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null); // NEW
    // ... other state

    const handleLeagueSelect = (leagueId: string) => { // NEW
        setSelectedLeague(leagueId);
    };

    const handleReturnToGrid = () => { // NEW
        setSelectedLeague(null);
    };

    // ... other logic

    return (
        <div className={styles.container}>
            <header className={styles.minimalHeader}>{/* ... */}</header>

            <main className={styles.dualLayout}>
                <div className={styles.mainContent}>
                    <SponsorWidget roomId={roomId} />
                    
                    <div className={styles.matchesWrapper}>
                        {isSoccerRoom ? (
                            <>
                                {selectedLeague ? (
                                    <>
                                        <button onClick={handleReturnToGrid} className={styles.backToGridBtn}>← Back to Leagues</button>
                                        <GameDeck leagueId={selectedLeague} />
                                    </>
                                ) : (
                                    <>
                                        <h3 className={styles.sectionHeading}>SELECT AN ARENA</h3>
                                        <LeagueGrid onLeagueSelect={handleLeagueSelect} />
                                    </>
                                )}
                            </>
                        ) : (
                            <div className={styles.creatorWelcome}>{/* ... */}</div>
                        )}
                    </div>
                </div>

                <aside className={styles.sidebar}>{/* ... */}</aside>
            </main>

            {/* ... (LoginModal) */}
        </div>
    );
}

// ... (RoomPage wrapper remains the same)
