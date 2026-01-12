'use client';

import React, { useState, useEffect } from 'react';
import styles from './DrawRoom.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Draw {
    id: number;
    title: string;
    prize: string;
    description: string;
    room_id: string;
    status: 'active' | 'completed';
    entry_count?: number;
    sponsor_logo?: string;
    sponsor_name?: string;
    draw_date?: string;
    prize_image?: string;
}

const DrawRoom = () => {
    const { token, user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [draws, setDraws] = useState<Draw[]>([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [enteringId, setEnteringId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // ADMIN STATE
    const [editingDrawId, setEditingDrawId] = useState<number | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editStatus, setEditStatus] = useState<'active' | 'completed'>('active');

    useEffect(() => {
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchData = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                // Fetch active draws
                const drawRes = await fetch(`${apiUrl}/api/gamification/draws/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                let activeDraws = [];
                if (drawRes.ok) {
                    const data = await drawRes.json();
                    activeDraws = data.draws || [];
                }

                setDraws(activeDraws);

                // Fetch user tickets
                const ticketRes = await fetch(`${apiUrl}/api/gamification/tickets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (ticketRes.ok) {
                    const data = await ticketRes.json();
                    setTicketCount(data.count || 0);
                }
            } catch (err) {
                console.error('Error fetching draw data:', err);
                setDraws([]);
            }
        };

        fetchData();
    }, [token]);

    const handleEnter = async (drawId: number) => {
        if (!token) return;
        setEnteringId(drawId);
        setMessage(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/gamification/draws/${drawId}/enter`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                setTicketCount(prev => Math.max(0, prev - 1));
                setMessage({ text: 'GOOD LUCK! Entry Confirmed.', type: 'success' });
                // Refresh user balances in AuthContext
                if (user) {
                    await refreshUser();
                }
            } else {
                setMessage({ text: data.error || 'Entry failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error. Try again!', type: 'error' });
        } finally {
            setEnteringId(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleUpdate = async (drawId: number) => {
        if (!token) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/gamification/draws/${drawId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    draw_date: editDate ? new Date(editDate).toISOString() : undefined,
                    status: editStatus
                })
            });

            if (res.ok) {
                setMessage({ text: 'Draw Updated!', type: 'success' });
                setEditingDrawId(null);
                // Refresh list
                const drawRes = await fetch(`${apiUrl}/api/gamification/draws/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (drawRes.ok) {
                    const data = await drawRes.json();
                    setDraws(data.draws || []);
                }
            } else {
                setMessage({ text: 'Update failed', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Update Error', type: 'error' });
        }
    };


    return (
        <div className={styles.drawRoom}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>{t('back_to_leagues')}</button>
                <h1>{t('draw_room_title')}</h1>
                <div className={styles.headerRight}>
                    <Link href="/sponsors/pricing" className={styles.sponsorBtn}>
                        💎 Sponsor This Arena
                    </Link>
                    <div className={styles.ticketBadge}>
                        <span className={styles.ticketIcon}>🎫</span>
                        <div className={styles.ticketInfo}>
                            <span className={styles.ticketLabel}>{t('your_tickets')}</span>
                            <span className={styles.ticketValue}>{ticketCount}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.drawGrid}>
                    {draws.map(draw => {
                        // FIX: Only show DEMO if explicitly named in description. DO NOT check ID < 100.
                        const isDemo = draw.description.toLowerCase().includes('megabet') ||
                            draw.description.toLowerCase().includes('fanatics');

                        // Calculate countdown
                        let countdown = '';
                        if (draw.draw_date) {
                            const now = new Date().getTime();
                            const target = new Date(draw.draw_date).getTime();
                            const diff = target - now;

                            if (diff > 0) {
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                countdown = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
                            } else {
                                countdown = 'Drawing soon!';
                            }
                        }

                        return (
                            <div key={draw.id} className={`${styles.drawCard} glass`}>
                                {/* ADMIN EDIT OVERLAY */}
                                {user?.role === 'admin' && (
                                    <div className={styles.adminControls}>
                                        <button
                                            className={styles.adminEditBtn}
                                            onClick={() => {
                                                setEditingDrawId(draw.id);
                                                setEditStatus(draw.status);
                                                // Default to +1 hour if no date
                                                const d = draw.draw_date ? new Date(draw.draw_date) : new Date(Date.now() + 3600000);
                                                setEditDate(d.toISOString().slice(0, 16)); // Format for datetime-local
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>
                                )}

                                {editingDrawId === draw.id && (
                                    <div className={styles.editOverlay}>
                                        <h4>Admin Edit</h4>
                                        <label>Countdown Time:</label>
                                        <input
                                            type="datetime-local"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            style={{ color: 'black', marginBottom: '10px' }}
                                        />
                                        <label>Status:</label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as any)}
                                            style={{ color: 'black', marginBottom: '10px' }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleUpdate(draw.id)} style={{ background: 'green', padding: '5px' }}>Save</button>
                                            <button onClick={() => setEditingDrawId(null)} style={{ background: 'red', padding: '5px' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Sponsor Logo */}
                                {draw.sponsor_logo && (
                                    <img
                                        src={draw.sponsor_logo}
                                        className={styles.sponsorLogo}
                                        alt={draw.sponsor_name || 'Sponsor'}
                                    />
                                )}

                                {isDemo && (
                                    <div className={styles.demoBadge}>[TESTING] DEMO</div>
                                )}

                                {draw.prize_image ? (
                                    <img src={draw.prize_image} className={styles.prizeImage} alt="Prize" style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 10px' }} />
                                ) : (
                                    <div className={styles.prizeIcon}>🎁</div>
                                )}

                                <h3>{draw.title} {isDemo && '(TEST)'}</h3>
                                <p className={styles.prizeName}>{draw.prize}</p>
                                <p className={styles.drawDesc}>{draw.description}</p>

                                {/* Entry Count */}
                                <div className={styles.entryCount}>
                                    👥 {draw.entry_count || 0} {draw.entry_count === 1 ? 'entry' : 'entries'}
                                </div>

                                {/* Countdown Timer */}
                                {countdown && (
                                    <div className={styles.countdown}>
                                        ⏰ Draws in: <strong>{countdown}</strong>
                                    </div>
                                )}

                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.enterBtn}
                                        disabled={ticketCount === 0 || enteringId === draw.id}
                                        onClick={() => handleEnter(draw.id)}
                                    >
                                        {enteringId === draw.id ? 'ENTERING...' : t('enter_draw')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {draws.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎁</div>
                            <h3>No Active Draws</h3>
                            <p>Check back soon for new prizes and events!</p>
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`${styles.messageToast} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

            </main>
        </div>
    );
};

export default DrawRoom;
