'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './PredictionModal.module.css';

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
    const { token, isAuthenticated } = useAuth();

    if (!isOpen || !match) return null;

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            setError('Please login to make a prediction');
            return;
        }

        if (!pick) {
            setError('Please select an outcome');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8000/api/rooms/soccer/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    matchId: match.match_id,
                    pick: pick
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to save prediction');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>Predict: {match.home_team} vs {match.away_team}</h3>

                <div className={styles.options}>
                    <button
                        className={`${styles.option} ${pick === 'home' ? styles.active : ''}`}
                        onClick={() => setPick('home')}
                    >
                        {match.home_team} Win
                    </button>
                    <button
                        className={`${styles.option} ${pick === 'draw' ? styles.active : ''}`}
                        onClick={() => setPick('draw')}
                    >
                        Draw
                    </button>
                    <button
                        className={`${styles.option} ${pick === 'away' ? styles.active : ''}`}
                        onClick={() => setPick('away')}
                    >
                        {match.away_team} Win
                    </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={loading || !pick}
                    >
                        {loading ? 'Saving...' : 'Confirm Selection'}
                    </button>
                </div>
            </div>
        </div>
    );
};
