'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalSocket } from '@/app/context/GlobalSocketProvider';
import styles from './ToastNotification.module.css';

interface Announcement {
    message: string;
    timestamp: string;
}

interface ToastProps {
    message?: string | null;
    type?: 'info' | 'error' | 'success';
    onClose?: () => void;
}

const ToastNotification = ({ message: propMessage, type = 'info', onClose }: ToastProps = {}) => {
    // Global Socket Logic (Only overrides if no propMessage is passed)
    const { socket } = useGlobalSocket();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    // Only subscribe to socket if we are acting as the global toaster (no props)
    const isGlobal = propMessage === undefined;

    useEffect(() => {
        if (!isGlobal || !socket) return;

        const handleAnnouncement = (data: Announcement) => {
            setAnnouncement(data);
            setTimeout(() => {
                setAnnouncement(null);
            }, 10000); // Hide after 10 seconds
        };

        socket.on('global_announcement', handleAnnouncement);

        return () => {
            socket.off('global_announcement', handleAnnouncement);
        };
    }, [socket, isGlobal]);

    // Derived state
    const displayMessage = propMessage || announcement?.message;
    const isError = type === 'error';

    if (!displayMessage) return null;

    return (
        <div className={`${styles.toast} ${isError ? styles.error : ''}`}>
            {onClose && (
                <button className={styles.closeBtn} onClick={onClose}>×</button>
            )}
            <div className={styles.header}>
                {isError ? '⚠️ ERROR' : '📢 SITE ANNOUNCEMENT'}
            </div>
            <div className={styles.body}>{displayMessage}</div>
        </div>
    );
};

export default ToastNotification;
