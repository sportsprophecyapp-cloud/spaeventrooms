'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import MatchList from '../../components/MatchList';
import AnnouncementsSection from '../../components/AnnouncementsSection';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from '../../components/LoginModal';

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { user, logout, isAuthenticated } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

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
                    <AnnouncementsSection roomId={roomId} />
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
