'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './PredictionModal.module.css';
import ScoreAnimation from './ScoreAnimation';

interface PredictionModalProps {
    match: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PredictionModal = ({ match, isOpen, onClose, onSuccess }: PredictionModalProps) => {
    const [pick, setPick] = useState<'home' | 'draw' | 'away' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAnim, setShowAnim] = useState(false);
    const { token, isAuthenticated } = useAuth();

    // RESET STATE WHEN MODAL OPENS FOR A NEW MATCH
    useEffect(() => {
        if (isOpen) {
            setPick(null);
            setError('');
            setLoading(false);
            setShowAnim(false);
        }
    }, [isOpen, match?.match_id]);

    if (!isOpen || !match) return null;

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            setError('Please login to make your call');
            return;
        }

        if (!pick) {
            setError('Please select an outcome');
            return;
        }

        setLoading(true);
        setError('');

        // Use dynamic environment variable for API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sportsprophecyapp.com';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch(`${apiUrl}/api/rooms/soccer/predictions/match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    matchId: match.match_id,
                    pick: pick
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || data.error || 'Transmission failed.');
            }

            // Success Path
            setShowAnim(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);

        } catch (err: any) {
            console.error('Call Transmission Failed:', err);
            setLoading(false);
            if (err.name === 'AbortError') {
                setError('Connection timed out. Check your internet.');
            } else {
                setError(err.message || 'Transmission failed. Please try again.');
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <ScoreAnimation 
                value="+10 PTS" 
                trigger={showAnim} 
                onComplete={() => setShowAnim(false)} 
            />
            
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.title}>Make Your Call</h3>
                <p className={styles.matchTeams}>
                    {match.home_team} vs {match.away_team}
                </p>

                <div className={styles.options}>
                    <button
                        className={`${styles.option} ${pick === 'home' ? styles.active : ''}`}
                        onClick={() => setPick('home')}
                        disabled={loading || showAnim}
                    >
                        {match.home_team}
                    </button>
                    <button
                        className={`${styles.option} ${pick === 'draw' ? styles.active : ''}`}
                        onClick={() => setPick('draw')}
                        disabled={loading || showAnim}
                    >
                        DRAW
                    </button>
                    <button
                        className={`${styles.option} ${pick === 'away' ? styles.active : ''}`}
                        onClick={() => setPick('away')}
                        disabled={loading || showAnim}
                    >
                        {match.away_team}
                    </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>CANCEL</button>
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={loading || !pick || showAnim}
                    >
                        {loading ? 'TRANSMITTING...' : 'CONFIRM YOUR CALL'}
                    </button>
                </div>
            </div>
        </div>
    );
};
