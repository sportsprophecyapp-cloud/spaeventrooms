'use client';

import React, { useState, useEffect } from 'react';
import styles from './LeagueGrid.module.css';

interface League {
    league_id: string;
    name: string;
    logo_url: string;
}

interface LeagueGridProps { // NEW: Props interface
    onLeagueSelect: (leagueId: string) => void;
}

const LeagueGrid: React.FC<LeagueGridProps> = ({ onLeagueSelect }) => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Loading Arenas...</div>;
    }

    return (
        <div className={styles.grid}>
            {leagues.map(league => (
                <div key={league.league_id} className={`${styles.card} glass`} onClick={() => onLeagueSelect(league.league_id)}>
                    <img src={league.logo_url} alt={`${league.name} logo`} className={styles.logo} />
                    <span className={styles.name}>{league.name}</span>
                </div>
            ))}
        </div>
    );
};

export default LeagueGrid;
