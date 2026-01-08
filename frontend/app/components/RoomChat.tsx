'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './RoomChat.module.css';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface ChatMessage {
    id: number;
    username: string;
    content: string;
    current_level: number;
    created_at: string;
}

interface RoomChatProps {
    roomId: string;
}

const RoomChat: React.FC<RoomChatProps> = ({ roomId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false); // NEW
    const [error, setError] = useState<string | null>(null); // NEW
    const { isAuthenticated, token } = useAuth();
    const { socket } = useSocket();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchHistory = async () => {
            // ... (existing history fetch logic)
        };
        fetchHistory();
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;
        socket.on('chat_message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => { socket.off('chat_message'); };
    }, [socket]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !isAuthenticated || isSending) return;

        setIsSending(true);
        setError(null);

        const content = newMessage;
        setNewMessage(''); 

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content })
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Failed to send message. Please try again.');
            } else {
                // Success, message will be broadcast via socket.
            }
        } catch (err) {
            setError('Could not connect to the chat server.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={`${styles.container} glass`}>
            <div className={styles.header}>
                <span className={styles.statusDot}></span>
                <h3>LIVE FAN ARENA</h3>
            </div>

            <div className={styles.feed} ref={scrollRef}>
                {/* ... (existing message mapping logic) ... */}
            </div>

            {isAuthenticated ? (
                <form onSubmit={handleSendMessage} className={styles.inputArea}>
                    {error && <div className={styles.errorMessage}>{error}</div>} 
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Say something to the arena..."
                        className={styles.input}
                        maxLength={200}
                        disabled={isSending}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={isSending}>
                        {isSending ? '...' : 'SEND'}
                    </button>
                </form>
            ) : (
                <div className={styles.loginPrompt}>Sign in to join the conversation.</div>
            )}
        </div>
    );
};

export default RoomChat;
