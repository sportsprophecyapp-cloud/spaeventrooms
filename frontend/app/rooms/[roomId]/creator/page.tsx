'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; // Path confirmed correct for rooms/[roomId]/creator
import { SocketProvider, useSocket } from '../../../context/SocketContext';
import styles from './page.module.css';

function CreatorDashboardContent() {
    const { roomId } = useParams();
    const { user, token } = useAuth();
    const { socket } = useSocket();
    const [question, setQuestion] = useState('');
    const [optionA, setOptionA] = useState('YES');
    const [optionB, setOptionB] = useState('NO');
    const [isActive, setIsActive] = useState(false);
    const [stats, setStats] = useState({ home: 50, away: 50 });

    useEffect(() => {
        if (!socket) return;

        socket.on('flash_call_update', (data) => {
            setStats(data);
        });

        return () => {
            socket.off('flash_call_update');
        };
    }, [socket]);

    const handleStartCall = () => {
        if (!question.trim()) return;
        
        setIsActive(true);
        socket?.emit('flash_call_start', {
            roomId,
            question,
            optionA,
            optionB,
            duration: 60
        });
    };

    const handleEndCall = () => {
        setIsActive(false);
        setQuestion('');
        socket?.emit('flash_call_end', { roomId });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>CREATOR REMOTE</h1>
                <p className={styles.subtitle}>Room: {roomId?.toString().toUpperCase()}</p>
            </header>

            <main className={styles.controlPanel}>
                {!isActive ? (
                    <div className={`${styles.card} glass`}>
                        <h3>Launch Flash Call</h3>
                        <div className={styles.inputGroup}>
                            <label>Question</label>
                            <input 
                                value={question} 
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g. Do I win this next match?"
                                className={styles.mainInput}
                            />
                        </div>
                        <div className={styles.optionsRow}>
                            <div className={styles.inputGroup}>
                                <label>Option A</label>
                                <input value={optionA} onChange={(e) => setOptionA(e.target.value)} className={styles.sideInput} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Option B</label>
                                <input value={optionB} onChange={(e) => setOptionB(e.target.value)} className={styles.sideInput} />
                            </div>
                        </div>
                        <button onClick={handleStartCall} className={styles.launchBtn}>
                            🚀 BROADCAST TO ARENA
                        </button>
                    </div>
                ) : (
                    <div className={`${styles.card} ${styles.activeCard} glass`}>
                        <div className={styles.liveStatus}>
                            <span className={styles.pulse}></span> LIVE ON STREAM
                        </div>
                        <h2 className={styles.activeQuestion}>{question}</h2>
                        
                        <div className={styles.statsPreview}>
                            <div className={styles.statLine}>
                                <span>{optionA}</span>
                                <span>{stats.home}%</span>
                            </div>
                            <div className={styles.barContainer}>
                                <div className={styles.bar} style={{ width: `${stats.home}%` }}></div>
                            </div>
                            <div className={styles.statLine}>
                                <span>{optionB}</span>
                                <span>{stats.away}%</span>
                            </div>
                        </div>

                        <button onClick={handleEndCall} className={styles.stopBtn}>
                            🛑 STOP & CLEAR OVERLAY
                        </button>
                    </div>
                )}

                <section className={`${styles.setupCard} glass`}>
                    <h3>OBS Instructions</h3>
                    <p>Add this URL as a <strong>Browser Source</strong> in OBS:</p>
                    <code className={styles.code}>
                        {typeof window !== 'undefined' ? `${window.location.origin}/rooms/${roomId}/overlay` : ''}
                    </code>
                    <ul className={styles.steps}>
                        <li>Width: 800 | Height: 300</li>
                        <li>Check "Shutdown source when not visible"</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default function CreatorDashboard() {
    const params = useParams();
    const roomId = params.roomId as string;

    return (
        <SocketProvider roomId={roomId}>
            <CreatorDashboardContent />
        </SocketProvider>
    );
}
