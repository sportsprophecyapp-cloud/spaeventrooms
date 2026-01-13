'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './MessageUserModal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: { id: number; username: string; };
}

const MessageUserModal = ({ isOpen, onClose, user }: Props) => {
    const { token } = useAuth();
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSendMessage = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users/${user.id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            if (res.ok) {
                setStatus('Message sent successfully!');
                setTimeout(() => {
                    onClose();
                    setStatus('');
                    setMessage('');
                }, 2000);
            } else {
                setStatus('Failed to send message.');
            }
        } catch (e) {
            setStatus('An error occurred.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} glass`}>
                <h3>Send Message to @{user.username}</h3>
                <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                />
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.sendBtn} onClick={handleSendMessage}>Send</button>
                </div>
                {status && <p className={styles.status}>{status}</p>}
            </div>
        </div>
    );
};

export default MessageUserModal;
