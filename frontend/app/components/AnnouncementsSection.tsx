'use client';

import React, { useEffect, useState } from 'react';
import AnnouncementCard from './AnnouncementCard';
import styles from './AnnouncementsSection.module.css';
import { useSocket } from '../context/SocketContext';
import SkeletonCard from './SkeletonCard';

interface Announcement {
    id: number;
    type: 'live' | 'scheduled' | 'general' | 'sponsor';
    title: string;
    description: string;
    published_at: string;
    scheduled_for?: string;
}

interface Props {
    roomId: string;
}

const AnnouncementsSection: React.FC<Props> = ({ roomId }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${apiUrl}/api/rooms/${roomId}/announcements`)
            .then(res => res.json())
            .then(data => {
                // Deduplicate fetched announcements by ID AND Content (Title + Description)
                // This handles cases where backend might send multiple entries for same "logical" announcement with different IDs
                const uniqueData = data.filter((a: Announcement, index: number, self: Announcement[]) =>
                    index === self.findIndex((t) => (
                        t.id === a.id || (t.title === a.title && t.description === a.description)
                    ))
                );
                setAnnouncements(uniqueData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch announcements:', err);
                setLoading(false);
            });
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('announcement_new', (newAnnouncement: Announcement) => {
            console.log('Real-time announcement received:', newAnnouncement);
            setAnnouncements(prev => {
                // Prevent duplicate if already exists
                if (prev.some(a => a.id === newAnnouncement.id)) return prev;
                return [newAnnouncement, ...prev];
            });
        });

        return () => {
            socket.off('announcement_new');
        };
    }, [socket]);

    if (loading) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <span className={styles.icon}>📢</span>
                    <h2 className={styles.title}>Announcements</h2>
                </div>
                <div className={styles.list}>
                    <SkeletonCard type="announcement" />
                    <SkeletonCard type="announcement" />
                    <SkeletonCard type="announcement" />
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.icon}>📢</span>
                <h2 className={styles.title}>Announcements</h2>
            </div>

            <div className={styles.list}>
                {announcements.length === 0 ? (
                    <p className={styles.empty}>No announcements yet.</p>
                ) : (
                    announcements.map(a => (
                        <AnnouncementCard key={a.id} announcement={a} />
                    ))
                )}
            </div>
        </section>
    );
};

export default AnnouncementsSection;
