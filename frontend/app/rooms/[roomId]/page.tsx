'use client';

import { useState } from 'react';
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
import { useEffect } from 'react';
import UserTray from '../../components/UserTray';
import Leaderboard from '../../components/Leaderboard';
import EmptyStateWidget from '../../components/EmptyStateWidget';

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { user, logout, isAuthenticated } = useAuth();
    const { socket } = useSocket();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'predictions' | 'leaderboard'>('predictions');
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
                <div style={{ position: 'absolute', left: '2rem', top: '6rem', zIndex: 10 }}>
                    <Link href="/" style={{
                        color: 'rgba(255,255,255,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        ← Lobby
                    </Link>
                </div>
                <div className={styles.roomHeader}>
                    <h1 className={styles.title}>{roomId.toUpperCase()} Room</h1>
                    {/* Sponsor Pill - Dynamic based on room */}
                    <span className={styles.sponsorPill}>
                        <span className={styles.pillLabel}>Sponsored by</span>
                        <span className={styles.pillBrand}>CloudBet</span>
                    </span>
                </div>
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

            {/* Mobile Tab Navigation */}
            <div className={styles.mobileTabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'predictions' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('predictions')}
                >
                    Predictions
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    Leaderboard
                </button>
            </div>

            <div className={`${styles.grid} animate-slide`}>
                {/* Predictions Column - Show if activeTab is 'predictions' OR if we are on desktop (CSS will handle desktop visibility) */}
                <div className={`${styles.card} ${styles.leftColumn} ${activeTab !== 'predictions' ? styles.mobileHidden : ''}`}>
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
                            onScrollToMatches={() => {
                                document.getElementById('match-list-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            onViewLeaderboard={() => {
                                setActiveTab('leaderboard');
                            }}
                        />
                    )}

                    <div id="match-list-section">
                        <MatchList />
                    </div>
                </div>

                {/* Leaderboard Column - Show if activeTab is 'leaderboard' OR if we are on desktop */}
                <div className={`${styles.card} ${styles.rightColumn} ${activeTab !== 'leaderboard' ? styles.mobileHidden : ''}`}>
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
