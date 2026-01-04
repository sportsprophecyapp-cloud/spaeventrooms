'use client';

import React from 'react';
import styles from './AnnouncementCard.module.css';

interface Announcement {
    id: number;
    type: 'live' | 'scheduled' | 'general' | 'sponsor';
    title: string;
    description: string;
    published_at: string;
    scheduled_for?: string;
}

interface Props {
    announcement: Announcement;
}

const AnnouncementCard: React.FC<Props> = ({ announcement }) => {
    const getTypeIcon = () => {
        switch (announcement.type) {
            case 'live': return '🔴';
            case 'scheduled': return '⏰';
            case 'sponsor': return '🏆';
            default: return '📢';
        }
    };

    const getTypeName = () => {
        switch (announcement.type) {
            case 'live': return 'LIVE NOW';
            case 'scheduled': return 'NEXT EVENT';
            case 'sponsor': return 'THIS WEEK\'S SPONSOR';
            default: return 'ANNOUNCEMENT';
        }
    };

    return (
        <div className={`${styles.card} ${styles[announcement.type]}`}>
            <div className={styles.typeHeader}>
                <span className={styles.icon}>{getTypeIcon()}</span>
                <span className={styles.typeName}>{getTypeName()}</span>
            </div>
            <h3 className={styles.title}>{announcement.title}</h3>
            <p className={styles.description}>{announcement.description}</p>
            {announcement.scheduled_for && (
                <div className={styles.timeTag}>
                    {new Date(announcement.scheduled_for).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default AnnouncementCard;
