'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

const AnnouncePage = () => {
    const { token } = useAuth();
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSendAnnouncement = async () => {
        if (!message.trim()) return;
        setStatus('Sending...');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/announce`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message })
            });

            if (res.ok) {
                setStatus(`Announcement sent: "${message}"`);
                setMessage('');
            } else {
                const err = await res.json();
                setStatus(`Failed to send: ${err.message}`);
            }
        } catch (e) {
            setStatus('Failed to connect to the server.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <h2>Site-Wide Announcement</h2>
                <p>This message will be broadcast to all currently online users.</p>
                <textarea 
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your announcement here..."
                />
                <button onClick={handleSendAnnouncement} className={styles.sendBtn}>SEND TO ALL USERS</button>
                {status && <p className={styles.status}>{status}</p>}
            </div>
        </div>
    );
};

export default AnnouncePage;
