'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';
import MarketingPulseCard from '@/app/components/MarketingPulseCard/MarketingPulseCard';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    home_logo: string;
    away_logo: string;
    room_id: string;
}

const MarketingStudio = () => {
    const { token, user } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [sentiment, setSentiment] = useState<{ percentages: { home: number, away: number, draw: number, total: number } } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchMatches = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            try {
                // Fetch upcoming matches for both NHL and Soccer
                const [soccerRes, nhlRes] = await Promise.all([
                    fetch(`${apiUrl}/api/rooms/soccer/matches`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiUrl}/api/rooms/nhl/matches`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (soccerRes.ok && nhlRes.ok) {
                    const soccerData = await soccerRes.json();
                    const nhlData = await nhlRes.json();
                    setMatches([...soccerData, ...nhlData]);
                }
            } catch (err) {
                console.error('Error fetching matches:', err);
            }
        };

        fetchMatches();
    }, [token]);

    const handleSelectMatch = async (match: Match) => {
        setSelectedMatch(match);
        setSentiment(null);
        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
        try {
            const res = await fetch(`${apiUrl}/api/rooms/${match.room_id}/predictions/match/${match.match_id}/sentiment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSentiment(data);
            }
        } catch (err) {
            console.error('Error fetching sentiment:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return <div className={styles.error}>Unauthorized Access. Admins Only.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>📢 Marketing Studio</h1>
                <p>Generate real-time fan sentiment cards for social media.</p>
            </header>

            <main className={styles.main}>
                <section className={styles.matchPicker}>
                    <h3>1. Select a Match</h3>
                    <div className={styles.matchList}>
                        {matches.map(m => (
                            <div 
                                key={m.match_id} 
                                className={`${styles.matchItem} ${selectedMatch?.match_id === m.match_id ? styles.selected : ''}`}
                                onClick={() => handleSelectMatch(m)}
                            >
                                <div className={styles.matchTeams}>
                                    <img src={m.home_logo} alt="" />
                                    <span>{m.home_team} vs {m.away_team}</span>
                                    <img src={m.away_logo} alt="" />
                                </div>
                                <span className={styles.roomTag}>{m.room_id.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.previewSection}>
                    <h3>2. Preview & Export</h3>
                    {selectedMatch && sentiment ? (
                        <div className={styles.previewContainer}>
                            <MarketingPulseCard 
                                homeTeam={selectedMatch.home_team}
                                awayTeam={selectedMatch.away_team}
                                homeLogo={selectedMatch.home_logo}
                                awayLogo={selectedMatch.away_logo}
                                homePct={sentiment.percentages.home}
                                awayPct={sentiment.percentages.away}
                                drawPct={sentiment.percentages.draw}
                                totalVotes={sentiment.percentages.total}
                            />
                        </div>
                    ) : (
                        <div className={styles.emptyPreview}>
                            {isLoading ? 'Loading sentiment data...' : 'Select a match to generate pulse card.'}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MarketingStudio;
