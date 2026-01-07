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
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error('Chat history fetch failed:', err);
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

        return () => {
            socket.off('chat_message');
        };
    }, [socket]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !isAuthenticated) return;

        const content = newMessage;
        setNewMessage(''); 

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/api/rooms/${roomId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return (
        <div className={`${styles.container} glass`}>
            <div className={styles.header}>
                <span className={styles.statusDot}></span>
                <h3>LIVE FAN ARENA</h3>
            </div>

            <div className={styles.feed} ref={scrollRef}>
                {loading ? (
                    <div className={styles.loading}>Accessing Arena Channel...</div>
                ) : messages.length === 0 ? (
                    <div className={styles.empty}>Arena is quiet. Make your call!</div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={styles.message}>
                            <div className={styles.meta}>
                                <span className={styles.level}>Lvl {msg.current_level}</span>
                                <span className={styles.username}>@{msg.username}</span>
                            </div>
                            <p className={styles.content}>{msg.content}</p>
                        </div>
                    ))
                )}
            </div>

            {isAuthenticated ? (
                <form onSubmit={handleSendMessage} className={styles.inputArea}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Say something to the arena..."
                        className={styles.input}
                        maxLength={200}
                    />
                    <button type="submit" className={styles.sendBtn}>SEND</button>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    Sign in to join the conversation.
                </div>
            )}
        </div>
    );
};

export default RoomChat;
