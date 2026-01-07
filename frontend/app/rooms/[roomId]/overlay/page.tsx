'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SocketProvider, useSocket } from '../../../context/SocketContext';
import styles from './page.module.css';

function OverlayContent() {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const [activeCall, setActiveCall] = useState<any>(null);
    const [stats, setStats] = useState({ home: 50, away: 50 });

    useEffect(() => {
        if (!socket) return;

        // Listen for Creator-Only Flash Calls
        socket.on('flash_call_start', (data) => {
            setActiveCall(data);
            setStats({ home: 50, away: 50 }); // Reset stats for new call
        });

        socket.on('flash_call_update', (data) => {
            setStats(data);
        });

        socket.on('flash_call_end', () => {
            // Wait 5 seconds then hide the overlay stats
            setTimeout(() => setActiveCall(null), 5000);
        });

        return () => {
            socket.off('flash_call_start');
            socket.off('flash_call_update');
            socket.off('flash_call_end');
        };
    }, [socket]);

    if (!activeCall) return null;

    return (
        <div className={styles.overlayContainer}>
            <div className={styles.pollGlass}>
                <div className={styles.header}>
                    <span className={styles.liveBadge}>LIVE CALL</span>
                    <h2 className={styles.question}>{activeCall.question}</h2>
                </div>

                <div className={styles.statBar}>
                    <div className={styles.segment} style={{ width: `${stats.home}%`, background: 'var(--accent)' }}>
                        <span className={styles.percent}>{stats.home}%</span>
                        <span className={styles.label}>{activeCall.optionA}</span>
                    </div>
                    <div className={styles.segment} style={{ width: `${stats.away}%`, background: 'rgba(255,255,255,0.1)' }}>
                        <span className={styles.percent}>{stats.away}%</span>
                        <span className={styles.label}>{activeCall.optionB}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OBSOverlayPage() {
    const params = useParams();
    const roomId = params.roomId as string;

    return (
        <SocketProvider roomId={roomId}>
            <div className={styles.transparentWrapper}>
                <OverlayContent />
            </div>
        </SocketProvider>
    );
}
