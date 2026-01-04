'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import { PredictionModal } from './PredictionModal';

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    status: string;
    score_home?: number;
    score_away?: number;
}

const MatchList: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
