'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalSocket } from '@/app/context/GlobalSocketProvider';
import styles from './ToastNotification.module.css';

interface Announcement {
    message: string;
    timestamp: string;
}

const ToastNotification = () => {
    const { socket } = useGlobalSocket();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        if (!socket) return;

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
    }, [socket]);

    if (!announcement) return null;

    return (
        <div className={styles.toast}>
            <div className={styles.header}>📢 SITE ANNOUNCEMENT</div>
            <div className={styles.body}>{announcement.message}</div>
        </div>
    );
};

export default ToastNotification;
