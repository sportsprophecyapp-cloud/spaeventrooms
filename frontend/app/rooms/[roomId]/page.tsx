'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import MatchList from '../../components/MatchList';
import CustomPollCard from '../../components/CustomPollCard';
import SponsorWidget from '../../components/SponsorWidget';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '@/app/components/LoginModal';
import { SocketProvider, useSocket } from '../../context/SocketContext';
import UserTray from '../../components/UserTray';
import Leaderboard from '../../components/Leaderboard';
import RoomChat from '../../components/RoomChat';
import FlashCallAlerter from '../../components/FlashCallAlerter';

function RoomContent() {
    const params = useParams();
    const roomId = params.roomId as string;
    const isSoccerRoom = roomId === 'soccer'; // Identification Logic
    
    const { isAuthenticated, token } = useAuth();
    const { socket } = useSocket();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [activeSidebar, setActiveSidebar] = useState<'chat' | 'standings'>('chat');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchPredictions = async () => {
        // Only fetch manual custom polls if NOT in the pure soccer room
        if (isSoccerRoom) return;

        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions`);
            const data = await res.json();
            setPredictions(Array.isArray(data) ? data : (data.predictions || []));
        } catch (err) {
            setPredictions([]);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, [roomId, isSoccerRoom]);

    useEffect(() => {
        if (!socket || isSoccerRoom) return;
        socket.on('prediction_new', (newPrediction: any) => {
            setPredictions(prev => [newPrediction, ...prev]);
        });
        return () => { socket.off('prediction_new'); };
    }, [socket, isSoccerRoom]);

    return (
        <div className={styles.container}>
            {/* Haptic Alerts only for Creator Rooms */}
            {!isSoccerRoom && <FlashCallAlerter />}

            <header className={styles.minimalHeader}>
                <h1 className={styles.arenaTitle}>{roomId.toUpperCase()} ARENA</h1>
                <div className={styles.headerActions}>
                    {isAuthenticated ? <UserTray /> : <button onClick={() => setIsLoginOpen(true)} className={styles.loginBtn}>LOGIN</button>}
                </div>
            </header>

            <main className={styles.dualLayout}>
                {/* PRIMARY COLUMN: MATCHES OR CREATOR CONTENT */}
                <div className={styles.mainContent}>
                    <SponsorWidget roomId={roomId} />
                    
                    {/* ONLY SHOW CUSTOM POLLS IN CREATOR ROOMS */}
                    {!isSoccerRoom && predictions.length > 0 && (
                        <div className={styles.flashSection}>
                            <h3 className={styles.sectionHeading}>Active Live Polls</h3>
                            {predictions.map(p => (
                                <CustomPollCard key={p.id} prediction={p} roomId={roomId} onVote={() => {}} />
                            ))}
                        </div>
                    )}

                    <div className={styles.matchesWrapper}>
                        {isSoccerRoom ? (
                            <>
                                <h3 className={styles.sectionHeading}>Official Match Schedule</h3>
                                <MatchList />
                            </>
                        ) : (
                            <div className={styles.creatorWelcome}>
                                <h3 className={styles.sectionHeading}>Creator Event Hub</h3>
                                <p className={styles.welcomeText}>Watch the stream and participate in live polls below!</p>
                                {/* We can add specialized Creator modules here later */}
                            </div>
                        )}
                    </div>
                </div>

                {/* SECONDARY COLUMN: SOCIAL & STANDINGS */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarTabs}>
                        <button 
                            className={`${styles.sideTab} ${activeSidebar === 'chat' ? styles.activeSideTab : ''}`}
                            onClick={() => setActiveSidebar('chat')}
                        >
                            FAN ARENA
                        </button>
                        <button 
                            className={`${styles.sideTab} ${activeSidebar === 'standings' ? styles.activeSideTab : ''}`}
                            onClick={() => setActiveSidebar('standings')}
                        >
                            STANDINGS
                        </button>
                    </div>
                    
                    <div className={styles.sidebarContent}>
                        {activeSidebar === 'chat' ? <RoomChat roomId={roomId} /> : <Leaderboard />}
                    </div>
                </aside>
            </main>

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
