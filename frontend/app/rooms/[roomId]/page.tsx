'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import MatchList from '../../components/MatchList';
import AnnouncementsSection from '../../components/AnnouncementsSection';
import CustomPollCard from '../../components/CustomPollCard';
import SponsorWidget from '../../components/SponsorWidget';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../components/LoginModal';
import { SocketProvider, useSocket } from '../../context/SocketContext';
import { useEffect } from 'react';
import UserTray from '../../components/UserTray';
import Leaderboard from '../../components/Leaderboard';

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { user, logout, isAuthenticated } = useAuth();
    const { socket } = useSocket();
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
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('prediction_new', (newPrediction: any) => {
            console.log('Real-time prediction received:', newPrediction);
            setPredictions(prev => [newPrediction, ...prev]);
        });

        socket.on('prediction_revealed', (data: { id: number, correctAnswer: string }) => {
            console.log('Prediction revealed received:', data);
            setPredictions(prev => prev.map(p =>
                p.id === data.id ? { ...p, correct_answer: data.correctAnswer, revealed_at: new Date().toISOString() } : p
            ));
        });

        return () => {
            socket.off('prediction_new');
            socket.off('prediction_revealed');
        };
    }, [socket]);

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
            <header className={`${styles.header} animate-fade`}>
                <h1 className={styles.title}>{roomId.toUpperCase()} Room</h1>
                <div className={styles.userSection}>
                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => {
                                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                                    const url = `${window.location.origin}/rooms/${roomId}`;
                                    navigator.clipboard.writeText(url);
                                    alert('Room link copied! Share it with friends.');
                                }}
                                className={styles.shareBtn}
                            >
                                📤 Share
                            </button>
                            <UserTray />
                            <button onClick={logout} className={styles.authBtn}>Logout</button>
                        </>
                    ) : (
                        <button onClick={() => setIsLoginOpen(true)} className={styles.authBtn}>Login</button>
                    )}
                </div>
            </header>

            <div className={`${styles.grid} animate-slide`}>
                <div className={styles.card}>
                    <SponsorWidget roomId={roomId} />
                    <AnnouncementsSection roomId={roomId} />

                    {predictions.length > 0 && (
                        <div className={styles.predictionsSection}>
                            {predictions.map(p => (
                                <CustomPollCard
                                    key={p.id}
                                    prediction={p}
                                    roomId={roomId}
                                    onVote={(opt) => handleVote(p.id, opt)}
                                />
                            ))}
                        </div>
                    )}

                    <MatchList />
                </div>
                <div className={styles.card}>
                    <Leaderboard />
                </div>
            </div>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
}

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;

    return (
        <SocketProvider roomId={roomId}>
            <RoomContent />
        </SocketProvider>
    );
}
