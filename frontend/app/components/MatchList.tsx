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
    isPulsing?: boolean;
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

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${apiUrl}/api/rooms/soccer/matches`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSections(data);
                } else {
                    setSections([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch matches:', err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('match_update', (updatedMatch: Match) => {
            setSections(prev => prev.map(section => ({
                ...section,
                matches: section.matches.map(m => 
                    m.match_id === updatedMatch.match_id ? { ...m, ...updatedMatch, isPulsing: true } : m
                )
            })));

            setTimeout(() => {
                setSections(prev => prev.map(section => ({
                    ...section,
                    matches: section.matches.map(m => 
                        m.match_id === updatedMatch.match_id ? { ...m, isPulsing: false } : m
                    )
                })));
            }, 3000);
        });

        return () => {
            socket.off('match_update');
        };
    }, [socket]);

    const handlePredictClick = (match: Match) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Arena Schedule</h2>
                <SkeletonCard type="match" />
                <SkeletonCard type="match" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Arena Schedule</h2>
            
            {sections.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No active markets found in this arena.</p>
                </div>
            ) : (
                sections.map(section => (
                    <div key={section.title} className={styles.leagueSection}>
                        <div className={styles.leagueHeader}>
                            {section.logo && <img src={section.logo} alt="" className={styles.leagueLogo} />}
                            <h3 className={styles.leagueTitle}>{section.title}</h3>
                        </div>
                        <div className={styles.matchGrid}>
                            {section.matches.map(match => (
                                <MatchCard
                                    key={match.match_id}
                                    match={match}
                                    onPredict={handlePredictClick}
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
                    onSuccess={() => console.log('Prediction success!')}
                />
            )}
        </div>
    );
};

export default MatchList;
