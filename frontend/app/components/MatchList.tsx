'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import { PredictionModal } from './PredictionModal';
import { useSocket } from '../context/SocketContext';

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
                setMatches(data);
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

            // Remove pulsing after 3 seconds
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

    if (loading) return <div>Loading matches...</div>;

    return (
        <div>
            <h2>Upcoming Matches</h2>
            {matches.length === 0 ? (
                <p>No matches scheduled.</p>
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
                        // Optional: Refresh matches or show success toast
                        console.log('Prediction success!');
                    }}
                />
            )}
        </div>
    );
};

export default MatchList;
