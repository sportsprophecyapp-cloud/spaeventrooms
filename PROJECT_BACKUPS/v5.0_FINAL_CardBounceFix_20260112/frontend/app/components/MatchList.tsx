'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard/MatchCard';
import { PredictionModal } from './PredictionModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
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
    hasLive: boolean;
}

const MatchList: React.FC = () => {
    const [sections, setSections] = useState<LeagueSection[]>([]);
    const [myCalls, setMyCalls] = useState<string[]>([]); // Track user's predicted match IDs
    const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { socket } = useSocket();
    const { isAuthenticated, token } = useAuth();

    const fetchMatches = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            // 1. Fetch Matches
            const res = await fetch(`${apiUrl}/api/rooms/soccer/matches`);
            const data = await res.json();

            // 2. Fetch User's Calls (if logged in)
            if (isAuthenticated && token) {
                const callsRes = await fetch(`${apiUrl}/api/rooms/soccer/my-calls`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (callsRes.ok) {
                    const callsData = await callsRes.json();
                    setMyCalls(callsData.map((c: any) => c.match_id));
                }
            }

            if (Array.isArray(data)) {
                const grouped: Record<string, LeagueSection> = {};
                const seenMatches = new Set();

                data.forEach((match: Match) => {
                    const matchKey = `${match.home_team.substring(0, 5)}-${match.away_team.substring(0, 5)}-${match.start_time}`;
                    if (seenMatches.has(matchKey)) return;
                    seenMatches.add(matchKey);

                    const leagueName = match.league || 'International';
                    if (!grouped[leagueName]) {
                        grouped[leagueName] = {
                            title: leagueName,
                            logo: match.league_logo || '',
                            matches: [],
                            hasLive: false
                        };
                    }
                    grouped[leagueName].matches.push(match);
                    if (match.status === 'live') grouped[leagueName].hasLive = true;
                });

                const sortedSections = Object.values(grouped);
                setSections(sortedSections);

                const initialExpanded: Record<string, boolean> = {};
                sortedSections.forEach(s => {
                    if (s.hasLive) initialExpanded[s.title] = true;
                });
                setExpandedLeagues(prev => ({ ...initialExpanded, ...prev }));
            }
        } catch (err) {
            console.error('Failed to fetch matches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [isAuthenticated, token]);

    const toggleLeague = (title: string) => {
        setExpandedLeagues(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

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
                        <div
                            className={styles.leagueHeader}
                            onClick={() => toggleLeague(section.title)}
                        >
                            {section.logo && <img src={section.logo} alt="" className={styles.leagueLogo} />}
                            <h3 className={styles.leagueTitle}>{section.title}</h3>
                            <div className={styles.headerRight}>
                                {section.hasLive && <span className={styles.liveBadge}>LIVE</span>}
                                <span className={styles.matchCount}>{section.matches.length} GAMES</span>
                                <span className={styles.chevron}>
                                    {expandedLeagues[section.title] ? '▴' : '▾'}
                                </span>
                            </div>
                        </div>

                        {expandedLeagues[section.title] && (
                            <div className={`${styles.matchGrid} animate-fade-in`}>
                                {section.matches.map(match => (
                                    <MatchCard
                                        key={match.match_id}
                                        match={match}
                                        onPredict={() => handlePredictClick(match)}
                                        hasPredicted={myCalls.includes(match.match_id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}

            {selectedMatch && (
                <PredictionModal
                    match={selectedMatch}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => fetchMatches()} // Refresh calls after successful submission
                />
            )}
        </div>
    );
};

export default MatchList;
