'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import MatchList from '../../components/MatchList';
import AnnouncementsSection from '../../components/AnnouncementsSection';
import CustomPollCard from '../../components/CustomPollCard';
import SponsorWidget from '../../components/SponsorWidget';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from '../../components/LoginModal';
import { useEffect } from 'react';

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { user, logout, isAuthenticated } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [predictions, setPredictions] = useState<any[]>([]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchPredictions = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions`);
            const data = await res.json();
            setPredictions(data);
        } catch (err) {
            console.error('Error fetching predictions:', err);
        }
    };

    useEffect(() => {
        fetchPredictions();
        const interval = setInterval(fetchPredictions, 30000); // Polling as fallback for socket
        return () => clearInterval(interval);
    }, [roomId]);

    const handleVote = async (predictionId: number, option: string) => {
        if (!isAuthenticated) {
            setIsLoginOpen(true);
            return;
        }

        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions/${predictionId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ option })
            });

            if (!res.ok) throw new Error('Failed to submit vote');
        } catch (err) {
            console.error('Vote failed:', err);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{roomId.toUpperCase()} Room</h1>
                <div className={styles.userSection}>
                    {isAuthenticated ? (
                        <>
                            <span>{user?.email}</span>
                            <button onClick={logout} className={styles.authBtn}>Logout</button>
                        </>
                    ) : (
                        <button onClick={() => setIsLoginOpen(true)} className={styles.authBtn}>Login</button>
                    )}
                </div>
            </header>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <SponsorWidget roomId={roomId} />
                    <AnnouncementsSection roomId={roomId} />

                    {predictions.length > 0 && (
                        <div className={styles.predictionsSection}>
                            {predictions.map(p => (
                                <CustomPollCard
                                    key={p.id}
                                    prediction={p}
                                    onVote={(opt) => handleVote(p.id, opt)}
                                />
                            ))}
                        </div>
                    )}

                    <MatchList />
                </div>
                <div className={styles.card}>
                    <h2>Leaderboard</h2>
                    <p>Rankings coming soon.</p>
                </div>
            </div>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
}
