'use client';
import { use, useEffect, useState } from 'react';
import styles from './page.module.css';
import MatchList from '../../components/MatchList';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Socket connection logic will go here
        console.log(`Connecting to room: ${roomId}`);
    }, [roomId]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to {roomId.toUpperCase()} Room</h1>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <MatchList />
                </div>
                <div className={styles.card}>
                    <h2>Leaderboard</h2>
                    <p>Rankings coming soon.</p>
                </div>
            </div>
        </div>
    );
}
