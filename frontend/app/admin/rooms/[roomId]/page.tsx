'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';

const AdminRoomPage = () => {
    const params = useParams();
    const roomId = params.roomId as string;
    const [title, setTitle] = useState('');
    const [type, setType] = useState('general');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, title, description })
            });

            if (!res.ok) throw new Error('Failed to create announcement');

            setMessage('Announcement published successfully!');
            setTitle('');
            setDescription('');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Admin: {roomId.toUpperCase()} Room</h1>
            </header>

            <div className={styles.main}>
                <section className={styles.editor}>
                    <h2>Create Announcement</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Type</label>
                            <select value={type} onChange={e => setType(e.target.value)}>
                                <option value="general">General Update</option>
                                <option value="live">Live Now 🔴</option>
                                <option value="scheduled">Next Event ⏰</option>
                                <option value="sponsor">Sponsor 🏆</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. Manchester Derby LIVE"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Details about the event..."
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Publishing...' : 'Publish to Room'}
                        </button>

                        {message && <p className={styles.feedback}>{message}</p>}
                    </form>
                </section>
            </div>
        </div>
    );
};

export default AdminRoomPage;
