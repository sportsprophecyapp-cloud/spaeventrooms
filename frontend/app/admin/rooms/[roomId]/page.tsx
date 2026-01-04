'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';

const AdminRoomPage = () => {
    const params = useParams();
    const roomId = params.roomId as string;
    const [activeTab, setActiveTab] = useState<'announcements' | 'predictions'>('announcements');

    // Announcement State
    const [title, setTitle] = useState('');
    const [type, setType] = useState('general');
    const [description, setDescription] = useState('');

    // Prediction State
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [closesIn, setClosesIn] = useState(10);
    const [predictions, setPredictions] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const fetchPredictions = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions`);
            const data = await res.json();
            setPredictions(data);
        } catch (err) {
            console.error('Error fetching predictions:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('auth_token');

        if (!token) {
            setMessage('Error: You must be logged in to post announcements.');
            setLoading(false);
            return;
        }

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

    const handlePredictionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const filteredOptions = options.filter(o => o.trim() !== '');

        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question, options: filteredOptions, closes_in_minutes: closesIn })
            });

            if (!res.ok) throw new Error('Failed to create prediction');

            setMessage('Prediction deployed to room!');
            setQuestion('');
            setOptions(['', '']);
            fetchPredictions();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRevealAnswer = async (id: number, answer: string) => {
        try {
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions/${id}/answer`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ correctAnswer: answer })
            });

            if (!res.ok) throw new Error('Failed to reveal answer');
            fetchPredictions();
        } catch (err: any) {
            alert(`Error revealing answer: ${err.message}`);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Admin: {roomId.toUpperCase()} Room</h1>
                <div className={styles.tabs}>
                    <button
                        className={activeTab === 'announcements' ? styles.activeTab : ''}
                        onClick={() => setActiveTab('announcements')}
                    >
                        Announcements
                    </button>
                    <button
                        className={activeTab === 'predictions' ? styles.activeTab : ''}
                        onClick={() => {
                            setActiveTab('predictions');
                            fetchPredictions();
                        }}
                    >
                        Predictions
                    </button>
                </div>
            </header>

            <div className={styles.main}>
                {activeTab === 'announcements' ? (
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
                ) : (
                    <div className={styles.predictionsLayout}>
                        <section className={styles.editor}>
                            <h2>Create New Prediction</h2>
                            <form onSubmit={handlePredictionSubmit} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label>Question</label>
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        required
                                        placeholder="e.g. Who wins the next corner?"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Options</label>
                                    {options.map((opt, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...options];
                                                newOpts[idx] = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            placeholder={`Option ${idx + 1}`}
                                            required={idx < 2}
                                            style={{ marginBottom: '0.5rem' }}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setOptions([...options, ''])}
                                        className={styles.addOptionBtn}
                                    >
                                        + Add Option
                                    </button>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Closes In (Minutes)</label>
                                    <input
                                        type="number"
                                        value={closesIn}
                                        onChange={e => setClosesIn(parseInt(e.target.value))}
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Deploying...' : 'Deploy Prediction'}
                                </button>
                                {message && <p className={styles.feedback}>{message}</p>}
                            </form>
                        </section>

                        <section className={styles.predictionsList}>
                            <h2>Active Predictions</h2>
                            {predictions.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No predictions found.</p>}
                            {predictions.map((p: any) => (
                                <div key={p.id} className={styles.predictionCard}>
                                    <h4>{p.question}</h4>
                                    <div className={styles.revealSection}>
                                        <p>Reveal Answer:</p>
                                        <div className={styles.answerButtons}>
                                            {(typeof p.options === 'string' ? JSON.parse(p.options) : p.options).map((opt: string) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleRevealAnswer(p.id, opt)}
                                                    className={p.correct_answer === opt ? styles.correctBtn : ''}
                                                    disabled={!!p.correct_answer}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRoomPage;
