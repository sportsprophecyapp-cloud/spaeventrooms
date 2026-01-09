'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './RoomChat.module.css';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getBadgeForUser } from '../helpers/badgeHelper'; // NEW

interface ChatMessage {
    id: number;
    user_id: number; // NEW - Important for badge logic
    username: string;
    content: string;
    current_level: number;
    permissions: string[];
    created_at: string;
}

interface RoomChatProps {
    roomId: string;
}

const RoomChat: React.FC<RoomChatProps> = ({ roomId }) => {
    // ... (state and effects)

    return (
        <div className={`${styles.container} glass`}>
            {/* ... (header) */}

            <div className={styles.feed} ref={scrollRef}>
                {messages.map((msg) => {
                    const tieredBadge = getBadgeForUser(msg.user_id); // NEW
                    return (
                        <div key={msg.id} className={styles.message}>
                            <div className={styles.meta}>
                                {msg.permissions?.includes('day_one') && (
                                    <span className={`${styles.badge} ${styles.dayOneBadge}`}>DAY ONE</span>
                                )}
                                {msg.permissions?.includes('super_admin') && (
                                    <span className={`${styles.badge} ${styles.adminBadge}`}>ADMIN</span>
                                )}
                                {tieredBadge && !msg.permissions?.includes('day_one') && !msg.permissions?.includes('super_admin') && (
                                    <span className={`${styles.badge} ${styles[tieredBadge.style]}`}>{tieredBadge.text}</span>
                                )} 
                                <span className={styles.level}>Lvl {msg.current_level}</span>
                                <span className={styles.username}>@{msg.username}</span>
                            </div>
                            <p className={styles.content}>{msg.content}</p>
                        </div>
                    );
                })}
            </div>

            {/* ... (input area) */}
        </div>
    );
};

export default RoomChat;
