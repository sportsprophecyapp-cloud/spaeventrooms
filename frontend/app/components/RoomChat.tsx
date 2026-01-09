'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './RoomChat.module.css';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface ChatMessage {
    id: number;
    user_id: number;
    username: string;
    content: string;
    current_level: number;
    permissions: string[];
    equipped_badge_image_url?: string; // NEW
    created_at: string;
}

// ... (RoomChatProps)

const RoomChat: React.FC<RoomChatProps> = ({ roomId }) => {
    // ... (state and effects)

    return (
        <div className={`${styles.container} glass`}>
            {/* ... (header) */}

            <div className={styles.feed} ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={styles.message}>
                        <div className={styles.meta}>
                            {msg.equipped_badge_image_url && (
                                <img src={msg.equipped_badge_image_url} alt="Equipped Badge" className={styles.equippedBadge} />
                            )}
                            <span className={styles.level}>Lvl {msg.current_level}</span>
                            <span className={styles.username}>@{msg.username}</span>
                        </div>
                        <p className={styles.content}>{msg.content}</p>
                    </div>
                ))}
            </div>

            {/* ... (input area) */}
        </div>
    );
};

export default RoomChat;
