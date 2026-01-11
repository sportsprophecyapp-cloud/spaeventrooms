'use client';

import React, { useState, useEffect } from 'react';
import styles from './LeagueGrid.module.css';

interface League {
    league_id: string;
    name: string;
    logo_url: string;
}

interface LeagueGridProps {
    onLeagueSelect: (leagueId: string) => void;
}

const LeagueGrid: React.FC<LeagueGridProps> = ({ onLeagueSelect }) => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const supportedLeagues = [
                    { league_id: 'soccer_epl', name: 'Premier League', logo_url: 'https://media.api-sports.io/football/leagues/39.png' },
                    { league_id: 'soccer_spain_la_liga', name: 'La Liga', logo_url: 'https://media.api-sports.io/football/leagues/140.png' },
                    { league_id: 'soccer_germany_bundesliga', name: 'Bundesliga', logo_url: 'https://media.api-sports.io/football/leagues/78.png' },
                    { league_id: 'soccer_italy_serie_a', name: 'Serie A', logo_url: 'https://media.api-sports.io/football/leagues/135.png' },
                    { league_id: 'soccer_france_ligue_one', name: 'Ligue 1', logo_url: 'https://media.api-sports.io/football/leagues/61.png' },
                    { league_id: 'soccer_usa_mls', name: 'MLS', logo_url: 'https://media.api-sports.io/football/leagues/253.png' },
                ];
                setLeagues(supportedLeagues);
            } catch (err) {
                console.error("Failed to fetch leagues:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeagues();

        // Check if user has seen instructions
        const hasSeenInstructions = localStorage.getItem('hasSeenPredictionInstructions');
        if (!hasSeenInstructions) {
            setShowInstructions(true);
        }
    }, []);

    const handleCloseInstructions = (dontShowAgain: boolean) => {
        if (dontShowAgain) {
            localStorage.setItem('hasSeenPredictionInstructions', 'true');
        }
        setShowInstructions(false);
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading Arenas...</div>;
    }

    return (
        <>
            <div className={styles.grid}>
                {leagues.map(league => (
                    <div key={league.league_id} className={`${styles.card} glass`} onClick={() => onLeagueSelect(league.league_id)}>
                        <img
                            src={league.logo_url}
                            alt={`${league.name} logo`}
                            className={`${styles.logo} ${league.league_id === 'soccer_france_ligue_one' ? styles.ligueOne : ''}`}
                        />
                        <span className={styles.name}>{league.name}</span>
                    </div>
                ))}
            </div>

            {showInstructions && (
                <div className={styles.instructionsOverlay}>
                    <div className={styles.instructionsCard}>
                        <h2>🎯 How to Make Predictions</h2>
                        <div className={styles.instructionSteps}>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>1</span>
                                <p><strong>Select a League</strong><br />Tap any league above to see live matches</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>2</span>
                                <p><strong>Swipe the Cards</strong><br />Swipe right or left to make your prediction</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>3</span>
                                <p><strong>Earn Rewards</strong><br />Correct predictions earn you points and prize tickets!</p>
                            </div>
                        </div>
                        <div className={styles.instructionsActions}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    id="dontShowAgain"
                                />
                                <span>Don't show this again</span>
                            </label>
                            <button
                                onClick={() => {
                                    const checkbox = document.getElementById('dontShowAgain') as HTMLInputElement;
                                    handleCloseInstructions(checkbox?.checked || false);
                                }}
                                className={styles.gotItBtn}
                            >
                                Got It!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LeagueGrid;
