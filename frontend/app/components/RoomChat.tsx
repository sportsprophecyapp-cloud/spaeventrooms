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
    equipped_badge_image_url?: string;
    created_at: string;
}

interface RoomChatProps {
    roomId: string;
}

const RoomChat: React.FC<RoomChatProps> = ({ roomId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/rooms/${roomId}/chat`);
                if (res.ok) {
                    setMessages(await res.json());
                } else {
                    setError('Could not load chat history.');
                }
            } catch (err) {
                setError('Could not connect to the server to load chat history.');
            } finally {
                setLoading(false);
            }
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
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                const sentMessage = await res.json();
                setMessages(prev => [...prev, sentMessage]);
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Failed to send message.');
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
                {loading ? <div className={styles.loading}>Accessing Arena Channel...</div> : 
                 messages.map((msg) => (
                    <div key={msg.id} className={styles.message}>
                        <div className={styles.meta}>
                            {msg.equipped_badge_image_url && (
                                <img src={msg.equipped_badge_image_url} alt="Badge" className={styles.equippedBadge} />
                            )}
                            <span className={styles.level}>Lvl {msg.current_level}</span>
                            <span className={styles.username}>@{msg.username}</span>
                        </div>
                        <p className={styles.content}>{msg.content}</p>
                    </div>
                ))}
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
