'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import MatchList from '../../components/MatchList';
import AnnouncementsSection from '../../components/AnnouncementsSection';
import CustomPollCard from '../../components/CustomPollCard';
import SponsorWidget from '../../components/SponsorWidget';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '@/app/components/LoginModal';
import { SocketProvider, useSocket } from '../../context/SocketContext';
import UserTray from '../../components/UserTray';
import Leaderboard from '../../components/Leaderboard';
import EmptyStateWidget from '../../components/EmptyStateWidget';
import RoomChat from '../../components/RoomChat';

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { logout, isAuthenticated } = useAuth();
    const { socket } = useSocket();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'predictions' | 'leaderboard' | 'chat'>('predictions');
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
            setPredictions(prev => [newPrediction, ...prev]);
        });

        socket.on('prediction_revealed', (data: { id: number, correctAnswer: string }) => {
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
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backBtn}>← Lobby</Link>
                    <h1 className={styles.title}>{roomId.toUpperCase()}</h1>
                </div>
                
                <div className={styles.userSection}>
                    {isAuthenticated ? (
                        <>
                            <UserTray />
                            <button onClick={logout} className={styles.authBtn}>Logout</button>
                        </>
                    ) : (
                        <button onClick={() => setIsLoginOpen(true)} className={styles.authBtn}>Login</button>
                    )}
                </div>
            </header>

            {/* Mobile Tab Navigation */}
            <div className={styles.mobileTabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'predictions' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('predictions')}
                >
                    Predict
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    Ranks
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    Chat
                </button>
            </div>

            <div className={styles.mainLayout}>
                {/* Predictions Column */}
                <div className={`${styles.column} ${activeTab !== 'predictions' ? styles.mobileHidden : ''}`}>
                    <SponsorWidget roomId={roomId} />
                    <AnnouncementsSection roomId={roomId} />

                    {predictions.length > 0 ? (
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
                    ) : (
                        <EmptyStateWidget
                            onScrollToMatches={() => document.getElementById('match-list-section')?.scrollIntoView({ behavior: 'smooth' })}
                            onViewLeaderboard={() => setActiveTab('leaderboard')}
                        />
                    )}

                    <div id="match-list-section">
                        <MatchList />
                    </div>
                </div>

                {/* Leaderboard Column */}
                <div className={`${styles.column} ${styles.middleColumn} ${activeTab !== 'leaderboard' ? styles.mobileHidden : ''}`}>
                    <Leaderboard />
                </div>

                {/* Chat Column */}
                <div className={`${styles.column} ${styles.rightColumn} ${activeTab !== 'chat' ? styles.mobileHidden : ''}`}>
                    <RoomChat roomId={roomId} />
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
