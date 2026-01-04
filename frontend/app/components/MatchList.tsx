import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';

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

    useEffect(() => {
        // Fetch matches from backend
        // Note: Using localhost for dev, should be env var
        fetch('http://localhost:8000/api/rooms/soccer/matches')
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

    if (loading) return <div>Loading matches...</div>;

    return (
        <div>
            <h2>Upcoming Matches</h2>
            {matches.length === 0 ? (
                <p>No matches scheduled.</p>
            ) : (
                matches.map(match => (
                    <MatchCard key={match.match_id} match={match} />
                ))
            )}
        </div>
    );
};

export default MatchList;
