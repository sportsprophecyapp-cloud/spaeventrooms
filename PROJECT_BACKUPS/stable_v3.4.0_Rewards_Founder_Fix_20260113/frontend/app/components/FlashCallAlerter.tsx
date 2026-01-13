'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import styles from './FlashCallAlerter.module.css';

export default function FlashCallAlerter() {
    const { socket } = useSocket();
    const { isAuthenticated, token } = useAuth();
    const [activeCall, setActiveCall] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('flash_call_start', (data) => {
            // Haptic Feedback for mobile
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            setActiveCall(data);
            setHasVoted(false);
        });

        socket.on('flash_call_end', () => {
            setActiveCall(null);
        });

        return () => {
            socket.off('flash_call_start');
            socket.off('flash_call_end');
        };
    }, [socket]);

    const handleVote = async (option: string) => {
        if (!isAuthenticated || hasVoted) return;

        setHasVoted(true);
        
        // Emit vote directly via socket for instant OBS updates
        socket?.emit('flash_call_vote', {
            roomId: activeCall.roomId,
            option: option === activeCall.optionA ? 'home' : 'away'
        });

        // Small delay then close
        setTimeout(() => setActiveCall(null), 1500);
    };

    if (!activeCall) return null;

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} animate-slide`}>
                <div className={styles.header}>
                    <span className={styles.pulse}></span>
                    <h3>FLASH CALL</h3>
                </div>
                
                <h2 className={styles.question}>{activeCall.question}</h2>
                <p className={styles.timer}>Ends when creator stops the call</p>

                <div className={styles.options}>
                    <button 
                        className={`${styles.optionBtn} ${hasVoted ? styles.disabled : ''}`}
                        onClick={() => handleVote(activeCall.optionA)}
                        disabled={hasVoted}
                    >
                        {activeCall.optionA}
                    </button>
                    <button 
                        className={`${styles.optionBtn} ${hasVoted ? styles.disabled : ''}`}
                        onClick={() => handleVote(activeCall.optionB)}
                        disabled={hasVoted}
                    >
                        {activeCall.optionB}
                    </button>
                </div>

                {hasVoted && <p className={styles.success}>Call Transmitted! Check the Stream. 🚀</p>}
            </div>
        </div>
    );
}
