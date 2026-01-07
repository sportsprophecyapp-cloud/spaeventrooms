'use client';

import React, { useState } from 'react';
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

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Transmission failed.');
            }

            // Trigger Animation
            setShowAnim(true);
            
            // Wait for animation to finish before closing modal
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);

        } catch (err: any) {
            setError(err.message || 'Transmission failed. Try again.');
            setLoading(false);
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
                <p style={{ color: 'var(--neutral)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {match.home_team} vs {match.away_team}
                </p>

                <div className={styles.options}>
                    <button
                        className={`${styles.option} ${pick === 'home' ? styles.active : ''}`}
                        onClick={() => setPick('home')}
                        disabled={showAnim}
                    >
                        {match.home_team}
                    </button>
                    <button
                        className={`${styles.option} ${pick === 'draw' ? styles.active : ''}`}
                        onClick={() => setPick('draw')}
                        disabled={showAnim}
                    >
                        DRAW
                    </button>
                    <button
                        className={`${styles.option} ${pick === 'away' ? styles.active : ''}`}
                        onClick={() => setPick('away')}
                        disabled={showAnim}
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
