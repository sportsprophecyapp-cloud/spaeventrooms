'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import { PredictionModal } from './PredictionModal';
import { useSocket } from '../context/SocketContext';
import SkeletonCard from './SkeletonCard';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    score_home?: number;
    score_away?: number;
    isPulsing?: boolean;
}

const MatchList: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${apiUrl}/api/rooms/soccer/matches`)
            .then(res => res.json())
            .then(data => {
                // Safety check: ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setMatches(data);
                } else {
                    console.error('Expected array of matches, got:', data);
                    setMatches([]);
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
            console.log('Real-time match update received:', updatedMatch);
            setMatches(prev => prev.map(m =>
                m.match_id === updatedMatch.match_id ? { ...m, ...updatedMatch, isPulsing: true } : m
            ));

            setTimeout(() => {
                setMatches(prev => prev.map(m =>
                    m.match_id === updatedMatch.match_id ? { ...m, isPulsing: false } : m
                ));
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
            <div>
                <h2 style={{ marginBottom: '1rem', fontWeight: 800, color: 'var(--neutral)' }}>Upcoming Matches</h2>
                <SkeletonCard type="match" />
                <SkeletonCard type="match" />
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Upcoming Matches</h2>
            {matches.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <p style={{ color: 'var(--neutral)' }}>No matches scheduled for the next 24 hours.</p>
                </div>
            ) : (
                matches.map(match => (
                    <MatchCard
                        key={match.match_id}
                        match={match}
                        onPredict={handlePredictClick}
                    />
                ))
            )}

            {selectedMatch && (
                <PredictionModal
                    match={selectedMatch}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        console.log('Prediction success!');
                    }}
                />
            )}
        </div>
    );
};

export default MatchList;
