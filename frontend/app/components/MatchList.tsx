'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import { PredictionModal } from './PredictionModal';
import { useSocket } from '../context/SocketContext';
import SkeletonCard from './SkeletonCard';
import styles from './MatchList.module.css';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    score_home?: number;
    score_away?: number;
    league?: string;
    league_logo?: string;
}

interface LeagueSection {
    title: string;
    logo: string;
    matches: Match[];
}

const MatchList: React.FC = () => {
    const [sections, setSections] = useState<LeagueSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { socket } = useSocket();

    const fetchMatches = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/rooms/soccer/matches`);
            const data = await res.json();
            
            if (Array.isArray(data)) {
                // Group matches by league
                const grouped: Record<string, LeagueSection> = {};
                
                data.forEach((match: Match) => {
                    const leagueName = match.league || 'International';
                    if (!grouped[leagueName]) {
                        grouped[leagueName] = {
                            title: leagueName,
                            logo: match.league_logo || '',
                            matches: []
                        };
                    }
                    grouped[leagueName].matches.push(match);
                });

                setSections(Object.values(grouped));
            }
        } catch (err) {
            console.error('Failed to fetch matches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('match_update', () => fetchMatches());
        return () => { socket.off('match_update'); };
    }, [socket]);

    const handlePredictClick = (match: Match) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <SkeletonCard type="match" />
                <SkeletonCard type="match" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {sections.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No active markets found. Check back for live games soon!</p>
                </div>
            ) : (
                sections.map(section => (
                    <div key={section.title} className={styles.leagueBlock}>
                        <div className={styles.leagueHeader}>
                            {section.logo && <img src={section.logo} alt="" className={styles.leagueLogo} />}
                            <h3 className={styles.leagueTitle}>{section.title}</h3>
                            <span className={styles.matchCount}>{section.matches.length} EVENTS</span>
                        </div>
                        <div className={styles.matchGrid}>
                            {section.matches.map(match => (
                                <MatchCard
                                    key={match.match_id}
                                    match={match}
                                    onPredict={() => handlePredictClick(match)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}

            {selectedMatch && (
                <PredictionModal
                    match={selectedMatch}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => console.log('Call Confirmed!')}
                />
            )}
        </div>
    );
};

export default MatchList;
